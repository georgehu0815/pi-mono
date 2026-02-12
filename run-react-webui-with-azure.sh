#!/bin/bash
#
# Run Pi Web UI React with Azure OpenAI Managed Identity
#

set -e

echo "🚀 Starting Pi Web UI React with Azure OpenAI Managed Identity"
echo ""

# Check if Azure CLI is authenticated
if ! az account show &> /dev/null; then
    echo "❌ Azure CLI is not authenticated"
    echo "Please run: az login"
    exit 1
fi

echo "✅ Azure CLI authenticated"

# Set Azure OpenAI environment variables for proxy server
export AZURE_OPENAI_ENDPOINT="${AZURE_OPENAI_ENDPOINT:-https://datacopilothub8882317788.cognitiveservices.azure.com}"
export AZURE_OPENAI_API_VERSION="${AZURE_OPENAI_API_VERSION:-2025-03-01-preview}"

echo "✅ Azure OpenAI configuration set"
echo "   API Version: $AZURE_OPENAI_API_VERSION"
echo ""

# Start Azure proxy server in background
cd packages/web-ui
echo "📡 Starting Azure proxy server on port 3001..."
node azure-proxy-server.js &
PROXY_PID=$!
cd ../..

# Wait for proxy to be ready
sleep 2

# Check if proxy is running
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "❌ Proxy server failed to start"
    kill $PROXY_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Proxy server running at http://localhost:3001"
echo ""

# Set environment variables for React web UI
export AZURE_OPENAI_BASE_URL="http://localhost:3001/openai"

# Start React web UI
cd packages/web-ui-react
echo "🌐 Starting React web UI on port 5174..."
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Pi Web UI React with Azure OpenAI is ready!"
echo ""
echo "   Web UI:  http://localhost:5174"
echo "   Proxy:   http://localhost:3001"
echo ""
echo "   Authentication: Azure Managed Identity (AzureCliCredential)"
echo "   Configuration: Web UI automatically routes through proxy"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Ready to use:"
echo "   1. Open http://localhost:5174"
echo "   2. Test the infrastructure with 'Test Send Message' button"
echo "   3. All requests automatically go through the proxy server"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Trap Ctrl+C to clean up both processes
trap "echo ''; echo 'Stopping servers...'; kill $PROXY_PID 2>/dev/null || true; exit" INT TERM

# Run vite dev server (this blocks)
npm run dev

# Cleanup on exit
kill $PROXY_PID 2>/dev/null || true
