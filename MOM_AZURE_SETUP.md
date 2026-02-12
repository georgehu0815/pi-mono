# Running Mom with Azure OpenAI Managed Identity

## What is Mom?

Mom is a Slack bot powered by LLMs that can execute bash commands, read/write files, and interact with your development environment. She's self-managing and builds her own tools.

## Prerequisites

### 1. Azure OpenAI (✅ Already Configured!)

The Azure OpenAI integration with managed identity is already set up:
- **Endpoint**: `https://datacopilothub8882317788.cognitiveservices.azure.com/openai`
- **API Version**: `2025-03-01-preview`
- **Deployment**: `gpt-5.2-chat`
- **Authentication**: Managed Identity (no API key required)

**Local Development**: Requires `az login` (already done ✅)

### 2. Slack App Setup (Required)

Mom needs Slack credentials to operate. Follow these steps:

1. **Create a Slack App** at https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - Name: "Mom Bot" (or any name)
   - Choose your workspace

2. **Enable Socket Mode**
   - Go to Settings → Socket Mode
   - Toggle "Enable Socket Mode"
   - Generate an **App-Level Token**:
     - Token Name: "mom-socket"
     - Scope: `connections:write`
     - Save the token (starts with `xapp-`)
     - This is your `MOM_SLACK_APP_TOKEN`

3. **Configure Bot Token Scopes**
   - Go to OAuth & Permissions
   - Under "Bot Token Scopes", add:
     - `app_mentions:read`
     - `channels:history`
     - `channels:read`
     - `chat:write`
     - `files:read`
     - `files:write`
     - `groups:history`
     - `groups:read`
     - `im:history`
     - `im:read`
     - `im:write`
     - `users:read`

4. **Subscribe to Bot Events**
   - Go to Event Subscriptions
   - Enable Events
   - Subscribe to bot events:
     - `app_mention`
     - `message.channels`
     - `message.groups`
     - `message.im`

5. **Enable Direct Messages**
   - Go to App Home
   - Under "Show Tabs", enable "Messages Tab"
   - Check "Allow users to send Slash commands and messages from the messages tab"

6. **Install to Workspace**
   - Go to OAuth & Permissions
   - Click "Install to Workspace"
   - Authorize the app
   - Copy the **Bot User OAuth Token** (starts with `xoxb-`)
   - This is your `MOM_SLACK_BOT_TOKEN`

7. **Add Mom to Channels**
   - In Slack, go to any channel where you want mom
   - Type `/invite @Mom Bot` (or whatever you named it)

## Quick Start

### Option 1: Using the Setup Script (Recommended)

```bash
# 1. Set Slack credentials
export MOM_SLACK_APP_TOKEN="xapp-1-..."  # From step 2 above
export MOM_SLACK_BOT_TOKEN="xoxb-..."   # From step 6 above

# 2. Run mom with Azure OpenAI
./run-mom-with-azure.sh
```

### Option 2: Manual Run

```bash
# Set Azure OpenAI configuration
export AZURE_OPENAI_BASE_URL="https://datacopilothub8882317788.cognitiveservices.azure.com/openai"
export AZURE_OPENAI_API_VERSION="2025-03-01-preview"
export AZURE_OPENAI_DEPLOYMENT_NAME_MAP="gpt-5.2=gpt-5.2-chat"

# Set Slack credentials
export MOM_SLACK_APP_TOKEN="xapp-1-..."
export MOM_SLACK_BOT_TOKEN="xoxb-..."

# Run mom
cd packages/mom
node dist/main.js ../mom-workspace
```

## Testing Mom

Once running, test mom in Slack:

1. **In a channel**:
   ```
   @Mom Bot what is 2+2?
   ```

2. **In DM**:
   ```
   Hello! Can you help me with a coding task?
   ```

3. **File operations**:
   ```
   @Mom Bot create a file called test.txt with the content "Hello World"
   ```

4. **Bash commands**:
   ```
   @Mom Bot run: ls -la
   ```

## How It Works with Azure OpenAI

Mom will automatically use Azure OpenAI as the default model because:

1. **Managed Identity is prioritized** in the model resolver
2. **No API key required** - uses Azure AD authentication
3. **Automatic in production** - uses ManagedIdentityCredential when deployed to Azure
4. **Local development** - uses AzureCliCredential (requires `az login`)

## Features

- **Self-Managing**: Mom installs her own tools (npm, git, jq, etc.)
- **Persistent Memory**: All conversation history stored in workspace
- **Thread-Based Details**: Clean main messages, verbose details in threads
- **Custom Skills**: Mom can create workflow-specific CLI tools
- **Secure**: Run in Docker sandbox for isolation

## Workspace Structure

```
mom-workspace/
├── sessions/          # Conversation history
├── skills/            # Custom CLI tools mom creates
├── .credentials/      # Managed credentials
└── files/             # Any files mom creates
```

## Troubleshooting

### "Error: Slack credentials not set"
- Make sure both `MOM_SLACK_APP_TOKEN` and `MOM_SLACK_BOT_TOKEN` are set
- Check that tokens start with `xapp-` and `xoxb-` respectively

### "Error: Azure CLI not authenticated"
- Run `az login` to authenticate with Azure
- Required for managed identity in local development

### "Mom doesn't respond in Slack"
- Check that mom is added to the channel (`/invite @Mom Bot`)
- Verify the bot has correct permissions (see setup step 3)
- Check the terminal output for errors

### "404 Resource not found" from Azure OpenAI
- The Responses API endpoint may not be deployed on this resource
- This is a deployment configuration issue, not authentication
- Managed identity authentication is working if you see "Using AzureCliCredential"

## Production Deployment

For production deployment to Azure (App Service, Container Apps, VM):

1. **Assign Managed Identity** to the Azure resource
2. **Grant RBAC permissions** to the managed identity:
   ```bash
   az role assignment create \
     --role "Cognitive Services User" \
     --assignee <managed-identity-client-id> \
     --scope /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.CognitiveServices/accounts/<account-name>
   ```
3. **Set environment variables**:
   ```bash
   MOM_SLACK_APP_TOKEN=xapp-...
   MOM_SLACK_BOT_TOKEN=xoxb-...
   AZURE_OPENAI_BASE_URL=https://...
   AZURE_OPENAI_API_VERSION=2025-03-01-preview
   ```
4. **Deploy and run** - managed identity will work automatically!

## Resources

- [Mom Documentation](packages/mom/README.md)
- [Slack Bot Setup Guide](packages/mom/docs/slack-bot-minimal-guide.md)
- [Sandbox Guide](packages/mom/docs/sandbox.md)
- [Azure Managed Identity Docs](https://learn.microsoft.com/azure/active-directory/managed-identities-azure-resources/)
