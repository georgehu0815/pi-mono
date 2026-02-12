import type { AgentMessage } from '@mariozechner/pi-agent-core';

export interface AssistantMessageProps {
  message: AgentMessage;
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  // Only AssistantMessage has structured content array
  if (message.role !== 'assistant') {
    return null;
  }

  // Extract tool calls from content
  const toolCalls = message.content.filter(block => block.type === 'toolCall');

  const renderContent = () => {
    return (
      <div className="space-y-2">
        {message.content.map((block, idx) => {
          if (block.type === 'text') {
            return (
              <div key={idx} className="whitespace-pre-wrap break-words">
                {block.text}
              </div>
            );
          }

          if (block.type === 'thinking') {
            return (
              <details key={idx} className="mt-2 p-3 bg-secondary/50 rounded-lg text-sm">
                <summary className="cursor-pointer font-medium text-muted-foreground">
                  💭 Thinking...
                </summary>
                <div className="mt-2 whitespace-pre-wrap text-muted-foreground">
                  {block.thinking}
                </div>
              </details>
            );
          }

          return null;
        })}
      </div>
    );
  };

  const renderToolCalls = () => {
    if (toolCalls.length === 0) {
      return null;
    }

    return (
      <div className="mt-3 space-y-2">
        {toolCalls.map((toolCall, idx) => (
          <div key={idx} className="p-2 bg-secondary rounded-lg text-sm">
            <div className="font-medium text-xs text-muted-foreground mb-1">
              🔧 {toolCall.type === 'toolCall' ? toolCall.name : 'Tool'}
            </div>
            {toolCall.type === 'toolCall' && toolCall.arguments && (
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(toolCall.arguments, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%]">
        <div className="bg-secondary rounded-2xl px-4 py-3">
          {renderContent()}
          {renderToolCalls()}

          {/* Usage info - only available on AssistantMessage */}
          {message.usage && (
            <div className="mt-3 pt-2 border-t border-border text-xs text-muted-foreground flex items-center gap-4">
              <span>
                {message.usage.totalTokens} tokens
              </span>
              <span className="text-muted-foreground/70">
                (in: {message.usage.input}, out: {message.usage.output})
              </span>
              {message.usage.cacheRead > 0 && (
                <span className="text-green-500">
                  {message.usage.cacheRead} cached
                </span>
              )}
              {message.usage.cost.total > 0 && (
                <span className="text-blue-500">
                  ${message.usage.cost.total.toFixed(4)}
                </span>
              )}
            </div>
          )}

          {/* Timestamp */}
          {message.timestamp && (
            <div className="text-xs text-muted-foreground mt-2 opacity-70">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
