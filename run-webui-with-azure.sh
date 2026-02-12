#!/bin/bash
#
# Run Pi Web UI with Azure OpenAI Managed Identity
#

set -e

echo "🚀 Starting Pi Web UI with Azure OpenAI Managed Identity"
echo ""

# Check if Azure CLI is authenticated
if ! az account show &> /dev/null; then
    echo "❌ Error: Azure CLI not authenticated"
    echo ""
    echo "Please run: az login"
    exit 1
fi

echo "✅ Azure CLI authenticated"

# Set Azure OpenAI configuration for proxy server
export AZURE_OPENAI_API_VERSION="2025-03-01-preview"
export NODE_ENV="development"

echo "✅ Azure OpenAI configuration set"
echo "   API Version: $AZURE_OPENAI_API_VERSION"
echo ""

# Start proxy server in background
echo "📡 Starting Azure proxy server on port 3001..."
cd packages/web-ui
node azure-proxy-server.js &
PROXY_PID=$!

# Wait for proxy to be ready
sleep 3

# Check if proxy is running
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "❌ Error: Proxy server failed to start"
    echo "   Check if @azure/identity is installed: npm install @azure/identity"
    kill $PROXY_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Proxy server running at http://localhost:3001"
echo ""

# Configure web UI to use proxy server
# Note: Include /openai path so requests match proxy's route pattern
export AZURE_OPENAI_BASE_URL="http://localhost:3001/openai"

# Start web UI (using Azure entry point with proxy configuration)
echo "🌐 Starting web UI on port 5173..."
cd example
npm run dev &
VITE_PID=$!

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Pi Web UI with Azure OpenAI is ready!"
echo ""
echo "   Web UI:  http://localhost:5173"
echo "   Proxy:   http://localhost:3001"
echo ""
echo "   Authentication: Azure Managed Identity (AzureCliCredential)"
echo "   Configuration: Web UI automatically routes through proxy"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Ready to use:"
echo "   1. Open http://localhost:5173"
echo "   2. Start chatting - Azure OpenAI is the default model"
echo "   3. All requests automatically go through the proxy server"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $PROXY_PID 2>/dev/null || true
    kill $VITE_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for either process to exit
wait $VITE_PID $PROXY_PID
