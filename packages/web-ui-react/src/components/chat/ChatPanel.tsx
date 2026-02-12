import { AgentInterface } from './AgentInterface';

export interface ChatPanelProps {
  className?: string;
}

/**
 * ChatPanel - Main container for the chat interface
 *
 * Currently just wraps AgentInterface.
 * In the future, this will also include:
 * - Artifacts panel (side-by-side or overlay)
 * - Responsive layout management
 * - Panel visibility controls
 */
export function ChatPanel({ className = '' }: ChatPanelProps) {
  return (
    <div className={`flex h-full ${className}`}>
      {/* Chat Interface - Full width for now */}
      <div className="flex-1 flex flex-col min-h-0">
        <AgentInterface />
      </div>

      {/* TODO: Artifacts Panel */}
      {/* Will be added in Phase 3 */}
    </div>
  );
}
