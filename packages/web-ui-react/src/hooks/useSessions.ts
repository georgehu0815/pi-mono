import type { AgentMessage } from "@mariozechner/pi-agent-core";
import { useCallback } from "react";
import { useStorage } from "../storage/StorageContext";
import { useAgentStore } from "../stores/agentStore";
import { useSessionStore } from "../stores/sessionStore";

/**
 * Hook for session management operations
 */
export function useSessions() {
	const { storage } = useStorage();
	const agent = useAgentStore((state) => state.agent);
	const replaceMessages = useAgentStore((state) => state.replaceMessages);
	const setModel = useAgentStore((state) => state.setModel);
	const setThinkingLevel = useAgentStore((state) => state.setThinkingLevel);

	const setSessionId = useSessionStore((state) => state.setSessionId);
	const setTitle = useSessionStore((state) => state.setTitle);
	const currentSessionId = useSessionStore((state) => state.currentSessionId);
	const currentTitle = useSessionStore((state) => state.currentTitle);

	/**
	 * Generate a title from the first user message
	 */
	const generateTitle = useCallback((messages: AgentMessage[]): string => {
		const firstUserMsg = messages.find((m) => m.role === "user");
		if (!firstUserMsg) return "";

		let text = "";
		const content = firstUserMsg.content;

		if (typeof content === "string") {
			text = content;
		} else {
			const textBlocks = content.filter((c) => c.type === "text");
			text = textBlocks.map((c) => (c.type === "text" ? c.text : "")).join(" ");
		}

		text = text.trim();
		if (!text) return "";

		// Take first sentence (up to 50 chars) or first 50 chars
		const sentenceEnd = text.search(/[.!?]/);
		if (sentenceEnd > 0 && sentenceEnd <= 50) {
			return text.substring(0, sentenceEnd + 1);
		}

		return text.length > 50 ? `${text.substring(0, 50)}...` : text;
	}, []);

	/**
	 * Save the current session to storage
	 */
	const saveSession = useCallback(async () => {
		if (!agent || !currentSessionId) return;

		const state = agent.state;
		const messages = state.messages;

		// Only save if we have both user and assistant messages
		const hasUserMessage = messages.some((m) => m.role === "user");
		const hasAssistantMessage = messages.some((m) => m.role === "assistant");

		if (!hasUserMessage || !hasAssistantMessage) return;

		const now = new Date().toISOString();

		// Calculate usage stats from assistant messages
		let totalTokens = 0;
		let totalCost = 0;
		messages.forEach((msg) => {
			if (msg.role === "assistant") {
				totalTokens += msg.usage.totalTokens;
				totalCost += msg.usage.cost.total;
			}
		});

		// Create session data
		const sessionData = {
			id: currentSessionId,
			title: currentTitle,
			model: state.model,
			messages: messages,
			thinkingLevel: state.thinkingLevel,
			createdAt: now,
			lastModified: now,
		};

		// Create session metadata
		const sessionMetadata = {
			id: currentSessionId,
			title: currentTitle,
			createdAt: now,
			lastModified: now,
			messageCount: messages.length,
			usage: {
				input: 0,
				output: 0,
				cacheRead: 0,
				cacheWrite: 0,
				totalTokens: totalTokens,
				cost: {
					input: 0,
					output: 0,
					cacheRead: 0,
					cacheWrite: 0,
					total: totalCost,
				},
			},
			thinkingLevel: state.thinkingLevel,
			preview: "",
		};

		// Save using the SessionsStore save method
		await storage.sessions.save(sessionData, sessionMetadata);

		console.log("[useSessions] Session saved:", currentSessionId);
	}, [agent, currentSessionId, currentTitle, storage]);

	/**
	 * Load a session from storage
	 */
	const loadSession = useCallback(
		async (sessionId: string) => {
			const sessionData = await storage.sessions.get(sessionId);
			if (!sessionData) {
				console.error("[useSessions] Session not found:", sessionId);
				return;
			}

			// Update agent state
			if (agent) {
				replaceMessages(sessionData.messages || []);
				if (sessionData.model) setModel(sessionData.model);
				if (sessionData.thinkingLevel) setThinkingLevel(sessionData.thinkingLevel);
			}

			// Update session store
			setSessionId(sessionId);
			setTitle(sessionData.title || "Untitled Session");

			// Update URL
			const url = new URL(window.location.href);
			url.searchParams.set("session", sessionId);
			window.history.replaceState({}, "", url.toString());

			console.log("[useSessions] Session loaded:", sessionId);
		},
		[storage, agent, replaceMessages, setModel, setThinkingLevel, setSessionId, setTitle],
	);

	/**
	 * Create a new session
	 */
	const newSession = useCallback(() => {
		// Reset agent state
		if (agent) {
			agent.reset();
		}

		// Reset session store
		setSessionId(null);
		setTitle("New Session");

		// Clear URL parameter
		const url = new URL(window.location.href);
		url.searchParams.delete("session");
		window.history.replaceState({}, "", url.toString());

		console.log("[useSessions] New session created");
	}, [agent, setSessionId, setTitle]);

	/**
	 * Delete a session
	 */
	const deleteSession = useCallback(
		async (sessionId: string) => {
			await storage.sessions.delete(sessionId);

			// If we deleted the current session, create a new one
			if (sessionId === currentSessionId) {
				newSession();
			}

			console.log("[useSessions] Session deleted:", sessionId);
		},
		[storage, currentSessionId, newSession],
	);

	/**
	 * List all sessions
	 */
	const listSessions = useCallback(async () => {
		return await storage.sessions.getAllMetadata();
	}, [storage]);

	/**
	 * Update session title
	 */
	const updateSessionTitle = useCallback(
		async (title: string) => {
			if (!currentSessionId) return;

			setTitle(title);

			// Update using the updateTitle method
			await storage.sessions.updateTitle(currentSessionId, title);

			console.log("[useSessions] Session title updated:", title);
		},
		[currentSessionId, storage, setTitle],
	);

	return {
		saveSession,
		loadSession,
		newSession,
		deleteSession,
		listSessions,
		updateSessionTitle,
		generateTitle,
	};
}
