# Azure OpenAI with pi TUI - Setup Guide

## Overview

The `pi` CLI (coding agent TUI) is now configured to use Azure OpenAI with **managed identity authentication**. No API keys required!

## ✅ Verification Complete

**Test Result**: Successfully connected to Azure OpenAI
- ✅ Azure CLI authenticated
- ✅ AzureCliCredential working
- ✅ Connected to gpt-5.2-chat deployment
- ✅ Received response from Azure OpenAI

## Configuration

### Azure OpenAI Settings

- **Endpoint**: `https://datacopilothub8882317788.cognitiveservices.azure.com`
- **Deployment**: `gpt-5.2-chat`
- **API Version**: `2025-03-01-preview`
- **Authentication**: Azure Managed Identity
  - Local dev: `AzureCliCredential` (requires `az login`)
  - Production: `ManagedIdentityCredential` (automatic)

## Usage

### Quick Test (Non-Interactive)

```bash
./test-pi-azure.sh
```

### Interactive TUI Mode

```bash
./run-pi-tui-azure.sh
```

### Manual Usage

```bash
# Set environment variables
export AZURE_OPENAI_BASE_URL="https://datacopilothub8882317788.cognitiveservices.azure.com/openai"
export AZURE_OPENAI_API_VERSION="2025-03-01-preview"
export AZURE_OPENAI_DEPLOYMENT_NAME_MAP="gpt-5.2=gpt-5.2-chat"

# Run pi CLI
node packages/coding-agent/dist/cli.js \
  --provider azure-openai-responses \
  --model gpt-5.2 \
  "Your message here"
```

## TUI Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Send message |
| `Ctrl+P` | Cycle through models |
| `Ctrl+L` | Toggle thinking level |
| `Ctrl+C` | Exit/Abort |
| `Ctrl+R` | Resume previous session |

## Slash Commands

- `/help` - Show all commands
- `/models` - List available models
- `/provider <name>` - Switch provider
- `/model <id>` - Switch model
- `/thinking <level>` - Set thinking level
- `/session` - Session management
- `/tools` - Enable/disable tools

## Security

### Benefits of Managed Identity

1. **No API Keys**: Eliminates API key management
2. **Azure RBAC**: Uses Role-Based Access Control
3. **Audit Trail**: All access logged
4. **Auto Rotation**: Tokens refresh automatically
5. **Least Privilege**: Granular permissions

## Troubleshooting

### Error: "Azure CLI not authenticated"
```bash
az login
```

### Check your Azure account
```bash
az account show
```

## Related Documentation

- [Providers Guide](packages/coding-agent/docs/providers.md)
- [Azure Setup](packages/ai/AZURE_MANAGED_IDENTITY_SUMMARY.md)
