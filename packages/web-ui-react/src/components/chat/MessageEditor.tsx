import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

export interface MessageEditorProps {
  onSend: (message: string) => void;
  onAbort?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
}

export function MessageEditor({
  onSend,
  onAbort,
  disabled = false,
  isStreaming = false,
  placeholder = 'Type a message...',
}: MessageEditorProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }

    // Escape to abort streaming
    if (e.key === 'Escape' && isStreaming) {
      e.preventDefault();
      onAbort?.();
      return;
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="border-t border-border bg-background">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-end gap-2">
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                minHeight: '48px',
                maxHeight: '200px',
              }}
            />

            {/* Character count (if input is long) */}
            {input.length > 100 && (
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {input.length}
              </div>
            )}
          </div>

          {/* Send/Abort Button */}
          {isStreaming ? (
            <button
              onClick={onAbort}
              className="shrink-0 h-12 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <div className="w-3 h-3 bg-white rounded-sm" />
              Stop
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={disabled || !input.trim()}
              className="shrink-0 h-12 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </button>
          )}
        </div>

        {/* Helper text */}
        <div className="mt-2 text-xs text-muted-foreground">
          Press <kbd className="px-1 py-0.5 bg-secondary rounded">Enter</kbd> to send,{' '}
          <kbd className="px-1 py-0.5 bg-secondary rounded">Shift+Enter</kbd> for new line
          {isStreaming && (
            <>
              , <kbd className="px-1 py-0.5 bg-secondary rounded">Esc</kbd> to stop
            </>
          )}
        </div>
      </div>
    </div>
  );
}
