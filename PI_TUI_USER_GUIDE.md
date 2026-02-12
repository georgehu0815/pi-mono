# Pi TUI CLI - User Guide

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage Modes](#usage-modes)
- [Command-Line Options](#command-line-options)
- [Interactive Mode](#interactive-mode)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Slash Commands](#slash-commands)
- [Tools](#tools)
- [Sessions](#sessions)
- [Azure OpenAI Setup](#azure-openai-setup)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Overview

**Pi** is a coding agent CLI with a full-featured terminal user interface (TUI). It provides:

- 💬 **Interactive chat** with AI models
- 🛠️ **Tool execution** (read, bash, edit, write, grep, find, ls)
- 📝 **Session management** with auto-save and resume
- 🎨 **Syntax highlighting** and markdown rendering
- ⌨️ **Vim-style keybindings** and shortcuts
- 🔄 **Model switching** on the fly
- 🧠 **Thinking levels** for reasoning models
- 🔌 **Extensions** and custom providers

## Quick Start

### Run with Azure OpenAI (Recommended)

```bash
# 1. Authenticate with Azure CLI
az login

# 2. Run the pre-configured script
./run-pi-tui-azure.sh
```

### Run with Default Provider

```bash
# Build the project (first time only)
cd packages/coding-agent
npm run build

# Run pi CLI
node dist/cli.js
```

### Test Connection

```bash
# Quick test (non-interactive)
./test-pi-azure.sh
```

## Installation

### Prerequisites

- **Node.js**: >= 20.0.0
- **Azure CLI**: For managed identity authentication (optional)

### Build from Source

```bash
# 1. Install dependencies
npm install

# 2. Build all packages
npm run build

# 3. The CLI is located at:
#    packages/coding-agent/dist/cli.js
```

### Global Installation (Optional)

```bash
# Link pi command globally
cd packages/coding-agent
npm link

# Now you can use:
pi
```

## Configuration

### Environment Variables

#### Azure OpenAI (Managed Identity)

```bash
export AZURE_OPENAI_BASE_URL="https://your-resource.cognitiveservices.azure.com/openai"
export AZURE_OPENAI_API_VERSION="2025-03-01-preview"
export AZURE_OPENAI_DEPLOYMENT_NAME_MAP="gpt-5.2=gpt-5.2-chat"
```

#### API Key Providers

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
export GEMINI_API_KEY="..."
```

### Auth File

Store credentials in `~/.pi/agent/auth.json`:

```json
{
  "anthropic": { "type": "api_key", "key": "sk-ant-..." },
  "openai": { "type": "api_key", "key": "sk-..." },
  "azure-openai-responses": { "type": "api_key", "key": "..." }
}
```

### Configuration Directory

Pi stores configuration and sessions in:
- **Config**: `~/.pi/agent/`
- **Sessions**: `~/.pi/agent/sessions/` (or custom via `--session-dir`)

## Usage Modes

### Interactive Mode (TUI)

Full terminal interface with chat, tools, and session management.

```bash
node packages/coding-agent/dist/cli.js
```

### Print Mode (Non-Interactive)

Process a single prompt and exit.

```bash
node packages/coding-agent/dist/cli.js --print "Your question here"
```

### JSON Mode

Output structured JSON (for scripting).

```bash
node packages/coding-agent/dist/cli.js --mode json "Your question"
```

### RPC Mode

JSON-RPC protocol for integration.

```bash
node packages/coding-agent/dist/cli.js --mode rpc
```

## Command-Line Options

### Provider and Model

```bash
--provider <name>              Provider name (azure-openai-responses, anthropic, openai, etc.)
--model <id>                   Model ID (gpt-5.2, claude-sonnet-4.5, etc.)
--api-key <key>                API key (overrides env vars)
--models <patterns>            Comma-separated model patterns for Ctrl+P cycling
```

### System Prompt

```bash
--system-prompt <text>         Custom system prompt
--append-system-prompt <text>  Append to default system prompt
```

### Session Management

```bash
--continue, -c                 Continue previous session
--resume, -r                   Select a session to resume
--session <path>               Use specific session file
--session-dir <dir>            Directory for session storage
--no-session                   Don't save session (ephemeral)
```

### Tools

```bash
--tools <list>                 Comma-separated tools to enable
                               Available: read, bash, edit, write, grep, find, ls
--no-tools                     Disable all tools
```

### Thinking

```bash
--thinking <level>             Set thinking level: off, minimal, low, medium, high, xhigh
```

### Extensions

```bash
--extension, -e <path>         Load extension file (can be repeated)
--no-extensions, -ne           Disable extension discovery
--skill <path>                 Load skill file/directory (can be repeated)
--no-skills, -ns               Disable skills discovery
```

### Output Mode

```bash
--mode <mode>                  Output mode: text (default), json, rpc
--print, -p                    Non-interactive mode
```

## Interactive Mode

### Chat Interface

```
┌─────────────────────────────────────────────────────┐
│ Pi - AI Coding Assistant                            │
│ Model: gpt-5.2 | Provider: azure-openai-responses  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ User: How do I read a file in TypeScript?         │
│                                                     │
│ Assistant: You can read a file in TypeScript...   │
│                                                     │
│ 🔧 Tool: read file.txt                            │
│ Result: [file contents]                           │
│                                                     │
├─────────────────────────────────────────────────────┤
│ > Your message here_                               │
└─────────────────────────────────────────────────────┘
```

### Message Input

- **Multi-line input**: Type your message across multiple lines
- **Send**: Press `Enter` to send
- **New line**: Press `Shift+Enter` to add a line break
- **Cancel**: Press `Ctrl+C` to cancel input

### Streaming Responses

- Messages stream in real-time as the model generates them
- Tool calls are displayed with a 🔧 icon
- Thinking content (reasoning) is shown in collapsible sections

## Keyboard Shortcuts

### Essential Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Send message |
| `Shift+Enter` | New line in message |
| `Ctrl+C` | Cancel/Abort current operation |
| `Ctrl+D` | Exit pi |

### Model and Settings

| Key | Action |
|-----|--------|
| `Ctrl+P` | Cycle through models |
| `Ctrl+L` | Toggle thinking level |
| `Ctrl+T` | Toggle tools on/off |

### Session Management

| Key | Action |
|-----|--------|
| `Ctrl+R` | Resume a previous session |
| `Ctrl+S` | Save current session |
| `Ctrl+N` | Start new session |

### Navigation

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate message history |
| `PgUp` / `PgDn` | Scroll chat history |
| `Home` | Jump to beginning of input |
| `End` | Jump to end of input |

### Editing

| Key | Action |
|-----|--------|
| `Ctrl+A` | Select all |
| `Ctrl+K` | Delete to end of line |
| `Ctrl+U` | Delete to start of line |
| `Ctrl+W` | Delete previous word |

## Slash Commands

Slash commands start with `/` and provide quick access to features.

### Provider and Model

```
/provider <name>         Switch provider (e.g., /provider anthropic)
/model <id>              Switch model (e.g., /model claude-sonnet-4.5)
/models                  List available models
```

### Authentication

```
/login                   Login to provider (OAuth)
/logout                  Clear credentials
```

### Settings

```
/thinking <level>        Set thinking level (off, minimal, low, medium, high, xhigh)
/tools [enable|disable]  Enable or disable tools
/system <prompt>         Update system prompt
```

### Session Management

```
/session                 Session management menu
/save [name]             Save current session
/load [name]             Load a session
/new                     Start new session
/list                    List all sessions
/delete [name]           Delete a session
```

### Help and Info

```
/help                    Show help and commands
/status                  Show current configuration
/version                 Show pi version
```

### Utility

```
/clear                   Clear chat history (not saved)
/export [file]           Export session to file
/reset                   Reset to default settings
```

## Tools

Pi has built-in tools that the AI can use to interact with your system.

### Available Tools

#### Read Tool

Read file contents.

```
User: Read the package.json file
Assistant: [uses read tool]
🔧 Tool: read package.json
Result: { "name": "pi-coding-agent", ... }
```

#### Bash Tool

Execute bash commands.

```
User: What files are in the current directory?
Assistant: [uses bash tool]
🔧 Tool: bash "ls -la"
Result: [directory listing]
```

#### Edit Tool

Edit file contents (find and replace).

```
User: Change the version to 1.0.0 in package.json
Assistant: [uses edit tool]
🔧 Tool: edit package.json
Old: "version": "0.1.0"
New: "version": "1.0.0"
```

#### Write Tool

Create or overwrite files.

```
User: Create a README.md file
Assistant: [uses write tool]
🔧 Tool: write README.md
Content: [file contents]
```

#### Grep Tool

Search file contents.

```
User: Find all TODO comments in src/
Assistant: [uses grep tool]
🔧 Tool: grep "TODO" src/
Results: [matching lines]
```

#### Find Tool

Find files by name pattern.

```
User: Find all TypeScript files
Assistant: [uses find tool]
🔧 Tool: find "**/*.ts"
Results: [file paths]
```

#### Ls Tool

List directory contents.

```
User: What's in the src/ directory?
Assistant: [uses ls tool]
🔧 Tool: ls src/
Results: [files and directories]
```

### Tool Safety

- **Confirmation**: Potentially destructive operations may require confirmation
- **Sandboxing**: Tools run with current user permissions
- **Dry-run**: Use `--no-tools` to disable all tools

### Custom Tools

You can add custom tools via extensions:

```typescript
// my-extension.ts
import { defineTool } from '@mariozechner/pi-coding-agent/hooks';

export default defineTool({
  name: 'myTool',
  description: 'Custom tool description',
  parameters: { /* schema */ },
  execute: async (params) => {
    // Tool implementation
    return { content: [{ type: 'text', text: 'Result' }] };
  }
});
```

## Sessions

Sessions automatically save your conversation history and resume where you left off.

### Auto-Save

Sessions are automatically saved:
- After each message exchange
- When you exit pi
- Every 30 seconds (if modified)

### Session Files

Sessions are stored in: `~/.pi/agent/sessions/`

Each session includes:
- Message history
- Model and provider settings
- Tool usage history
- Thinking level
- Timestamps

### Resume Last Session

```bash
# Continue previous session
pi --continue

# Or use shorthand
pi -c
```

### Resume Specific Session

```bash
# Select from list
pi --resume

# Or use shorthand
pi -r
```

### Session Management

```bash
# List all sessions
pi --session-dir ~/.pi/agent/sessions

# Use custom session file
pi --session /path/to/session.json

# Ephemeral mode (don't save)
pi --no-session
```

## Azure OpenAI Setup

### Prerequisites

1. **Azure OpenAI Resource** deployed in Azure
2. **Azure CLI** installed and authenticated
3. **Managed Identity** configured (production) OR **Azure CLI login** (development)

### Development Setup

```bash
# 1. Login to Azure CLI
az login

# 2. Verify authentication
az account show

# 3. Set environment variables
export AZURE_OPENAI_BASE_URL="https://your-resource.cognitiveservices.azure.com/openai"
export AZURE_OPENAI_API_VERSION="2025-03-01-preview"
export AZURE_OPENAI_DEPLOYMENT_NAME_MAP="gpt-5.2=gpt-5.2-chat"

# 4. Run pi
node packages/coding-agent/dist/cli.js \
  --provider azure-openai-responses \
  --model gpt-5.2
```

### Using the Pre-configured Script

```bash
# Quick start with Azure OpenAI
./run-pi-tui-azure.sh
```

### Production Setup

In Azure (VM, App Service, Container):

1. Enable **System Assigned Managed Identity**
2. Grant **Cognitive Services User** role to the identity
3. Set environment variables:
   ```bash
   export AZURE_OPENAI_BASE_URL="..."
   export AZURE_OPENAI_API_VERSION="..."
   export AZURE_OPENAI_DEPLOYMENT_NAME_MAP="..."
   export NODE_ENV="production"
   ```
4. Run pi - it will automatically use `ManagedIdentityCredential`

### Authentication Flow

```
Development (NODE_ENV != production):
  └─> AzureCliCredential (uses `az login`)

Production (NODE_ENV == production):
  └─> ManagedIdentityCredential (automatic)
```

## Examples

### Basic Chat

```bash
# Simple question
pi --print "What is TypeScript?"
```

### Code Generation

```bash
# Generate code with tools
pi "Create a React component called Button"
```

### File Operations

```bash
# Read and analyze files
pi "Read src/App.tsx and suggest improvements"
```

### Debugging

```bash
# Analyze errors with bash tool
pi "Run npm test and help me fix failing tests"
```

### Refactoring

```bash
# Multi-file refactoring
pi "Rename all instances of 'user' to 'account' in src/"
```

### High Thinking

```bash
# Complex reasoning
pi --thinking high "Design a database schema for a social network"
```

### Model Cycling

```bash
# Switch between models easily
pi --models "azure-openai-responses/gpt-5.2,anthropic/claude-sonnet-4.5"
# Then use Ctrl+P to cycle
```

### Custom Session Directory

```bash
# Organize sessions by project
pi --session-dir ./my-project/.pi-sessions
```

### JSON Output (Scripting)

```bash
# Get structured output
pi --mode json --print "List 3 prime numbers" | jq '.content[0].text'
```

### With Extensions

```bash
# Load custom extension
pi --extension ./my-tool.ts "Use my custom tool"
```

## Troubleshooting

### Common Issues

#### "Azure CLI not authenticated"

```bash
# Solution
az login
```

#### "Model not found"

```bash
# List available models
pi --provider azure-openai-responses
# Use /models in interactive mode

# Check deployment name mapping
echo $AZURE_OPENAI_DEPLOYMENT_NAME_MAP
```

#### "Permission denied" (Tools)

```bash
# Check file permissions
ls -la

# Run with elevated permissions (if needed)
sudo pi "Read /etc/hosts"
```

#### "Session not saving"

```bash
# Check session directory exists and is writable
ls -la ~/.pi/agent/sessions/

# Create if missing
mkdir -p ~/.pi/agent/sessions
chmod 700 ~/.pi/agent/sessions
```

#### "Tool execution failed"

```bash
# Disable tools to bypass
pi --no-tools "Your question"

# Or enable specific tools only
pi --tools read,bash "Your question"
```

### Debug Mode

Enable verbose logging:

```bash
# Azure authentication debug
export DEBUG=azure*
pi

# General debug
export DEBUG=*
pi
```

### Clear Cache

```bash
# Remove cached credentials
rm ~/.pi/agent/auth.json

# Remove all sessions
rm -rf ~/.pi/agent/sessions/*

# Full reset
rm -rf ~/.pi/agent/
```

### Performance Issues

```bash
# Reduce thinking level
pi --thinking minimal

# Disable tools
pi --no-tools

# Use faster model
pi --model gemini-2.5-flash
```

## Advanced Usage

### Custom System Prompt

```bash
pi --system-prompt "You are a Python expert. Only write Python code."
```

### Append to System Prompt

```bash
# From text
pi --append-system-prompt "Always use TypeScript strict mode"

# From file
pi --append-system-prompt @custom-prompt.txt
```

### Multiple Extensions

```bash
pi -e ./tool1.ts -e ./tool2.ts -e ./skill.ts
```

### Prompt Templates

```bash
# Load prompt template
pi --prompt-template ./templates/code-review.md

# Disable template discovery
pi --no-prompt-templates
```

### Custom Theme

```bash
# Load custom theme
pi --theme ./my-theme.json

# Disable themes
pi --no-themes
```

## Tips and Best Practices

### 1. Use Sessions

Always save important conversations:
```bash
/save important-discussion
```

### 2. Model Cycling

Set up common models for quick switching:
```bash
pi --models "azure/gpt-5.2,anthropic/claude-sonnet-4.5,google/gemini-2.5-pro"
```

### 3. Tool Usage

Be specific about what you want:
```bash
Good: "Read package.json and show me the dependencies"
Bad: "What's in package.json?"
```

### 4. Thinking Levels

- **off/minimal**: Fast responses, simple tasks
- **low/medium**: Balanced reasoning
- **high/xhigh**: Complex problems, detailed analysis

### 5. Session Organization

Organize by project:
```bash
mkdir -p ~/.pi-sessions/project-name
pi --session-dir ~/.pi-sessions/project-name
```

### 6. Keyboard Shortcuts

Learn the essential shortcuts:
- `Ctrl+P`: Quick model switch
- `Ctrl+R`: Resume session
- `Ctrl+C`: Abort operation

### 7. Batch Operations

Use print mode for automation:
```bash
for file in *.ts; do
  pi --print "Analyze $file for bugs" >> analysis.txt
done
```

## Support and Resources

### Documentation

- [Providers Guide](packages/coding-agent/docs/providers.md)
- [Custom Providers](packages/coding-agent/docs/custom-provider.md)
- [Azure Setup](AZURE_TUI_SETUP.md)
- [Extensions](packages/coding-agent/docs/extensions.md)

### Community

- GitHub: https://github.com/badlogic/pi-mono
- Issues: https://github.com/badlogic/pi-mono/issues

### Configuration Reference

- Config directory: `~/.pi/agent/`
- Auth file: `~/.pi/agent/auth.json`
- Sessions: `~/.pi/agent/sessions/`
- Extensions: `~/.pi/agent/extensions/`

---

**Version**: 0.52.9
**Last Updated**: 2026-02-11
