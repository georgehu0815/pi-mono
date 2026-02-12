#!/bin/bash
#
# Test pi CLI with Azure OpenAI Managed Identity
#

# Azure OpenAI Configuration (Managed Identity - No API Key Required)
export AZURE_OPENAI_BASE_URL="https://datacopilothub8882317788.cognitiveservices.azure.com/openai"
export AZURE_OPENAI_API_VERSION="2025-03-01-preview"
export AZURE_OPENAI_DEPLOYMENT_NAME_MAP="gpt-5.2=gpt-5.2-chat"

# Set default provider and model
export PI_DEFAULT_PROVIDER="azure-openai-responses"
export PI_DEFAULT_MODEL="gpt-5.2"

echo "🧪 Testing pi CLI with Azure OpenAI (Managed Identity)"
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

# Run pi in print mode (non-interactive) with a simple test prompt
cd /Users/ghu/aiworker/pi-mono
node packages/coding-agent/dist/cli.js \
  --provider azure-openai-responses \
  --model gpt-5.2 \
  --print \
  --no-session \
  "What is 2+2? Reply with just the number."
