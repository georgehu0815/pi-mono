import { AzureCliCredential, getBearerTokenProvider, ManagedIdentityCredential } from "@azure/identity";
import OpenAI, { AzureOpenAI } from "openai";
import type { ResponseCreateParamsStreaming } from "openai/resources/responses/responses.js";
import { supportsXhigh } from "../models.js";
import type {
	Api,
	AssistantMessage,
	Context,
	Model,
	SimpleStreamOptions,
	StreamFunction,
	StreamOptions,
} from "../types.js";
import { AssistantMessageEventStream } from "../utils/event-stream.js";
import { AZURE_OPENAI_MANAGED_IDENTITY_CLIENT_ID, AZURE_OPENAI_SCOPE } from "./azure-openai-models.js";
import { convertResponsesMessages, convertResponsesTools, processResponsesStream } from "./openai-responses-shared.js";
import { buildBaseOptions, clampReasoning } from "./simple-options.js";

const DEFAULT_AZURE_API_VERSION = "v1";
const AZURE_TOOL_CALL_PROVIDERS = new Set(["openai", "openai-codex", "opencode", "azure-openai-responses"]);

// Create credential instance based on environment
function getAzureCredential(): AzureCliCredential | ManagedIdentityCredential {
	// Check if we're in production (only relevant for server-side)
	const isProduction = typeof process !== "undefined" && process.env?.NODE_ENV === "production";

	if (isProduction) {
		console.log("[Azure OpenAI Responses] Using ManagedIdentityCredential - azure-openai-responses.ts:32");
		return new ManagedIdentityCredential(AZURE_OPENAI_MANAGED_IDENTITY_CLIENT_ID);
	} else {
		console.log("[Azure OpenAI Responses] Using AzureCliCredential - azure-openai-responses.ts:35");
		return new AzureCliCredential();
	}
}

function parseDeploymentNameMap(value: string | undefined): Map<string, string> {
	const map = new Map<string, string>();
	if (!value) return map;
	for (const entry of value.split(",")) {
		const trimmed = entry.trim();
		if (!trimmed) continue;
		const [modelId, deploymentName] = trimmed.split("=", 2);
		if (!modelId || !deploymentName) continue;
		map.set(modelId.trim(), deploymentName.trim());
	}
	return map;
}

function resolveDeploymentName(model: Model<"azure-openai-responses">, options?: AzureOpenAIResponsesOptions): string {
	if (options?.azureDeploymentName) {
		return options.azureDeploymentName;
	}
	// Check if we're in a browser environment (process is not defined in browsers)
	const isBrowser = typeof process === "undefined";
	if (isBrowser) {
		// In browser, map model IDs to Azure deployment names
		// This is needed because Azure deployment names often include suffixes like "-chat"
		const browserDeploymentMap: Record<string, string> = {
			"gpt-5.2": "gpt-5.2-chat",
			"gpt-4o": "gpt-4o",
			"gpt-4": "gpt-4",
		};
		return browserDeploymentMap[model.id] || model.id;
	}
	const mappedDeployment = parseDeploymentNameMap(process.env.AZURE_OPENAI_DEPLOYMENT_NAME_MAP).get(model.id);
	return mappedDeployment || model.id;
}

// Azure OpenAI Responses-specific options
export interface AzureOpenAIResponsesOptions extends StreamOptions {
	reasoningEffort?: "minimal" | "low" | "medium" | "high" | "xhigh";
	reasoningSummary?: "auto" | "detailed" | "concise" | null;
	azureApiVersion?: string;
	azureResourceName?: string;
	azureBaseUrl?: string;
	azureDeploymentName?: string;
}

/**
 * Generate function for Azure OpenAI Responses API
 */
export const streamAzureOpenAIResponses: StreamFunction<"azure-openai-responses", AzureOpenAIResponsesOptions> = (
	model: Model<"azure-openai-responses">,
	context: Context,
	options?: AzureOpenAIResponsesOptions,
): AssistantMessageEventStream => {
	const stream = new AssistantMessageEventStream();

	// Start async processing
	(async () => {
		const deploymentName = resolveDeploymentName(model, options);

		const output: AssistantMessage = {
			role: "assistant",
			content: [],
			api: "azure-openai-responses" as Api,
			provider: model.provider,
			model: model.id,
			usage: {
				input: 0,
				output: 0,
				cacheRead: 0,
				cacheWrite: 0,
				totalTokens: 0,
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
			},
			stopReason: "stop",
			timestamp: Date.now(),
		};

		try {
			// Create Azure OpenAI client with managed identity
			const client = createClient(model, options);
			const params = buildParams(model, context, options, deploymentName);
			options?.onPayload?.(params);
			const openaiStream = await client.responses.create(
				params,
				options?.signal ? { signal: options.signal } : undefined,
			);
			stream.push({ type: "start", partial: output });

			await processResponsesStream(openaiStream, output, stream, model);

			if (options?.signal?.aborted) {
				throw new Error("Request was aborted");
			}

			if (output.stopReason === "aborted" || output.stopReason === "error") {
				throw new Error("An unknown error occurred");
			}

			stream.push({ type: "done", reason: output.stopReason, message: output });
			stream.end();
		} catch (error) {
			for (const block of output.content) delete (block as { index?: number }).index;
			output.stopReason = options?.signal?.aborted ? "aborted" : "error";
			output.errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
			stream.push({ type: "error", reason: output.stopReason, error: output });
			stream.end();
		}
	})();

	return stream;
};

export const streamSimpleAzureOpenAIResponses: StreamFunction<"azure-openai-responses", SimpleStreamOptions> = (
	model: Model<"azure-openai-responses">,
	context: Context,
	options?: SimpleStreamOptions,
): AssistantMessageEventStream => {
	const base = buildBaseOptions(model, options, undefined);
	const reasoningEffort = supportsXhigh(model) ? options?.reasoning : clampReasoning(options?.reasoning);

	return streamAzureOpenAIResponses(model, context, {
		...base,
		reasoningEffort,
	} satisfies AzureOpenAIResponsesOptions);
};

function normalizeAzureBaseUrl(baseUrl: string): string {
	return baseUrl.replace(/\/+$/, "");
}

function buildDefaultBaseUrl(resourceName: string): string {
	return `https://${resourceName}.openai.azure.com/openai/v1`;
}

function resolveAzureConfig(
	model: Model<"azure-openai-responses">,
	options?: AzureOpenAIResponsesOptions,
): { baseUrl: string; apiVersion: string } {
	// Check if we're in a browser environment
	const isBrowser = typeof process === "undefined";

	const apiVersion =
		options?.azureApiVersion || (!isBrowser && process.env.AZURE_OPENAI_API_VERSION) || DEFAULT_AZURE_API_VERSION;

	const baseUrl =
		options?.azureBaseUrl?.trim() || (!isBrowser && process.env.AZURE_OPENAI_BASE_URL?.trim()) || undefined;
	const resourceName = options?.azureResourceName || (!isBrowser && process.env.AZURE_OPENAI_RESOURCE_NAME);

	let resolvedBaseUrl = baseUrl;

	if (!resolvedBaseUrl && resourceName) {
		resolvedBaseUrl = buildDefaultBaseUrl(resourceName);
	}

	if (!resolvedBaseUrl && model.baseUrl) {
		resolvedBaseUrl = model.baseUrl;
	}

	if (!resolvedBaseUrl) {
		throw new Error(
			"Azure OpenAI base URL is required. Set AZURE_OPENAI_BASE_URL or AZURE_OPENAI_RESOURCE_NAME, or pass azureBaseUrl, azureResourceName, or model.baseUrl.",
		);
	}

	return {
		baseUrl: normalizeAzureBaseUrl(resolvedBaseUrl),
		apiVersion,
	};
}

function createClient(model: Model<"azure-openai-responses">, options?: AzureOpenAIResponsesOptions) {
	const headers = { ...model.headers };

	if (options?.headers) {
		Object.assign(headers, options.headers);
	}

	const { baseUrl, apiVersion } = resolveAzureConfig(model, options);

	console.log("[Azure OpenAI Responses] Creating client with: - azure-openai-responses.ts:208");
	console.log("baseURL: - azure-openai-responses.ts:209", baseUrl);
	console.log("apiVersion: - azure-openai-responses.ts:210", apiVersion);
	console.log("deployment: - azure-openai-responses.ts:211", options?.azureDeploymentName || "default");

	// Check if running in browser environment (process.env won't have NODE_ENV in browser)
	const isBrowser = typeof process === "undefined";

	if (isBrowser) {
		console.log(
			"[Azure OpenAI Responses] Browser detected  proxy server should handle authentication - azure-openai-responses.ts:217",
		);
		console.log(
			"[Azure OpenAI Responses] Make sure proxy is configured in Settings → Proxy - azure-openai-responses.ts:218",
		);
		// In browser, use regular OpenAI client (not AzureOpenAI) to avoid Azure-specific path construction
		// The proxy server will handle Azure-specific URL transformation and authentication
		return new OpenAI({
			apiKey: "proxy-handled", // Dummy key - proxy adds Authorization header
			dangerouslyAllowBrowser: true,
			defaultHeaders: headers,
			baseURL: baseUrl,
		}) as unknown as AzureOpenAI;
	}

	// Server-side: Use managed identity for authentication
	const credential = getAzureCredential();
	const azureADTokenProvider = getBearerTokenProvider(credential, AZURE_OPENAI_SCOPE);

	return new AzureOpenAI({
		azureADTokenProvider,
		apiVersion,
		dangerouslyAllowBrowser: true,
		defaultHeaders: headers,
		baseURL: baseUrl,
	});
}

function buildParams(
	model: Model<"azure-openai-responses">,
	context: Context,
	options: AzureOpenAIResponsesOptions | undefined,
	deploymentName: string,
) {
	const messages = convertResponsesMessages(model, context, AZURE_TOOL_CALL_PROVIDERS);

	const params: ResponseCreateParamsStreaming = {
		model: deploymentName,
		input: messages,
		stream: true,
		prompt_cache_key: options?.sessionId,
	};

	if (options?.maxTokens) {
		params.max_output_tokens = options?.maxTokens;
	}

	if (options?.temperature !== undefined) {
		params.temperature = options?.temperature;
	}

	if (context.tools) {
		params.tools = convertResponsesTools(context.tools);
	}

	if (model.reasoning) {
		if (options?.reasoningEffort || options?.reasoningSummary) {
			params.reasoning = {
				effort: options?.reasoningEffort || "medium",
				summary: options?.reasoningSummary || "auto",
			};
			params.include = ["reasoning.encrypted_content"];
		} else {
			if (model.name.toLowerCase().startsWith("gpt-5")) {
				// Jesus Christ, see https://community.openai.com/t/need-reasoning-false-option-for-gpt-5/1351588/7
				messages.push({
					role: "developer",
					content: [
						{
							type: "input_text",
							text: "# Juice: 0 !important",
						},
					],
				});
			}
		}
	}

	return params;
}
