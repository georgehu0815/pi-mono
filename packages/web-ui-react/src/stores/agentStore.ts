import type { AgentEvent, AgentMessage, AgentTool, ThinkingLevel } from "@mariozechner/pi-agent-core";
import { Agent, type AgentOptions } from "@mariozechner/pi-agent-core";
import type { ImageContent, Model } from "@mariozechner/pi-ai";
import { create } from "zustand";

export interface AgentStore {
	// State
	agent: Agent | null;
	isStreaming: boolean;
	messages: AgentMessage[];
	pendingToolCalls: Set<string>;
	streamMessage: AgentMessage | null;
	error: string | undefined;

	// Actions
	createAgent: (options?: AgentOptions) => void;
	sendMessage: (content: string, images?: ImageContent[]) => Promise<void>;
	sendMessages: (messages: AgentMessage[]) => Promise<void>;
	abort: () => void;
	setModel: (model: Model<any>) => void;
	setThinkingLevel: (level: ThinkingLevel) => void;
	setTools: (tools: AgentTool<any>[]) => void;
	setSystemPrompt: (prompt: string) => void;
	reset: () => void;
	replaceMessages: (messages: AgentMessage[]) => void;

	// Event subscription
	subscribe: (listener: (event: AgentEvent) => void) => () => void;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
	// Initial state
	agent: null,
	isStreaming: false,
	messages: [],
	pendingToolCalls: new Set(),
	streamMessage: null,
	error: undefined,

	// Create agent instance
	createAgent: (options?: AgentOptions) => {
		const agent = new Agent(options);

		// Subscribe to agent events and update Zustand state
		agent.subscribe((_event: AgentEvent) => {
			const state = agent.state;

			set({
				isStreaming: state.isStreaming,
				messages: state.messages,
				pendingToolCalls: state.pendingToolCalls,
				streamMessage: state.streamMessage,
				error: state.error,
			});
		});

		set({ agent });
	},

	// Send a text message (with optional images)
	sendMessage: async (content: string, images?: ImageContent[]) => {
		const { agent } = get();
		if (!agent) {
			throw new Error("Agent not initialized. Call createAgent() first.");
		}

		try {
			await agent.prompt(content, images);
		} catch (error) {
			set({ error: error instanceof Error ? error.message : String(error) });
			throw error;
		}
	},

	// Send one or more AgentMessage objects
	sendMessages: async (messages: AgentMessage[]) => {
		const { agent } = get();
		if (!agent) {
			throw new Error("Agent not initialized. Call createAgent() first.");
		}

		try {
			await agent.prompt(messages);
		} catch (error) {
			set({ error: error instanceof Error ? error.message : String(error) });
			throw error;
		}
	},

	// Abort current streaming
	abort: () => {
		const { agent } = get();
		if (agent) {
			agent.abort();
		}
	},

	// Set the model
	setModel: (model: Model<any>) => {
		const { agent } = get();
		if (agent) {
			agent.setModel(model);
		}
	},

	// Set thinking level
	setThinkingLevel: (level: ThinkingLevel) => {
		const { agent } = get();
		if (agent) {
			agent.setThinkingLevel(level);
		}
	},

	// Set available tools
	setTools: (tools: AgentTool<any>[]) => {
		const { agent } = get();
		if (agent) {
			agent.setTools(tools);
		}
	},

	// Set system prompt
	setSystemPrompt: (prompt: string) => {
		const { agent } = get();
		if (agent) {
			agent.setSystemPrompt(prompt);
		}
	},

	// Reset agent state
	reset: () => {
		const { agent } = get();
		if (agent) {
			agent.reset();
			set({
				messages: [],
				isStreaming: false,
				streamMessage: null,
				pendingToolCalls: new Set(),
				error: undefined,
			});
		}
	},

	// Replace all messages
	replaceMessages: (messages: AgentMessage[]) => {
		const { agent } = get();
		if (agent) {
			agent.replaceMessages(messages);
			set({ messages });
		}
	},

	// Subscribe to agent events (pass-through to Agent.subscribe)
	subscribe: (listener: (event: AgentEvent) => void) => {
		const { agent } = get();
		if (!agent) {
			throw new Error("Agent not initialized. Call createAgent() first.");
		}
		return agent.subscribe(listener);
	},
}));
