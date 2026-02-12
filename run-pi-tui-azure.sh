#!/bin/bash
#
# Run pi CLI TUI with Azure OpenAI Managed Identity
#

# Azure OpenAI Configuration (Managed Identity - No API Key Required)
export AZURE_OPENAI_BASE_URL="https://datacopilothub8882317788.cognitiveservices.azure.com/openai"
export AZURE_OPENAI_API_VERSION="2025-03-01-preview"
export AZURE_OPENAI_DEPLOYMENT_NAME_MAP="gpt-5.2=gpt-5.2-chat"

echo "🚀 Starting pi TUI with Azure OpenAI (Managed Identity)"
echo "  Azure Endpoint: $AZURE_OPENAI_BASE_URL"
echo "  API Version: $AZURE_OPENAI_API_VERSION"
echo "  Deployment: gpt-5.2-chat"
echo ""

# Check if Azure CLI is logged in
if ! az account show &> /dev/null; then
    echo "❌ Error: Azure CLI not authenticated"
    echo ""
    echo "Please run: az login"
    exit 1
fi

echo "✅ Azure CLI authenticated"
echo ""
echo "📝 Usage:"
echo "  - Type your message and press Enter to send"
echo "  - Ctrl+P to switch models"
echo "  - Ctrl+L to toggle thinking level"
echo "  - Ctrl+C to exit"
echo "  - /help for more commands"
echo ""
echo "Starting interactive session in 2 seconds..."
sleep 2

# Run pi in interactive mode with Azure OpenAI
cd /Users/ghu/aiworker/pi-mono
node packages/coding-agent/dist/cli.js \
  --provider azure-openai-responses \
  --model gpt-5.2 \
  --session-dir ~/.pi-azure-sessions
