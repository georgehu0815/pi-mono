// import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
// import type { ModelDefinitionConfig } from "../config/types.js";

// Azure OpenAI configuration
// Note: Endpoint for native client (includes full path)
export const AZURE_OPENAI_ENDPOINT = "https://datacopilothub8882317788.cognitiveservices.azure.com/";
// Base URL for OpenAI SDK (needs /openai prefix for Responses API)
export const AZURE_OPENAI_BASE_URL = "https://datacopilothub8882317788.cognitiveservices.azure.com/openai";
export const AZURE_OPENAI_DEPLOYMENT = "gpt-5.2-chat";
export const AZURE_OPENAI_API_VERSION = "2025-03-01-preview"; // Responses API requires 2025-03-01-preview or later
export const AZURE_OPENAI_SCOPE = "https://cognitiveservices.azure.com/.default";
export const AZURE_OPENAI_MANAGED_IDENTITY_CLIENT_ID = "c9427d44-98e2-406a-9527-f7fa7059f984";

// const endpoint = process.env["AZURE_OPENAI_ENDPOINT"] || "https://datacopilothub8882317788.openai.azure.com/";
// const apiVersion = "2025-01-01-preview";
// const deployment = "gpt-5.2-chat"; // This must match your deployment name

// Initialize the DefaultAzureCredential

// Default model configuration
export const AZURE_OPENAI_DEFAULT_MODEL_ID = "gpt-5.2";
export const AZURE_OPENAI_DEFAULT_MODEL_REF = `azureopenai/${AZURE_OPENAI_DEFAULT_MODEL_ID}`;

export const AZURE_OPENAI_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0,
};

export const AZURE_OPENAI_MODEL_CATALOG = [
	{
		id: AZURE_OPENAI_DEFAULT_MODEL_ID,
		name: "GPT-5.2",
		reasoning: false,
		input: ["text", "image"] as const,
		contextWindow: 128000,
		maxTokens: 8192,
	},
] as const;

export type AzureOpenAICatalogEntry = (typeof AZURE_OPENAI_MODEL_CATALOG)[number];

// export function buildAzureOpenAIModelDefinition(
//   entry: AzureOpenAICatalogEntry,
// ): ModelDefinitionConfig {
//   return {
//     id: entry.id,
//     name: entry.name,
//     reasoning: entry.reasoning,
//     input: [...entry.input],
//     cost: AZURE_OPENAI_DEFAULT_COST,
//     contextWindow: entry.contextWindow,
//     maxTokens: entry.maxTokens,
//   };
// }
