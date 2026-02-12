# Pi Monorepo Architecture

## Overview
Pi is a monorepo containing 7 interconnected packages for building AI agents and managing LLM deployments. The architecture follows a layered approach with clear separation of concerns.

## System Architecture

```mermaid
graph TB
    subgraph "External Services"
        OpenAI[OpenAI API]
        Anthropic[Anthropic API]
        Google[Google Gemini API]
        Bedrock[AWS Bedrock]
        AzureOAI[Azure OpenAI<br/>with Managed Identity]
        Mistral[Mistral AI]
        Slack[Slack API]
        GPU[GPU Pods / vLLM]
    end

    subgraph "Pi Monorepo"
        subgraph "Core Libraries"
            TUI["@mariozechner/pi-tui<br/>━━━━━━━━━━━━━━━<br/>Terminal UI Library<br/>• Differential Rendering<br/>• Text Editors<br/>• Layout System"]

            AI["@mariozechner/pi-ai<br/>━━━━━━━━━━━━━━━<br/>Unified LLM API<br/>• 700+ Models<br/>• Auto Discovery<br/>• Streaming Support<br/>• Tool Calling"]

            Agent["@mariozechner/pi-agent-core<br/>━━━━━━━━━━━━━━━<br/>Agent Runtime<br/>• Transport Abstraction<br/>• State Management<br/>• Tool Execution<br/>• Attachment Support"]
        end

        subgraph "Applications"
            CodingAgent["@mariozechner/pi-coding-agent<br/>━━━━━━━━━━━━━━━<br/>Coding Agent CLI<br/>• Interactive TUI<br/>• Session Management<br/>• File Operations<br/>• Bash Execution<br/>• Git Integration"]

            Mom["@mariozechner/pi-mom<br/>━━━━━━━━━━━━━━━<br/>Slack Bot<br/>• Message Delegation<br/>• Thread Management<br/>• Code Execution<br/>• Sandbox Runtime"]

            WebUI["@mariozechner/pi-web-ui<br/>━━━━━━━━━━━━━━━<br/>Web Components<br/>• Chat Interface<br/>• File Upload<br/>• Markdown Rendering<br/>• Syntax Highlighting"]

            Pods["@mariozechner/pi-pods<br/>━━━━━━━━━━━━━━━<br/>GPU Pod Manager<br/>• vLLM Deployment<br/>• Model Management<br/>• Resource Monitoring"]
        end
    end

    subgraph "AI Provider Layer"
        subgraph "Authentication"
            APIKeys[API Keys]
            ManagedIdentity["Azure Managed Identity<br/>✓ AzureCliCredential<br/>✓ ManagedIdentityCredential"]
        end

        subgraph "Providers"
            ProviderOpenAI[OpenAI Provider<br/>• Completions<br/>• Responses API]
            ProviderAnthropic[Anthropic Provider<br/>• Claude Models<br/>• Streaming]
            ProviderGoogle[Google Provider<br/>• Gemini<br/>• Vertex AI<br/>• CLI Integration]
            ProviderAzure["Azure OpenAI Provider<br/>━━━━━━━━━━━━━━━<br/>✓ Managed Identity Auth<br/>• Responses API<br/>• Chat Completions<br/>• Native Client"]
            ProviderBedrock[Bedrock Provider<br/>• Multi-Model<br/>• Streaming]
        end
    end

    %% Core Dependencies
    AI --> ProviderOpenAI
    AI --> ProviderAnthropic
    AI --> ProviderGoogle
    AI --> ProviderAzure
    AI --> ProviderBedrock

    Agent --> AI
    CodingAgent --> Agent
    CodingAgent --> AI
    CodingAgent --> TUI

    Mom --> Agent
    Mom --> AI
    Mom --> CodingAgent

    WebUI --> AI
    WebUI --> TUI

    Pods --> Agent

    %% External Connections
    ProviderOpenAI -.->|API Key| OpenAI
    ProviderAnthropic -.->|API Key| Anthropic
    ProviderGoogle -.->|API Key| Google
    ProviderBedrock -.->|AWS Creds| Bedrock
    ProviderAzure -.->|Managed Identity| AzureOAI

    AI -.->|Optional| Mistral

    Mom -.->|Socket Mode| Slack
    Pods -.->|SSH/API| GPU

    %% Authentication Flows
    APIKeys -.-> ProviderOpenAI
    APIKeys -.-> ProviderAnthropic
    APIKeys -.-> ProviderGoogle
    ManagedIdentity -.-> ProviderAzure

    style AzureOAI fill:#0078d4,stroke:#005a9e,color:#fff
    style ProviderAzure fill:#0078d4,stroke:#005a9e,color:#fff
    style ManagedIdentity fill:#0078d4,stroke:#005a9e,color:#fff
    style AI fill:#4CAF50,stroke:#388E3C,color:#fff
    style Agent fill:#2196F3,stroke:#1976D2,color:#fff
    style TUI fill:#FF9800,stroke:#F57C00,color:#fff
    style CodingAgent fill:#9C27B0,stroke:#7B1FA2,color:#fff
    style Mom fill:#E91E63,stroke:#C2185B,color:#fff
    style WebUI fill:#00BCD4,stroke:#0097A7,color:#fff
    style Pods fill:#795548,stroke:#5D4037,color:#fff
```

## Azure OpenAI Managed Identity Architecture

```mermaid
graph LR
    subgraph "Local Development"
        DevUser[Developer]
        AzureCLI[Azure CLI<br/>az login]
    end

    subgraph "Production Environment"
        AppService[Azure App Service<br/>or VM]
        ManagedId[Managed Identity]
    end

    subgraph "pi-ai Package"
        AzureProvider["azure-openai-responses.ts<br/>━━━━━━━━━━━━━━━<br/>getAzureCredential()"]

        subgraph "Credential Selection"
            CliCred[AzureCliCredential<br/>Development]
            ManagedCred[ManagedIdentityCredential<br/>Production]
        end

        TokenProvider[getBearerTokenProvider]
        AzureClient[AzureOpenAI Client]
    end

    subgraph "Azure Services"
        AAD[Azure Active Directory]
        CogServices[Azure OpenAI<br/>Cognitive Services]
        ResponsesAPI[Responses API<br/>Chat Completions API]
    end

    %% Development Flow
    DevUser -->|az login| AzureCLI
    AzureCLI -.->|Token| CliCred

    %% Production Flow
    AppService -->|Has| ManagedId
    ManagedId -.->|Token| ManagedCred

    %% Common Flow
    AzureProvider -->|NODE_ENV check| CliCred
    AzureProvider -->|NODE_ENV check| ManagedCred
    CliCred --> TokenProvider
    ManagedCred --> TokenProvider
    TokenProvider --> AzureClient

    %% API Calls
    AzureClient -->|Bearer Token| AAD
    AAD -->|Validate| CogServices
    CogServices --> ResponsesAPI

    style AzureProvider fill:#0078d4,stroke:#005a9e,color:#fff
    style CliCred fill:#4CAF50,stroke:#388E3C,color:#fff
    style ManagedCred fill:#FF9800,stroke:#F57C00,color:#fff
    style AAD fill:#0078d4,stroke:#005a9e,color:#fff
    style CogServices fill:#0078d4,stroke:#005a9e,color:#fff
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant CodingAgent
    participant Agent as Agent Core
    participant AI as pi-ai
    participant Provider as Azure Provider
    participant Azure as Azure OpenAI

    User->>CodingAgent: /chat command
    CodingAgent->>Agent: Initialize Session
    Agent->>AI: stream(model, context, options)

    alt Managed Identity Auth
        AI->>Provider: getAzureCredential()
        Provider->>Provider: Check NODE_ENV
        alt Production
            Provider-->>AI: ManagedIdentityCredential
        else Development
            Provider-->>AI: AzureCliCredential
        end
        Provider->>Azure: getBearerTokenProvider()
        Azure-->>Provider: Token
    end

    Provider->>Azure: responses.create(params)

    loop Streaming Response
        Azure-->>Provider: SSE Chunk
        Provider-->>AI: Transform Chunk
        AI-->>Agent: Event Stream
        Agent-->>CodingAgent: Update State
        CodingAgent-->>User: Render to TUI
    end

    Azure-->>Provider: Stream Complete
    Provider-->>AI: Done Event
    AI-->>Agent: Final Message
    Agent-->>CodingAgent: Session Update
    CodingAgent-->>User: Display Result
```

## Package Dependency Graph

```mermaid
graph TD
    subgraph "Layer 1: Foundational"
        TUI[pi-tui]
        AI[pi-ai]
    end

    subgraph "Layer 2: Core Services"
        Agent[pi-agent-core]
    end

    subgraph "Layer 3: Applications"
        CodingAgent[pi-coding-agent]
        Mom[pi-mom]
        WebUI[pi-web-ui]
        Pods[pi-pods]
    end

    AI --> Agent
    TUI --> CodingAgent
    TUI --> WebUI
    AI --> CodingAgent
    AI --> Mom
    AI --> WebUI
    Agent --> CodingAgent
    Agent --> Mom
    Agent --> Pods

    style TUI fill:#FF9800,stroke:#F57C00,color:#fff
    style AI fill:#4CAF50,stroke:#388E3C,color:#fff
    style Agent fill:#2196F3,stroke:#1976D2,color:#fff
    style CodingAgent fill:#9C27B0,stroke:#7B1FA2,color:#fff
    style Mom fill:#E91E63,stroke:#C2185B,color:#fff
    style WebUI fill:#00BCD4,stroke:#0097A7,color:#fff
    style Pods fill:#795548,stroke:#5D4037,color:#fff
```

## Provider Architecture (pi-ai)

```mermaid
graph TB
    subgraph "pi-ai Package"
        Core["Core API<br>stream/complete"]

        subgraph "Provider Registry"
            Registry["Provider Registry<br>register-builtins.ts"]
        end

        subgraph "Providers"
            OpenAI["openai-completions.ts<br>openai-responses.ts"]
            Anthropic["anthropic.ts"]
            Google["google.ts<br>google-gemini-cli.ts<br>google-vertex.ts"]
            Azure["azure-openai-responses.ts<br>Managed Identity Auth<br>azure-openai-native-client.ts"]
            Bedrock["amazon-bedrock.ts"]
            Codex["openai-codex-responses.ts"]
        end

        subgraph "Shared Utilities"
            Transform["transform-messages.ts"]
            SimpleOpts["simple-options.ts"]
            ResponsesShared["openai-responses-shared.ts"]
        end

        subgraph "Model Discovery"
            Generated["models.generated.ts<br>700+ models<br>Auto-generated"]
        end
    end

    Core --> Registry
    Registry --> OpenAI
    Registry --> Anthropic
    Registry --> Google
    Registry --> Azure
    Registry --> Bedrock
    Registry --> Codex

    OpenAI --> Transform
    Anthropic --> Transform
    Google --> Transform
    Azure --> Transform

    OpenAI --> SimpleOpts
    Azure --> SimpleOpts

    OpenAI --> ResponsesShared
    Azure --> ResponsesShared

    Core --> Generated

    style Azure fill:#0078d4,stroke:#005a9e,color:#fff
    style Generated fill:#4CAF50,stroke:#388E3C,color:#fff
```

## File System Architecture (Coding Agent)

```mermaid
graph TB
    subgraph "User Home"
        Home[~/.pi/]
        Config[config.json]
        Sessions[sessions/]
        Cache[cache/]
        Hooks[hooks/]
    end

    subgraph "Project Directory"
        ProjRoot[project-root/]
        PiDir[.pi/]
        ProjConfig[config.json]
        ProjSessions[sessions/]
        GitDir[.git/]
        IgnoreFile[.piignore]
    end

    subgraph "Coding Agent Runtime"
        ConfigMgr[Config Manager]
        SessionMgr[Session Manager]
        FileOps[File Operations<br/>Read/Write/Edit]
        BashTool[Bash Tool]
        GitOps[Git Operations]
    end

    Home --> ConfigMgr
    Config --> ConfigMgr
    ProjRoot --> ConfigMgr
    PiDir --> ConfigMgr
    ProjConfig --> ConfigMgr

    Sessions --> SessionMgr
    ProjSessions --> SessionMgr

    FileOps --> ProjRoot
    FileOps -.-> IgnoreFile
    BashTool --> ProjRoot
    GitOps --> GitDir

    Cache --> ConfigMgr
    Hooks --> ConfigMgr

    style ConfigMgr fill:#9C27B0,stroke:#7B1FA2,color:#fff
    style SessionMgr fill:#2196F3,stroke:#1976D2,color:#fff
```

## Key Features by Package

### 1. @mariozechner/pi-ai
- **Multi-Provider Support**: 700+ models across 17 providers
- **Streaming**: First-class streaming support with SSE
- **Tool Calling**: Unified tool/function calling interface
- **Model Discovery**: Auto-generated model catalog
- **Cost Tracking**: Token usage and cost estimation
- **Cache Management**: Prompt caching support
- **Azure Integration**: ✓ Managed Identity authentication (NEW)

### 2. @mariozechner/pi-agent-core
- **Transport Abstraction**: Pluggable I/O layer
- **State Management**: Conversation and tool state
- **Attachment Support**: File and image handling
- **Event System**: Typed event emission
- **Tool Execution**: Async tool call handling

### 3. @mariozechner/pi-coding-agent
- **Interactive TUI**: Full-featured terminal interface
- **Session Management**: Save/restore conversations
- **File Operations**: Read, Write, Edit with diff support
- **Bash Execution**: Safe command execution with sandboxing
- **Git Integration**: Commit creation, PR generation
- **Context Management**: Smart file inclusion
- **Extension System**: Custom tools and providers

### 4. @mariozechner/pi-mom
- **Slack Integration**: Socket mode for real-time messages
- **Thread Management**: Conversation threading
- **Sandbox Execution**: Safe code execution with E2B
- **Scheduled Tasks**: Cron-based job execution
- **Multi-Channel**: Support multiple Slack workspaces

### 5. @mariozechner/pi-tui
- **Differential Rendering**: Efficient screen updates
- **Text Editors**: Full-featured text input components
- **Layout System**: Flexbox-like terminal layouts
- **Markdown Rendering**: Terminal-based markdown display
- **Syntax Highlighting**: Code syntax coloring

### 6. @mariozechner/pi-web-ui
- **Web Components**: Lit-based reusable components
- **Chat Interface**: Full-featured chat UI
- **File Upload**: Drag-and-drop file support
- **Document Preview**: PDF, DOCX, XLSX rendering
- **Syntax Highlighting**: Code block rendering
- **Dark/Light Theme**: Theme support

### 7. @mariozechner/pi-pods
- **vLLM Deployment**: GPU pod orchestration
- **Model Management**: Download and configure models
- **Resource Monitoring**: GPU utilization tracking
- **SSH Integration**: Remote pod management

## Security Features

### Azure OpenAI Managed Identity (Implemented)
```
✓ No API keys in code
✓ Azure AD authentication
✓ Automatic token refresh
✓ Development/Production modes
✓ Least privilege access
✓ Audit trail
```

### Other Security Features
- **API Key Management**: Environment-based configuration
- **Sandboxing**: Safe code execution in Mom
- **.piignore**: Prevent sensitive file access
- **Git Safety**: No force operations without explicit consent
- **Bash Safety**: No destructive commands by default

## Performance Optimizations

1. **Streaming**: All providers support streaming responses
2. **Caching**: Prompt caching for repeated context
3. **Differential Rendering**: Only redraw changed terminal regions
4. **Lazy Loading**: Models loaded on-demand
5. **Connection Pooling**: Reuse HTTP connections
6. **Batch Operations**: Group file operations

## Development Workflow

```
npm install          # Install dependencies
npm run build        # Build all packages
npm run dev          # Watch mode for all packages
npm run check        # Lint, format, type check
npm test            # Run test suites
```

## Technology Stack

- **Language**: TypeScript 5.7+
- **Runtime**: Node.js 20+
- **Build**: Custom tsgo compiler
- **Testing**: Vitest
- **Linting**: Biome
- **UI**: Terminal (blessed-like), Web (Lit)
- **AI SDKs**: Official provider SDKs
- **Authentication**: Azure Identity SDK

## Version

Current Version: **0.52.9**

Last Updated: February 11, 2026
