import React, { useEffect } from 'react';
import { useAgentStore } from './stores/agentStore';
import { useSessionStore } from './stores/sessionStore';
import { useUIStore } from './stores/uiStore';
import { ChatPanel } from './components/chat/ChatPanel';
import { SettingsDialog } from './components/dialogs/SettingsDialog';
import { useSessions } from './hooks/useSessions';
import { useAutoSave } from './hooks/useAutoSave';
import { getModel } from '@mariozechner/pi-ai';
import { Settings, History, Plus } from 'lucide-react';

function App() {
  const createAgent = useAgentStore((state) => state.createAgent);
  const agent = useAgentStore((state) => state.agent);

  const sessionTitle = useSessionStore((state) => state.currentTitle);
  const isEditingTitle = useSessionStore((state) => state.isEditingTitle);
  const tempTitle = useSessionStore((state) => state.tempTitle);
  const startEditingTitle = useSessionStore((state) => state.startEditingTitle);
  const saveTitleEdit = useSessionStore((state) => state.saveTitleEdit);
  const cancelEditingTitle = useSessionStore((state) => state.cancelEditingTitle);
  const updateTempTitle = useSessionStore((state) => state.updateTempTitle);

  const setWindowWidth = useUIStore((state) => state.setWindowWidth);
  const openSettings = useUIStore((state) => state.openSettings);

  const { loadSession, newSession, updateSessionTitle } = useSessions();

  // Auto-save session when messages change
  useAutoSave();

  // Create agent on mount
  useEffect(() => {
    const defaultModel = getModel('azure-openai-responses', 'gpt-5.2');

    // Set proxy server URL as the base URL for browser requests
    defaultModel.baseUrl = 'http://localhost:3001';

    createAgent({
      initialState: {
        systemPrompt: 'You are a helpful AI assistant powered by Azure OpenAI with Managed Identity.',
        model: defaultModel,
        thinkingLevel: 'off',
        messages: [],
        tools: [],
      },
    });
  }, [createAgent]);

  // Load session from URL after agent is ready
  useEffect(() => {
    if (!agent) return;

    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get('session');

    if (sessionId) {
      loadSession(sessionId);
    }
  }, [agent, loadSession]);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setWindowWidth]);

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveTitleEdit();
      updateSessionTitle(tempTitle);
    } else if (e.key === 'Escape') {
      cancelEditingTitle();
    }
  };

  const handleTitleBlur = () => {
    saveTitleEdit();
    updateSessionTitle(tempTitle);
  };

  const handleNewSession = () => {
    newSession();
  };

  return (
    <div className="w-full h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="shrink-0 border-b border-border">
        <div className="px-4 py-2 flex items-center justify-between gap-4">
          {/* Left: Navigation buttons */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-secondary rounded transition-colors"
              title="Session History"
              onClick={() => {
                // TODO: Open session list dialog
                console.log('Open session history');
              }}
            >
              <History size={20} />
            </button>

            <button
              className="p-2 hover:bg-secondary rounded transition-colors"
              title="New Session"
              onClick={handleNewSession}
            >
              <Plus size={20} />
            </button>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Session Title */}
            {isEditingTitle ? (
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => updateTempTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleTitleBlur}
                autoFocus
                className="px-2 py-1 bg-secondary border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <button
                onClick={startEditingTitle}
                className="px-2 py-1 hover:bg-secondary rounded transition-colors text-sm font-medium"
              >
                {sessionTitle}
              </button>
            )}

            {/* Azure OpenAI Badge */}
            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
              Azure OpenAI
            </span>
          </div>

          {/* Right: Settings */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-secondary rounded transition-colors"
              title="Settings"
              onClick={openSettings}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 min-h-0">
        {agent ? (
          <ChatPanel />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-2xl mb-2">⏳</div>
              <div className="text-muted-foreground">Initializing agent...</div>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <SettingsDialog />
    </div>
  );
}

export default App;
