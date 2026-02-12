import { useState } from 'react';
import { X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export function SettingsDialog() {
  const isOpen = useUIStore((state) => state.settingsOpen);
  const closeSettings = useUIStore((state) => state.closeSettings);
  const [activeTab, setActiveTab] = useState<'proxy' | 'models'>('proxy');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={closeSettings}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('proxy')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'proxy'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Proxy
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'models'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Models & Providers
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'proxy' && <ProxyTab />}
          {activeTab === 'models' && <ModelsTab />}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={closeSettings}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ProxyTab() {
  const [proxyEnabled, setProxyEnabled] = useState(true);
  const [proxyUrl, setProxyUrl] = useState('http://localhost:3001');

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">CORS Proxy</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use a proxy server to bypass CORS restrictions when calling APIs from the browser.
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="proxy-enabled"
              checked={proxyEnabled}
              onChange={(e) => setProxyEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="proxy-enabled" className="text-sm cursor-pointer">
              Enable proxy
            </label>
          </div>

          <div>
            <label htmlFor="proxy-url" className="block text-sm font-medium mb-1">
              Proxy URL
            </label>
            <input
              type="text"
              id="proxy-url"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              disabled={!proxyEnabled}
              placeholder="http://localhost:3001"
              className="w-full px-3 py-2 border border-border rounded bg-background disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Azure OpenAI proxy server URL (default: http://localhost:3001)
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          ℹ️ The Azure proxy server uses Managed Identity for authentication.
          Make sure it's running on port 3001.
        </p>
      </div>
    </div>
  );
}

function ModelsTab() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Current Model</h3>
        <div className="p-3 bg-secondary rounded">
          <div className="text-sm font-medium">Azure OpenAI - gpt-5.2</div>
          <div className="text-xs text-muted-foreground mt-1">
            Configured via proxy server
          </div>
        </div>
      </div>

      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          🚧 Model switching coming in a future update. Currently using Azure OpenAI gpt-5.2.
        </p>
      </div>
    </div>
  );
}
