#!/bin/bash
#
# Run Mom Slack Bot with Azure OpenAI Managed Identity
#

# Azure OpenAI Configuration (Managed Identity - No API Key Required)
export AZURE_OPENAI_BASE_URL="https://datacopilothub8882317788.cognitiveservices.azure.com/openai"
export AZURE_OPENAI_API_VERSION="2025-03-01-preview"
export AZURE_OPENAI_DEPLOYMENT_NAME_MAP="gpt-5.2=gpt-5.2-chat"

# Slack Bot Credentials (Required - Get these from https://api.slack.com/apps)
# Uncomment and set these values:
# export MOM_SLACK_APP_TOKEN="xapp-1-..."  # App-level token with connections:write
# export MOM_SLACK_BOT_TOKEN="xoxb-..."   # Bot User OAuth Token

# Working directory for mom's workspace
WORKSPACE_DIR="./mom-workspace"

# Model configuration (optional - defaults to Azure OpenAI if credentials are available)
# export MOM_DEFAULT_PROVIDER="azure-openai-responses"
# export MOM_DEFAULT_MODEL="gpt-5.2"

echo "Starting mom with Azure OpenAI (Managed Identity)..."
echo "  Workspace: $WORKSPACE_DIR"
echo "  Azure Endpoint: $AZURE_OPENAI_BASE_URL"
echo "  API Version: $AZURE_OPENAI_API_VERSION"
echo ""

# Check if Slack tokens are set
if [ -z "$MOM_SLACK_APP_TOKEN" ] || [ -z "$MOM_SLACK_BOT_TOKEN" ]; then
    echo "❌ Error: Slack credentials not set"
    echo ""
    echo "Please set the following environment variables:"
    echo "  export MOM_SLACK_APP_TOKEN='xapp-1-...'  # From Slack App settings"
    echo "  export MOM_SLACK_BOT_TOKEN='xoxb-...'    # From OAuth & Permissions"
    echo ""
    echo "See packages/mom/docs/slack-bot-minimal-guide.md for setup instructions"
    exit 1
fi

# Check if Azure CLI is logged in (required for managed identity in development)
if ! az account show &> /dev/null; then
    echo "❌ Error: Azure CLI not authenticated"
    echo ""
    echo "Please run: az login"
    exit 1
fi

echo "✅ Azure CLI authenticated"
echo "✅ Slack credentials configured"
echo ""

# Run mom
cd packages/mom
node dist/main.js "$WORKSPACE_DIR"
