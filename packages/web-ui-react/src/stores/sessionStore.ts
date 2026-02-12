import { create } from "zustand";

export interface SessionStore {
	// State
	currentSessionId: string | null;
	currentTitle: string;
	isEditingTitle: boolean;
	tempTitle: string; // Temporary title during editing

	// Actions
	setSessionId: (sessionId: string | null) => void;
	setTitle: (title: string) => void;
	startEditingTitle: () => void;
	cancelEditingTitle: () => void;
	saveTitleEdit: () => void;
	updateTempTitle: (title: string) => void;
	reset: () => void;
}

const DEFAULT_TITLE = "New Session";

export const useSessionStore = create<SessionStore>((set, get) => ({
	// Initial state
	currentSessionId: null,
	currentTitle: DEFAULT_TITLE,
	isEditingTitle: false,
	tempTitle: DEFAULT_TITLE,

	// Set the current session ID
	setSessionId: (sessionId: string | null) => {
		set({ currentSessionId: sessionId });
	},

	// Set the session title
	setTitle: (title: string) => {
		set({ currentTitle: title, tempTitle: title });
	},

	// Start editing the title
	startEditingTitle: () => {
		const { currentTitle } = get();
		set({
			isEditingTitle: true,
			tempTitle: currentTitle,
		});
	},

	// Cancel title editing
	cancelEditingTitle: () => {
		const { currentTitle } = get();
		set({
			isEditingTitle: false,
			tempTitle: currentTitle, // Reset to current title
		});
	},

	// Save the edited title
	saveTitleEdit: () => {
		const { tempTitle } = get();
		set({
			currentTitle: tempTitle,
			isEditingTitle: false,
		});
	},

	// Update temporary title during editing
	updateTempTitle: (title: string) => {
		set({ tempTitle: title });
	},

	// Reset to initial state
	reset: () => {
		set({
			currentSessionId: null,
			currentTitle: DEFAULT_TITLE,
			isEditingTitle: false,
			tempTitle: DEFAULT_TITLE,
		});
	},
}));
