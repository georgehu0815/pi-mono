/**
 * Azure OpenAI Proxy Server with Managed Identity
 * Standalone version with no external dependencies from the monorepo
 */

import { createServer } from 'http';
import { AzureCliCredential, ManagedIdentityCredential, getBearerTokenProvider } from '@azure/identity';

const PORT = process.env.PORT || 3001;

// Azure OpenAI configuration
// Note: Base URL should NOT include /openai suffix - it's added by the request path
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT ||
  'https://datacopilothub8882317788.cognitiveservices.azure.com';
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2025-03-01-preview';
const AZURE_OPENAI_SCOPE = 'https://cognitiveservices.azure.com/.default';
const AZURE_OPENAI_MANAGED_IDENTITY_CLIENT_ID = 'c9427d44-98e2-406a-9527-f7fa7059f984';

// Get Azure credential (CLI for dev, Managed Identity for production)
function getAzureCredential() {
  if (process.env.NODE_ENV === 'production') {
    console.log('[Proxy] Using ManagedIdentityCredential - azure-proxy-server.js:22');
    return new ManagedIdentityCredential(AZURE_OPENAI_MANAGED_IDENTITY_CLIENT_ID);
  } else {
    console.log('[Proxy] Using AzureCliCredential - azure-proxy-server.js:25');
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
  res.setHeader('Access-Control-Allow-Headers', '*');

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

  // Proxy all non-health-check requests to Azure OpenAI
  try {
    // Get access token
    const token = await getToken();

    // Read request body
    let body = '';
    for await (const chunk of req) {
      body += chunk.toString();
    }

    // Build Azure URL
    // For Responses API: deployment is in request body, not URL path
    // Transform /responses -> /openai/responses
    let path = req.url;

    // For /responses endpoint, just add /openai prefix
    // The deployment name is passed in the request body as the "model" field
    if (path.startsWith('/responses')) {
      path = '/openai' + path;
    } else if (path.startsWith('/v1/')) {
      // Legacy chat completions endpoint
      const DEPLOYMENT_NAME = 'gpt-5.2-chat';
      path = path.replace('/v1/', '/openai/deployments/' + DEPLOYMENT_NAME + '/');
    } else if (path.startsWith('/openai/')) {
      // Already has /openai prefix, use as-is
      path = path;
    } else {
      // Default: add /openai prefix
      path = '/openai' + path;
    }

    // Remove any existing api-version parameter and add the correct one
    path = path.replace(/[?&]api-version=[^&]*/, '');
    const separator = path.includes('?') ? '&' : '?';
    const azureUrl = `${AZURE_OPENAI_ENDPOINT}${path}${separator}api-version=${AZURE_OPENAI_API_VERSION}`;

    console.log(`[Proxy] ${req.method} ${path} > ${azureUrl} - azure-proxy-server.js:89`);

    // Log request body for debugging
    if (req.method === 'POST' && body) {
      try {
        const bodyJson = JSON.parse(body);
        console.log('[Proxy] Request body:', JSON.stringify(bodyJson, null, 2).substring(0, 500));
      } catch (e) {
        console.log('[Proxy] Request body (raw):', body.substring(0, 200));
      }
    }

    const response = await fetch(azureUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: req.method === 'POST' ? body : undefined,
    });

    console.log(`[Proxy] Azure response status: ${response.status} - azure-proxy-server.js:100`);

    // Forward response
    res.writeHead(response.status, {
      'Content-Type': response.headers.get('content-type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
    });

    if (response.body) {
      const reader = response.body.getReader();
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        res.write(value);
      }

      // Log error response for debugging
      if (!response.ok) {
        try {
          const decoder = new TextDecoder();
          const text = decoder.decode(Buffer.concat(chunks));
          console.log('[Proxy] Error response:', text.substring(0, 500));
        } catch (e) {
          // Ignore decode errors
        }
      }
    }
    res.end();
  } catch (error) {
    console.error('[Proxy] Error: - azure-proxy-server.js:118', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        type: 'proxy_error'
      }
    }));
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Azure OpenAI Proxy Server running on http://localhost:${PORT} - azure-proxy-server.js:130`);
  console.log(`📝 Health check: http://localhost:${PORT}/health - azure-proxy-server.js:131`);
  console.log(`🔐 Using ${process.env.NODE_ENV === 'production' ? 'Managed Identity' : 'Azure CLI'} authentication - azure-proxy-server.js:132`);
  console.log(`📍 Endpoint: ${AZURE_OPENAI_ENDPOINT} - azure-proxy-server.js:133`);
  console.log(`📋 API Version: ${AZURE_OPENAI_API_VERSION}\n - azure-proxy-server.js:134`);
});
