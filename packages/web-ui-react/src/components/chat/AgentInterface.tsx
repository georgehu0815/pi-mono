import { useCallback } from 'react';
import { useAgentStore } from '../../stores/agentStore';
import { MessageList } from './MessageList';
import { MessageEditor } from './MessageEditor';

export interface AgentInterfaceProps {
  className?: string;
}

export function AgentInterface({ className = '' }: AgentInterfaceProps) {
  const messages = useAgentStore((state) => state.messages);
  const streamMessage = useAgentStore((state) => state.streamMessage);
  const isStreaming = useAgentStore((state) => state.isStreaming);
  const sendMessage = useAgentStore((state) => state.sendMessage);
  const abort = useAgentStore((state) => state.abort);
  const agent = useAgentStore((state) => state.agent);

  const handleSend = useCallback(async (message: string) => {
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Show error to user
    }
  }, [sendMessage]);

  const handleAbort = useCallback(() => {
    abort();
  }, [abort]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Message List */}
      <MessageList
        messages={messages}
        streamMessage={streamMessage}
        isStreaming={isStreaming}
        autoScroll={true}
      />

      {/* Message Editor */}
      <MessageEditor
        onSend={handleSend}
        onAbort={handleAbort}
        disabled={!agent}
        isStreaming={isStreaming}
        placeholder={
          !agent
            ? 'Initializing agent...'
            : 'Type a message...'
        }
      />
    </div>
  );
}
