import { Type } from "@sinclair/typebox";
import { describe, expect, it } from "vitest";
import { getModel } from "../src/models.js";
import {
	AZURE_OPENAI_API_VERSION,
	AZURE_OPENAI_BASE_URL,
	AZURE_OPENAI_DEPLOYMENT,
} from "../src/providers/azure-openai-models.js";
import { complete } from "../src/stream.js";
import type { Context, Tool } from "../src/types.js";

const testToolSchema = Type.Object({
	value: Type.Number({ description: "A number to double" }),
});

const testTool: Tool<typeof testToolSchema> = {
	name: "double_number",
	description: "Doubles a number and returns the result",
	parameters: testToolSchema,
};

// This test uses managed identity (no API key needed)
// In production: Uses ManagedIdentityCredential
// In development: Uses AzureCliCredential (requires `az login`)
describe("Azure OpenAI Responses with Managed Identity", () => {
	it("should complete a simple text generation", { retry: 2, timeout: 30000 }, async () => {
		const model = getModel("azure-openai-responses", "gpt-5.2");

		const context: Context = {
			systemPrompt: "You are a helpful assistant. Be concise.",
			messages: [
				{
					role: "user",
					content: "What is 2+2? Answer with just the number.",
					timestamp: Date.now(),
				},
			],
		};

		const response = await complete(model, context, {
			azureBaseUrl: AZURE_OPENAI_BASE_URL,
			azureApiVersion: AZURE_OPENAI_API_VERSION,
			azureDeploymentName: AZURE_OPENAI_DEPLOYMENT,
		});

		console.log("Response:", JSON.stringify(response, null, 2));

		// Should not have errors
		expect(response.stopReason, `Error: ${response.errorMessage}`).not.toBe("error");
		expect(response.errorMessage).toBeFalsy();

		// Should have content
		expect(response.content.length).toBeGreaterThan(0);

		// Should contain the answer
		const text = response.content
			.filter((b) => b.type === "text")
			.map((b) => (b as any).text)
			.join("");
		expect(text).toContain("4");
	});

	it("should handle tool calls with managed identity", { retry: 2, timeout: 30000 }, async () => {
		const model = getModel("azure-openai-responses", "gpt-5.2");

		const context: Context = {
			systemPrompt: "You are a helpful assistant. Always use the tool when asked.",
			messages: [
				{
					role: "user",
					content: "Use the double_number tool to double 21.",
					timestamp: Date.now(),
				},
			],
			tools: [testTool],
		};

		const response = await complete(model, context, {
			azureBaseUrl: AZURE_OPENAI_BASE_URL,
			azureApiVersion: AZURE_OPENAI_API_VERSION,
			azureDeploymentName: AZURE_OPENAI_DEPLOYMENT,
		});

		console.log("Response with tool call:", JSON.stringify(response, null, 2));

		// Should not have errors
		expect(response.stopReason, `Error: ${response.errorMessage}`).not.toBe("error");
		expect(response.errorMessage).toBeFalsy();

		// Should have tool call
		const toolCall = response.content.find((block) => block.type === "toolCall");
		expect(toolCall).toBeDefined();
		expect(toolCall?.type).toBe("toolCall");

		if (toolCall?.type === "toolCall") {
			expect(toolCall.name).toBe("double_number");
			expect(toolCall.arguments).toHaveProperty("value");
			expect(toolCall.arguments.value).toBe(21);
		}
	});

	it("should work with reasoning effort", { retry: 2, timeout: 30000 }, async () => {
		const model = getModel("azure-openai-responses", "gpt-5.2");

		const context: Context = {
			systemPrompt: "You are a helpful assistant.",
			messages: [
				{
					role: "user",
					content: "Explain why the sky is blue in one sentence.",
					timestamp: Date.now(),
				},
			],
		};

		const response = await complete(model, context, {
			azureBaseUrl: AZURE_OPENAI_BASE_URL,
			azureApiVersion: AZURE_OPENAI_API_VERSION,
			azureDeploymentName: AZURE_OPENAI_DEPLOYMENT,
			reasoningEffort: "medium",
		});

		console.log("Response with reasoning:", JSON.stringify(response, null, 2));

		// Should not have errors
		expect(response.stopReason, `Error: ${response.errorMessage}`).not.toBe("error");
		expect(response.errorMessage).toBeFalsy();

		// Should have content
		expect(response.content.length).toBeGreaterThan(0);

		// Should contain text about the sky
		const text = response.content
			.filter((b) => b.type === "text")
			.map((b) => (b as any).text)
			.join("");
		expect(text.toLowerCase()).toMatch(/sky|blue|light|scatter/);
	});
});
