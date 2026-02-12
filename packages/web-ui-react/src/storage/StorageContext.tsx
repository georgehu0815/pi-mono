import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  AppStorage,
  SettingsStore,
  ProviderKeysStore,
  SessionsStore,
  CustomProvidersStore,
  IndexedDBStorageBackend,
  setAppStorage,
} from '@mariozechner/pi-web-ui';

export interface StorageContextValue {
  storage: AppStorage;
}

const StorageContext = createContext<StorageContextValue | null>(null);

export interface StorageProviderProps {
  children: ReactNode;
  dbName?: string;
}

export function StorageProvider({ children, dbName = 'pi-web-ui-react-azure' }: StorageProviderProps) {
  const storage = useMemo(() => {
    // Create stores
    const settings = new SettingsStore();
    const providerKeys = new ProviderKeysStore();
    const sessions = new SessionsStore();
    const customProviders = new CustomProvidersStore();

    // Gather configs
    const configs = [
      settings.getConfig(),
      SessionsStore.getMetadataConfig(),
      providerKeys.getConfig(),
      customProviders.getConfig(),
      sessions.getConfig(),
    ];

    // Create IndexedDB backend
    const backend = new IndexedDBStorageBackend({
      dbName,
      version: 2,
      stores: configs,
    });

    // Wire backend to stores
    settings.setBackend(backend);
    providerKeys.setBackend(backend);
    customProviders.setBackend(backend);
    sessions.setBackend(backend);

    // Create AppStorage instance
    const appStorage = new AppStorage(settings, providerKeys, sessions, customProviders, backend);

    // Set global app storage (for compatibility with pi-web-ui components)
    setAppStorage(appStorage);

    return appStorage;
  }, [dbName]);

  return (
    <StorageContext.Provider value={{ storage }}>
      {children}
    </StorageContext.Provider>
  );
}

/**
 * Hook to access the AppStorage instance
 *
 * Usage:
 * ```tsx
 * const { storage } = useStorage();
 * const proxyEnabled = await storage.settings.get('proxy.enabled');
 * ```
 */
export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}
