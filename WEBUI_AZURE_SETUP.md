# Running Pi Web UI with Azure OpenAI Managed Identity

## Overview

This guide shows how to run the Pi Web UI with Azure OpenAI using managed identity authentication. Since managed identity requires server-side libraries that don't work in browsers, we use a proxy server architecture.

## Architecture

```
Browser (Web UI)
    ↓ HTTP requests (http://localhost:3001/openai/*)
Proxy Server (Node.js)
    ↓ Managed Identity Auth + Bearer Token
Azure OpenAI (https://datacopilothub8882317788.cognitiveservices.azure.com)
```

### How It Works

1. **Web UI** makes request to: `http://localhost:3001/openai/responses`
2. **Proxy** receives request matching `/openai/*` or `/v1/*` route
3. **Proxy** gets bearer token via Azure managed identity
4. **Proxy** forwards to: `https://.../openai/responses?api-version=2025-03-01-preview`
5. **Azure** processes request and returns response
6. **Proxy** streams response back to browser

## Prerequisites

### 1. Azure OpenAI (✅ Already Configured!)

- **Endpoint**: `https://datacopilothub8882317788.cognitiveservices.azure.com`
- **API Version**: `2025-03-01-preview`
- **Deployment**: `gpt-5.2-chat`
- **Authentication**: Managed Identity (Client ID: `c9427d44-98e2-406a-9527-f7fa7059f984`)

### 2. Azure CLI (✅ Already Done!)

```bash
az login  # Already authenticated
az account show  # Verify
```

### 3. Dependencies

All dependencies are already installed in the monorepo:
- `@azure/identity` - For managed identity authentication
- `openai` - Azure OpenAI SDK
- Vite - Development server for web UI

## Quick Start

### Option 1: Using the Startup Script (Recommended) ⭐

```bash
# From the monorepo root
./run-webui-with-azure.sh
```

This will:
1. ✅ Verify Azure CLI authentication
2. 🔧 Set environment variables automatically
3. 📡 Start the proxy server on port 3001
4. 🌐 Start the web UI on port 5173
5. 🔗 Configure web UI to route through proxy automatically

**No manual configuration needed!** Just run the script and open http://localhost:5173

### Option 2: Manual Start

#### Step 1: Start Proxy Server

```bash
cd packages/web-ui

# Set environment variables
export AZURE_OPENAI_API_VERSION="2025-03-01-preview"
export NODE_ENV="development"

# Start proxy (uses JavaScript version for compatibility)
node azure-proxy-server.js
```

The proxy will start on **http://localhost:3001**

**Note**: The proxy uses a hardcoded Azure endpoint (`https://datacopilothub8882317788.cognitiveservices.azure.com`) so you don't need to set `AZURE_OPENAI_ENDPOINT`.

#### Step 2: Start Web UI

In a new terminal:

```bash
cd packages/web-ui/example

# Configure web UI to use proxy
export AZURE_OPENAI_BASE_URL="http://localhost:3001/openai"
export AZURE_OPENAI_API_VERSION="2025-03-01-preview"

# Start web UI
npm run dev
```

The web UI will start on **http://localhost:5173**

**Important**: The web UI needs `AZURE_OPENAI_BASE_URL="http://localhost:3001/openai"` (with `/openai` suffix) so requests match the proxy's routing pattern.

## Configuration Details

### Environment Variables

**For Proxy Server**:
- `AZURE_OPENAI_ENDPOINT` (optional) - Azure endpoint without `/openai` suffix
  - Default: `https://datacopilothub8882317788.cognitiveservices.azure.com`
- `AZURE_OPENAI_API_VERSION` - API version for Responses API
  - Default: `2025-03-01-preview`
- `NODE_ENV` - Environment mode
  - `development`: Uses AzureCliCredential (requires `az login`)
  - `production`: Uses ManagedIdentityCredential
- `PORT` (optional) - Proxy server port (default: 3001)

**For Web UI**:
- `AZURE_OPENAI_BASE_URL` - Proxy URL with `/openai` path
  - Value: `http://localhost:3001/openai`
- `AZURE_OPENAI_API_VERSION` - Must match proxy version
  - Value: `2025-03-01-preview`

### Why Two Different Base URLs?

**Proxy uses**: `https://datacopilothub8882317788.cognitiveservices.azure.com` (no `/openai`)
- Proxy appends the full path from incoming requests
- Example: `/openai/responses` → `https://.../openai/responses`

**Web UI uses**: `http://localhost:3001/openai` (with `/openai`)
- Ensures requests match proxy routing (`/openai/*` or `/v1/*`)
- Azure OpenAI SDK appends paths like `/responses`
- Full URL: `http://localhost:3001/openai/responses` ✓

## Features

### Default Model

The web UI is configured to use **Azure OpenAI gpt-5.2** as the default model via [main-azure.ts](packages/web-ui/example/src/main-azure.ts).

### Authentication Flow

1. **Browser**: Makes request with dummy API key ("proxy-handled")
2. **Proxy**: Intercepts request, gets Azure AD bearer token
3. **Proxy**: Adds `Authorization: Bearer <token>` header
4. **Azure**: Validates token and processes request
5. **Proxy**: Streams response back to browser

### Managed Identity

- **Development**: Uses `AzureCliCredential`
  - Requires: `az login`
  - Uses your Azure CLI credentials

- **Production**: Uses `ManagedIdentityCredential`
  - Automatic when deployed to Azure
  - No credentials needed in code/config
  - Client ID: `c9427d44-98e2-406a-9527-f7fa7059f984`

### Browser Compatibility

The azure-openai-responses provider automatically detects browser environments and:
- Skips managed identity token provider (requires Node.js)
- Uses dummy API key (proxy adds real auth header)
- Relies on proxy server for authentication

## File Structure

```
packages/web-ui/
├── azure-proxy-server.js          # Proxy server (production/standalone)
├── azure-proxy-server.ts          # Proxy server (TypeScript source)
├── example/
│   ├── src/
│   │   ├── main-azure.ts          # Web UI for Azure OpenAI (✓ Used)
│   │   ├── main.ts                # Original (Anthropic default)
│   │   └── custom-messages.js     # Custom message renderers
│   ├── index.html                 # Entry point (loads main-azure.ts)
│   └── package.json               # Dependencies
└── README.md                      # Documentation

run-webui-with-azure.sh            # Startup script (monorepo root)
```

**Note**: The startup script uses `azure-proxy-server.js` (JavaScript) for better compatibility. Both `.js` and `.ts` versions have the same functionality.

## Testing the Web UI

Once running, try these examples in the chat:

1. **Simple query**:
   ```
   What is 2+2?
   ```

2. **JavaScript REPL**:
   ```
   Calculate the factorial of 10
   ```

3. **Create an artifact**:
   ```
   Create an HTML page with a bouncing ball animation
   ```

4. **File processing**:
   ```
   Upload a PDF and ask to summarize it
   ```

## Proxy Server API

The proxy server provides these endpoints:

### `GET /health`
Health check endpoint with configuration info.

**Example**:
```bash
curl http://localhost:3001/health
```

**Response**:
```json
{
  "status": "ok",
  "service": "azure-openai-proxy",
  "endpoint": "https://datacopilothub8882317788.cognitiveservices.azure.com",
  "apiVersion": "2025-03-01-preview"
}
```

### `POST /openai/*` and `POST /v1/*`
Proxy requests to Azure OpenAI with managed identity authentication.

**Routing**:
- `/openai/*` → Forwards as-is to Azure
- `/v1/*` → Converts to `/openai/*` then forwards

**Example**:
```bash
curl -X POST http://localhost:3001/openai/responses \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.2-chat",
    "input": [{"role": "user", "content": [{"type": "input_text", "text": "Hello"}]}]
  }'
```

## Production Deployment

### Deploying to Azure

1. **Choose Azure service**:
   - Azure App Service
   - Azure Container Apps
   - Azure Kubernetes Service
   - Azure VM

2. **Assign Managed Identity**:
   ```bash
   # For App Service
   az webapp identity assign \
     --name <app-name> \
     --resource-group <rg-name>
   ```

3. **Grant Azure OpenAI access**:
   ```bash
   az role assignment create \
     --role "Cognitive Services User" \
     --assignee <managed-identity-client-id> \
     --scope /subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.CognitiveServices/accounts/<account>
   ```

4. **Set environment variables**:
   ```bash
   # For proxy server
   AZURE_OPENAI_ENDPOINT=https://datacopilothub8882317788.cognitiveservices.azure.com
   AZURE_OPENAI_API_VERSION=2025-03-01-preview
   NODE_ENV=production

   # For web UI (if serving from same host)
   AZURE_OPENAI_BASE_URL=http://localhost:3001/openai
   ```

5. **Deploy**:
   - Build web UI: `cd packages/web-ui/example && npm run build`
   - Deploy static files to Azure Static Web Apps or CDN
   - Deploy proxy server to Azure App Service or Container Apps
   - Managed identity will work automatically!

### Docker Deployment

**Dockerfile for Proxy Server**:
```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy proxy server and dependencies
COPY packages/web-ui/azure-proxy-server.js /app/
COPY packages/web-ui/package.json /app/

# Install dependencies
RUN npm install --production

# Expose port
EXPOSE 3001

# Start proxy server
CMD ["node", "azure-proxy-server.js"]
```

**Dockerfile for Web UI**:
```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Copy source
COPY packages/web-ui/example /app

# Install and build
RUN npm install && npm run build

# Serve static files
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

## Troubleshooting

### "Cannot connect to proxy server"

**Symptoms**: Web UI can't reach proxy, errors in browser console

**Solutions**:
1. Check if proxy is running:
   ```bash
   curl http://localhost:3001/health
   ```
2. Verify `AZURE_OPENAI_BASE_URL` is set correctly:
   ```bash
   echo $AZURE_OPENAI_BASE_URL
   # Should be: http://localhost:3001/openai
   ```
3. Check browser console for CORS errors
4. Verify proxy is listening on port 3001:
   ```bash
   lsof -i :3001
   ```

### "Not found" error from proxy

**Symptoms**: `{"error":{"message":"Not found","type":"not_found"}}`

**Cause**: Request path doesn't match `/openai/*` or `/v1/*` routing pattern

**Solutions**:
1. Check `AZURE_OPENAI_BASE_URL` includes `/openai` suffix:
   ```bash
   # Correct:
   export AZURE_OPENAI_BASE_URL="http://localhost:3001/openai"

   # Wrong (will cause "Not found"):
   export AZURE_OPENAI_BASE_URL="http://localhost:3001"
   ```
2. Restart web UI after changing environment variables
3. Check proxy logs for incoming request paths

### "Azure CLI not authenticated"

**Symptoms**: Proxy fails to start or crashes on first request

**Solutions**:
```bash
az login
az account show  # Verify authentication
```

### "404 Resource not found" from Azure

**Symptoms**: Proxy forwards request but Azure returns 404

**Possible causes**:
- API version mismatch (must be `2025-03-01-preview` or later for Responses API)
- Deployment name incorrect
- Endpoint URL incorrect

**Solutions**:
1. Verify API version:
   ```bash
   curl http://localhost:3001/health | jq '.apiVersion'
   # Should be: "2025-03-01-preview"
   ```
2. Check deployment exists:
   ```bash
   az cognitiveservices account deployment list \
     --name datacopilothub8882317788 \
     --resource-group <rg-name>
   ```
3. Verify endpoint configuration in proxy server

### Proxy server crashes

**Symptoms**: Proxy exits immediately or crashes on startup

**Solutions**:
1. Check Node.js version (requires 20+):
   ```bash
   node --version
   ```
2. Verify Azure packages are installed:
   ```bash
   cd packages/web-ui
   npm install
   ```
3. Check for authentication errors:
   ```bash
   az account show
   ```
4. Review proxy logs for error details

### Web UI shows "API key required"

**Symptoms**: UI prompts for API key despite proxy running

**Cause**: Web UI not configured to use proxy

**Solutions**:
1. Ensure `AZURE_OPENAI_BASE_URL` is set before starting web UI:
   ```bash
   export AZURE_OPENAI_BASE_URL="http://localhost:3001/openai"
   ```
2. Restart web UI:
   ```bash
   cd packages/web-ui/example
   npm run dev
   ```
3. Check browser console logs - should show:
   ```
   [Azure OpenAI Responses] Browser detected - proxy server should handle authentication
   [Azure OpenAI Responses] baseURL: http://localhost:3001/openai
   ```

### Lit.js class field warnings

**Symptoms**: Browser console shows "properties will not trigger updates" warnings

**Cause**: ChatPanel component uses class fields instead of Lit decorators

**Status**: ⚠️ Development warning only - **does not affect functionality**

**Note**: These warnings are from the pi-web-ui package and can be safely ignored. The web UI works correctly despite the warnings.

## Comparison: Proxy vs Direct Access

| Feature | Proxy Server | Direct Browser |
|---------|-------------|----------------|
| **Security** | ✅ High (managed identity) | ❌ Low (API key in browser) |
| **Production Ready** | ✅ Yes | ❌ No |
| **Setup Complexity** | Medium (automated with script) | Low |
| **CORS Issues** | ✅ None | ⚠️ Requires configuration |
| **Managed Identity** | ✅ Yes | ❌ No |
| **Browser Compatibility** | ✅ Full | ⚠️ Limited |

**Recommendation**: Always use the proxy server for production deployments.

## Resources

- [Pi Web UI Documentation](packages/web-ui/README.md)
- [Azure Managed Identity Docs](https://learn.microsoft.com/azure/active-directory/managed-identities-azure-resources/)
- [Azure OpenAI Service](https://learn.microsoft.com/azure/ai-services/openai/)
- [Azure OpenAI Responses API](https://learn.microsoft.com/azure/ai-services/openai/how-to/responses)
- [Vite Documentation](https://vitejs.dev/)

## Summary

✅ **Quick Start**: Run `./run-webui-with-azure.sh` from the monorepo root

✅ **Services**:
- Web UI: http://localhost:5173 (Azure OpenAI default)
- Proxy: http://localhost:3001 (Managed identity auth)

✅ **Key Configuration**:
- Proxy: `AZURE_OPENAI_ENDPOINT=https://datacopilothub8882317788.cognitiveservices.azure.com`
- Web UI: `AZURE_OPENAI_BASE_URL=http://localhost:3001/openai`

✅ **No manual proxy configuration needed** - startup script handles everything automatically!

## Next Steps

1. ✅ Run the web UI locally with the proxy
2. 📝 Customize the system prompt in [main-azure.ts](packages/web-ui/example/src/main-azure.ts)
3. 🎨 Modify the UI theme and styling
4. 🚀 Deploy to Azure for production use
5. 📊 Add custom tools and artifacts
