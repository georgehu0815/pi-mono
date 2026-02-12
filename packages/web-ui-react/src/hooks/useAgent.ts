import type { AgentEvent } from "@mariozechner/pi-agent-core";
import { useCallback, useEffect } from "react";
import { useAgentStore } from "../stores/agentStore";

/**
 * Hook to subscribe to agent events and trigger callbacks
 *
 * Usage:
 * ```tsx
 * useAgent({
 *   onMessageUpdate: (event) => {
 *     // Handle streaming message updates
 *   },
 *   onAgentEnd: () => {
 *     // Handle agent completion
 *   }
 * });
 * ```
 */
export interface UseAgentOptions {
	onAgentStart?: (event: Extract<AgentEvent, { type: "agent_start" }>) => void;
	onAgentEnd?: (event: Extract<AgentEvent, { type: "agent_end" }>) => void;
	onTurnStart?: (event: Extract<AgentEvent, { type: "turn_start" }>) => void;
	onTurnEnd?: (event: Extract<AgentEvent, { type: "turn_end" }>) => void;
	onMessageStart?: (event: Extract<AgentEvent, { type: "message_start" }>) => void;
	onMessageUpdate?: (event: Extract<AgentEvent, { type: "message_update" }>) => void;
	onMessageEnd?: (event: Extract<AgentEvent, { type: "message_end" }>) => void;
	onToolExecutionStart?: (event: Extract<AgentEvent, { type: "tool_execution_start" }>) => void;
	onToolExecutionUpdate?: (event: Extract<AgentEvent, { type: "tool_execution_update" }>) => void;
	onToolExecutionEnd?: (event: Extract<AgentEvent, { type: "tool_execution_end" }>) => void;
	onStateUpdate?: () => void;
}

export function useAgent(options: UseAgentOptions = {}) {
	const agent = useAgentStore((state) => state.agent);
	const {
		onStateUpdate,
		onAgentStart,
		onAgentEnd,
		onTurnStart,
		onTurnEnd,
		onMessageStart,
		onMessageUpdate,
		onMessageEnd,
		onToolExecutionStart,
		onToolExecutionUpdate,
		onToolExecutionEnd,
	} = options;

	const handleEvent = useCallback(
		(event: AgentEvent) => {
			// Call state update for any event
			onStateUpdate?.();

			switch (event.type) {
				case "agent_start":
					onAgentStart?.(event);
					break;
				case "agent_end":
					onAgentEnd?.(event);
					break;
				case "turn_start":
					onTurnStart?.(event);
					break;
				case "turn_end":
					onTurnEnd?.(event);
					break;
				case "message_start":
					onMessageStart?.(event);
					break;
				case "message_update":
					onMessageUpdate?.(event);
					break;
				case "message_end":
					onMessageEnd?.(event);
					break;
				case "tool_execution_start":
					onToolExecutionStart?.(event);
					break;
				case "tool_execution_update":
					onToolExecutionUpdate?.(event);
					break;
				case "tool_execution_end":
					onToolExecutionEnd?.(event);
					break;
			}
		},
		[
			onStateUpdate,
			onAgentStart,
			onAgentEnd,
			onTurnStart,
			onTurnEnd,
			onMessageStart,
			onMessageUpdate,
			onMessageEnd,
			onToolExecutionStart,
			onToolExecutionUpdate,
			onToolExecutionEnd,
		],
	);

	useEffect(() => {
		if (!agent) return;

		const unsubscribe = agent.subscribe(handleEvent);
		return unsubscribe;
	}, [agent, handleEvent]);
}

/**
 * Hook to get agent state from the store
 * Returns the full agent state including messages, streaming status, etc.
 */
export function useAgentState() {
	return useAgentStore((state) => ({
		agent: state.agent,
		isStreaming: state.isStreaming,
		messages: state.messages,
		pendingToolCalls: state.pendingToolCalls,
		streamMessage: state.streamMessage,
		error: state.error,
	}));
}
