import { describe, it } from "vitest";

// TODO: Re-enable when streamAzureOpenAINative is uncommented in azure-openai-stream-adapter-native.ts
// import { streamAzureOpenAINative } from "../src/providers/azure-openai-stream-adapter-native.js";
// import type { Context } from "../src/types.js";

// This test uses the native Azure OpenAI adapter with managed identity
describe.skip("Azure OpenAI Native with Managed Identity", () => {
	it("should complete a simple text generation", { retry: 2, timeout: 30000 }, async () => {
		// TODO: Uncomment when streamAzureOpenAINative is available
		// const context: Context = {
		// 	systemPrompt: "You are a helpful assistant. Be concise.",
		// 	messages: [
		// 		{
		// 			role: "user",
		// 			content: "What is 2+2? Answer with just the number.",
		// 			timestamp: Date.now(),
		// 		},
		// 	],
		// };
		// const response = await streamAzureOpenAINative(context);
		// expect(response).toBeDefined();
	});
});
