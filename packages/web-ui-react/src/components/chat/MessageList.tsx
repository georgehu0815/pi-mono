import { useRef, useEffect } from 'react';
import type { AgentMessage } from '@mariozechner/pi-agent-core';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { StreamingMessage } from './StreamingMessage';

export interface MessageListProps {
  messages: AgentMessage[];
  streamMessage: AgentMessage | null;
  isStreaming: boolean;
  autoScroll?: boolean;
}

export function MessageList({ messages, streamMessage, isStreaming, autoScroll = true }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or streaming updates
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, streamMessage, autoScroll]);

  const renderMessage = (message: AgentMessage, index: number) => {
    const role = message.role;

    if (role === 'user') {
      return <UserMessage key={index} message={message} />;
    }

    if (role === 'assistant') {
      return <AssistantMessage key={index} message={message} />;
    }

    if (role === 'toolResult') {
      return (
        <div key={index} className="mb-4 px-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
            <div className="font-medium text-xs text-blue-600 dark:text-blue-400 mb-2">
              🔧 Tool Result: {message.toolName}
            </div>
            <div className="text-muted-foreground">
              {message.content.map((block, idx) => {
                if (block.type === 'text') {
                  return <div key={idx}>{block.text}</div>;
                }
                if (block.type === 'image') {
                  return (
                    <img
                      key={idx}
                      src={`data:${block.mimeType};base64,${block.data}`}
                      alt="Tool result"
                      className="max-w-full rounded"
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      );
    }

    // Handle custom message types (artifact, system-notification, etc.)
    // These are extended via declaration merging in CustomAgentMessages
    // We use type guards to check properties that might exist
    const customMessage = message as any;

    if (customMessage.role === 'artifact') {
      return (
        <div key={index} className="mb-4 px-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm">
            <div className="font-medium text-xs text-purple-600 dark:text-purple-400 mb-2">
              📦 Artifact
            </div>
            <div className="text-muted-foreground">
              {typeof customMessage.content === 'string'
                ? customMessage.content
                : JSON.stringify(customMessage.content, null, 2)}
            </div>
          </div>
        </div>
      );
    }

    if (customMessage.role === 'system-notification') {
      return (
        <div key={index} className="mb-4 px-4">
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-center">
            <div className="text-muted-foreground">
              {typeof customMessage.content === 'string'
                ? customMessage.content
                : JSON.stringify(customMessage.content)}
            </div>
          </div>
        </div>
      );
    }

    // Fallback for unknown message types
    return (
      <div key={index} className="mb-4 px-4">
        <div className="p-3 bg-secondary rounded-lg text-sm">
          <div className="font-medium text-xs text-muted-foreground mb-2">
            {role}
          </div>
          <div className="text-muted-foreground">
            {JSON.stringify(customMessage.content)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
    >
      <div className="max-w-3xl mx-auto">
        {messages.length === 0 && !isStreaming && (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <div>
              <div className="text-4xl mb-4">💬</div>
              <div className="text-lg font-medium mb-2">No messages yet</div>
              <div className="text-sm">Start a conversation with Azure OpenAI</div>
            </div>
          </div>
        )}

        {messages.map((message, index) => renderMessage(message, index))}

        {/* Streaming message (separate from stable messages for optimization) */}
        {isStreaming && streamMessage && (
          <StreamingMessage message={streamMessage} />
        )}

        {/* Invisible element to scroll to */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
