/**
 * Azure OpenAI Proxy Server with Managed Identity
 *
 * This proxy server allows the web-ui to use Azure OpenAI with managed identity
 * by handling authentication server-side and proxying requests from the browser.
 */

import { createServer } from 'http';
import { AzureCliCredential, ManagedIdentityCredential, getBearerTokenProvider } from '@azure/identity';
import {
  AZURE_OPENAI_SCOPE,
  AZURE_OPENAI_MANAGED_IDENTITY_CLIENT_ID,
  AZURE_OPENAI_API_VERSION,
} from '../ai/src/providers/azure-openai-models.js';

const PORT = process.env.PORT || 3001;

// Azure OpenAI configuration
// Note: Base URL should NOT include /openai suffix - it's added by the request path
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT ||
  'https://datacopilothub8882317788.cognitiveservices.azure.com';

// Get Azure credential (CLI for dev, Managed Identity for production)
function getAzureCredential() {
  if (process.env.NODE_ENV === 'production') {
    console.log('[Proxy] Using ManagedIdentityCredential');
    return new ManagedIdentityCredential(AZURE_OPENAI_MANAGED_IDENTITY_CLIENT_ID);
  } else {
    console.log('[Proxy] Using AzureCliCredential');
    return new AzureCliCredential();
  }
}

// Get bearer token provider
const credential = getAzureCredential();
const getToken = getBearerTokenProvider(credential, AZURE_OPENAI_SCOPE);

const server = createServer(async (req, res) => {
  // Enable CORS for browser access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, api-key');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'azure-openai-proxy',
      endpoint: AZURE_OPENAI_ENDPOINT,
      apiVersion: AZURE_OPENAI_API_VERSION
    }));
    return;
  }

  // Proxy requests to Azure OpenAI
  if (req.url?.startsWith('/openai/') || req.url?.startsWith('/v1/')) {
    try {
      // Get access token
      const token = await getToken();

      // Read request body
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      await new Promise<void>((resolve) => {
        req.on('end', () => resolve());
      });

      // Build Azure URL
      const path = req.url.startsWith('/v1/') ? req.url.replace('/v1/', '/openai/') : req.url;
      const azureUrl = `${AZURE_OPENAI_ENDPOINT}${path}?api-version=${AZURE_OPENAI_API_VERSION}`;

      console.log(`[Proxy] ${req.method} ${path} -> ${azureUrl}`);

      // Forward request to Azure OpenAI
      const response = await fetch(azureUrl, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: req.method === 'POST' ? body : undefined,
      });

      // Forward response headers
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      // Stream response body
      res.writeHead(response.status);

      if (response.body) {
        const reader = response.body.getReader();
        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            return;
          }
          res.write(value);
          pump();
        };
        await pump();
      } else {
        res.end();
      }
    } catch (error) {
      console.error('[Proxy] Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
          type: 'proxy_error'
        }
      }));
    }
    return;
  }

  // 404 for unknown routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: { message: 'Not found', type: 'not_found' } }));
});

server.listen(PORT, () => {
  console.log(`\n🚀 Azure OpenAI Proxy Server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Using ${process.env.NODE_ENV === 'production' ? 'Managed Identity' : 'Azure CLI'} authentication`);
  console.log(`📍 Endpoint: ${AZURE_OPENAI_ENDPOINT}`);
  console.log(`📋 API Version: ${AZURE_OPENAI_API_VERSION}\n`);
});
