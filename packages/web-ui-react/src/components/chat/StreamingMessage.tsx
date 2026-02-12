import { memo } from 'react';
import type { AgentMessage } from '@mariozechner/pi-agent-core';

export interface StreamingMessageProps {
  message: AgentMessage | null;
}

/**
 * Optimized streaming message component
 * Uses React.memo to prevent unnecessary re-renders of the parent MessageList
 */
export const StreamingMessage = memo(function StreamingMessage({ message }: StreamingMessageProps) {
  if (!message) return null;

  const renderContent = () => {
    // Handle AssistantMessage with array content
    if (message.role === 'assistant' && Array.isArray(message.content)) {
      return (
        <div className="space-y-2">
          {message.content.map((block, idx) => {
            if (block.type === 'text') {
              const isLast = idx === message.content.length - 1;
              return (
                <div key={idx} className="whitespace-pre-wrap break-words">
                  {block.text}
                  {isLast && <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />}
                </div>
              );
            }

            if (block.type === 'thinking') {
              return (
                <details key={idx} className="mt-2 p-3 bg-secondary/50 rounded-lg text-sm" open>
                  <summary className="cursor-pointer font-medium text-muted-foreground">
                    💭 Thinking...
                  </summary>
                  <div className="mt-2 whitespace-pre-wrap text-muted-foreground animate-shimmer bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:200%_100%] bg-clip-text text-transparent">
                    {block.thinking}
                  </div>
                </details>
              );
            }

            return null;
          })}
        </div>
      );
    }

    // Handle UserMessage with string content
    if (message.role === 'user' && typeof message.content === 'string') {
      return (
        <div className="whitespace-pre-wrap break-words">
          {message.content}
          <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%]">
        <div className="bg-secondary rounded-2xl px-4 py-3 animate-pulse-subtle">
          {renderContent()}

          <div className="text-xs text-muted-foreground mt-2 opacity-70">
            Streaming...
          </div>
        </div>
      </div>
    </div>
  );
});
