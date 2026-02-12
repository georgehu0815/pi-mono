import { create } from "zustand";

export interface UIStore {
	// Dialog states
	settingsOpen: boolean;
	sessionsOpen: boolean;
	modelSelectorOpen: boolean;
	apiKeyPromptOpen: boolean;
	apiKeyPromptProvider: string | null;

	// Panel states
	windowWidth: number;
	isMobile: boolean;
	artifactsPanelOpen: boolean;

	// Actions - Dialogs
	openSettings: () => void;
	closeSettings: () => void;
	openSessions: () => void;
	closeSessions: () => void;
	openModelSelector: () => void;
	closeModelSelector: () => void;
	openApiKeyPrompt: (provider: string) => void;
	closeApiKeyPrompt: () => void;

	// Actions - Panels
	setWindowWidth: (width: number) => void;
	toggleArtifactsPanel: () => void;
	openArtifactsPanel: () => void;
	closeArtifactsPanel: () => void;
}

const MOBILE_BREAKPOINT = 800;

export const useUIStore = create<UIStore>((set, get) => ({
	// Initial state - Dialogs
	settingsOpen: false,
	sessionsOpen: false,
	modelSelectorOpen: false,
	apiKeyPromptOpen: false,
	apiKeyPromptProvider: null,

	// Initial state - Panels
	windowWidth: typeof window !== "undefined" ? window.innerWidth : 1024,
	isMobile: typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false,
	artifactsPanelOpen: false,

	// Dialog actions
	openSettings: () => set({ settingsOpen: true }),
	closeSettings: () => set({ settingsOpen: false }),

	openSessions: () => set({ sessionsOpen: true }),
	closeSessions: () => set({ sessionsOpen: false }),

	openModelSelector: () => set({ modelSelectorOpen: true }),
	closeModelSelector: () => set({ modelSelectorOpen: false }),

	openApiKeyPrompt: (provider: string) =>
		set({
			apiKeyPromptOpen: true,
			apiKeyPromptProvider: provider,
		}),
	closeApiKeyPrompt: () =>
		set({
			apiKeyPromptOpen: false,
			apiKeyPromptProvider: null,
		}),

	// Panel actions
	setWindowWidth: (width: number) => {
		set({
			windowWidth: width,
			isMobile: width < MOBILE_BREAKPOINT,
		});
	},

	toggleArtifactsPanel: () => {
		const { artifactsPanelOpen } = get();
		set({ artifactsPanelOpen: !artifactsPanelOpen });
	},

	openArtifactsPanel: () => set({ artifactsPanelOpen: true }),
	closeArtifactsPanel: () => set({ artifactsPanelOpen: false }),
}));
