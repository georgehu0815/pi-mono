import type { AgentMessage } from '@mariozechner/pi-agent-core';

export interface UserMessageProps {
  message: AgentMessage;
}

export function UserMessage({ message }: UserMessageProps) {
  // Only UserMessage can have string or array content
  if (message.role !== 'user') {
    return null;
  }

  const renderContent = () => {
    if (typeof message.content === 'string') {
      return <div className="whitespace-pre-wrap break-words">{message.content}</div>;
    }

    // Handle array of content blocks
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

          if (block.type === 'image') {
            return (
              <div key={idx} className="mt-2">
                <img
                  src={`data:${block.mimeType};base64,${block.data}`}
                  alt="User uploaded image"
                  className="max-w-full rounded-lg"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  return (
    <div className="flex justify-end mb-4">
      <div className="user-message-container rounded-2xl px-4 py-3 max-w-[80%]">
        {renderContent()}

        {/* Timestamp */}
        {message.timestamp && (
          <div className="text-xs text-muted-foreground mt-2 opacity-70">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
