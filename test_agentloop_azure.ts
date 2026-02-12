import { Agent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";

// Configure Azure OpenAI with managed identity (using environment variables)
process.env.AZURE_OPENAI_BASE_URL = process.env.AZURE_OPENAI_BASE_URL || "https://datacopilothub8882317788.cognitiveservices.azure.com/openai";
process.env.AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2025-03-01-preview";
process.env.AZURE_OPENAI_DEPLOYMENT_NAME_MAP = process.env.AZURE_OPENAI_DEPLOYMENT_NAME_MAP || "gpt-5.2=gpt-5.2-chat";

console.log("🚀 Starting Agent Loop Test with Azure OpenAI");
console.log("📍 Endpoint:", process.env.AZURE_OPENAI_BASE_URL);
console.log("🔑 Using Azure Managed Identity (AzureCliCredential)");
console.log("");

const agent = new Agent({
  initialState: {
    systemPrompt: "You are a helpful assistant.",
    model: getModel("azure-openai-responses", "gpt-5.2"),
  },
});

agent.subscribe((event) => {
  if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
    // Stream just the new text chunk
    process.stdout.write(event.assistantMessageEvent.delta);
  }
});

console.log("💬 Sending prompt: 'Hello!'\n");
console.log("📝 Response:\n");

await agent.prompt("Hello!");

console.log("\n\n✅ Agent loop test completed!");
