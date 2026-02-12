import { useEffect, useRef } from "react";
import { useAgentStore } from "../stores/agentStore";
import { useSessionStore } from "../stores/sessionStore";
import { useAgent } from "./useAgent";
import { useSessions } from "./useSessions";

/**
 * Hook to automatically save sessions when messages change
 * Also handles auto-title generation and session ID creation
 */
export function useAutoSave() {
	const agent = useAgentStore((state) => state.agent);
	const isStreaming = useAgentStore((state) => state.isStreaming);

	const currentSessionId = useSessionStore((state) => state.currentSessionId);
	const currentTitle = useSessionStore((state) => state.currentTitle);
	const setSessionId = useSessionStore((state) => state.setSessionId);
	const setTitle = useSessionStore((state) => state.setTitle);

	const { saveSession, generateTitle } = useSessions();

	const saveTimeoutRef = useRef<NodeJS.Timeout>();

	// Auto-save when agent state updates (debounced)
	useAgent({
		onStateUpdate: () => {
			// Clear previous timeout
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}

			// Don't save while streaming
			if (isStreaming) return;

			// Debounce save by 1 second
			saveTimeoutRef.current = setTimeout(() => {
				handleAutoSave();
			}, 1000);
		},
	});

	const handleAutoSave = () => {
		if (!agent) return;

		const state = agent.state;
		const msgs = state.messages;

		// Check if we have messages to save
		const hasUserMessage = msgs.some((m) => m.role === "user" || m.role === "user-with-attachments");
		const hasAssistantMessage = msgs.some((m) => m.role === "assistant");

		if (!hasUserMessage) return;

		// Create session ID if we don't have one yet
		if (!currentSessionId) {
			const newSessionId = crypto.randomUUID();
			setSessionId(newSessionId);

			// Update URL with new session ID
			const url = new URL(window.location.href);
			url.searchParams.set("session", newSessionId);
			window.history.replaceState({}, "", url.toString());

			console.log("[useAutoSave] Created new session:", newSessionId);
		}

		// Auto-generate title from first message if still "New Session"
		if (currentTitle === "New Session" && hasUserMessage) {
			const generatedTitle = generateTitle(msgs);
			if (generatedTitle) {
				setTitle(generatedTitle);
				console.log("[useAutoSave] Generated title:", generatedTitle);
			}
		}

		// Save session (only if we have both user and assistant messages)
		if (hasAssistantMessage && currentSessionId) {
			saveSession();
		}
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, []);
}
