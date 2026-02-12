# Pi Monorepo System Architecture

![Pi Monorepo System Architecture](diagram-1-system-architecture.png)

## Overview

This diagram shows the complete architecture of the Pi monorepo, including:

- **Core Libraries**: TUI, AI, and Agent Core packages providing fundamental functionality
- **Applications**: Coding Agent CLI, Mom Slack Bot, Web UI, and Pods Manager
- **AI Provider Layer**: Multiple LLM provider integrations with managed authentication
- **External Services**: Cloud AI services, Slack, and GPU infrastructure

### Key Features

- **Azure OpenAI with Managed Identity**: Secure, keyless authentication using Azure AD
- **700+ Models**: Auto-discovery across multiple providers
- **Unified API**: Single interface for all LLM providers
- **Tool Calling**: Built-in support for function calling and agent tools
- **Streaming**: Real-time response streaming for all providers
