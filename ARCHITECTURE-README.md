# Architecture Documentation - README

## 📊 Generated Documentation

This directory contains comprehensive architecture documentation for the Pi Monorepo.

### Files Generated

#### 1. ARCHITECTURE.md (14 KB)
**Markdown source with 6 Mermaid diagrams**

High-resolution diagrams covering:
- 🏗️ **System Architecture** - Complete 7-package ecosystem overview
- 🔐 **Azure OpenAI Managed Identity** - Secure authentication flow
- 🔄 **Data Flow** - Request/response sequence diagram
- 📦 **Package Dependencies** - Layered architecture graph
- 🔌 **Provider Architecture** - AI provider implementation details
- 📁 **File System** - Coding agent storage structure

#### 2. ARCHITECTURE.pdf (271 KB) ⭐
**High-resolution PDF with rendered diagrams**

Features:
- ✅ All 6 Mermaid diagrams rendered as high-quality PNG images
- ✅ Table of contents with numbered sections
- ✅ Syntax-highlighted code blocks
- ✅ Professional formatting (0.75" margins, 10pt font)
- ✅ Generated with XeLaTeX for Unicode support
- 📄 16 pages of comprehensive documentation

### Diagram Quality Details

**Resolution:** Standard web resolution (optimized for screen and print)
- Mermaid diagrams: Rendered with default settings (~800-1200px width)
- Image format: PNG with transparency
- PDF Quality: Embedded images, vector text

**Rendering Engine:** mermaid-cli v11.4.1
- Automatic layout optimization
- Professional color scheme
- Clear typography
- Proper spacing and alignment

### Usage

#### View the Documentation

```bash
# Open markdown in editor
open ARCHITECTURE.md

# Open PDF
open ARCHITECTURE.pdf
```

#### Re-generate PDF

If you modify ARCHITECTURE.md, regenerate the PDF:

```bash
~/.claude/skills/markdown-to-pdf/scripts/convert.sh \
  ARCHITECTURE.md \
  ARCHITECTURE.pdf \
  --render-mermaid \
  --engine=xelatex \
  --toc \
  --number-sections \
  --variable=geometry:margin=0.75in \
  --variable=fontsize=10pt \
  --variable=documentclass=article
```

#### Edit Diagrams

To modify diagrams:
1. Edit the ```mermaid blocks in ARCHITECTURE.md
2. Test in [Mermaid Live Editor](https://mermaid.live)
3. Re-generate PDF using command above

### Diagram Overview

#### 1. System Architecture
Shows the complete monorepo structure with all 7 packages and their connections to external services:
- Core Libraries: TUI, AI, Agent Core
- Applications: Coding Agent, Mom, Web UI, Pods
- External Services: OpenAI, Anthropic, Google, Azure, Bedrock, Slack, GPU Pods
- **Highlight:** Azure OpenAI with Managed Identity (newly implemented)

#### 2. Azure OpenAI Managed Identity Architecture
Details the authentication flow for Azure OpenAI:
- Development: AzureCliCredential (local `az login`)
- Production: ManagedIdentityCredential (no keys needed)
- Shows token flow through Azure AD to Cognitive Services

#### 3. Data Flow Architecture
Sequence diagram showing:
- User interaction through Coding Agent
- Request flow through Agent Core and pi-ai
- Azure provider authentication
- Streaming response handling
- Real-time TUI updates

#### 4. Package Dependency Graph
Three-layer architecture:
- Layer 1: Foundational (TUI, AI)
- Layer 2: Core Services (Agent Core)
- Layer 3: Applications (all end-user packages)

#### 5. Provider Architecture
Deep dive into pi-ai package:
- Core API (stream/complete)
- Provider registry system
- 6 provider implementations
- Shared utilities
- Model discovery (700+ models)
- **Highlight:** Azure provider with managed identity

#### 6. File System Architecture
Coding Agent file organization:
- User home directory (~/.pi/)
- Project-specific configuration (.pi/)
- Session management
- Cache and hooks
- Git integration

### Color Coding

Diagrams use consistent color scheme:
- 🔵 **Blue (#2196F3)** - Agent Core
- 🟢 **Green (#4CAF50)** - AI/Core Libraries
- 🟠 **Orange (#FF9800)** - TUI/Interface
- 🟣 **Purple (#9C27B0)** - Coding Agent
- 🔴 **Pink (#E91E63)** - Mom/Slack
- 🔵 **Cyan (#00BCD4)** - Web UI
- 🟤 **Brown (#795548)** - Pods/Infrastructure
- 🔷 **Azure Blue (#0078d4)** - Azure Services

### Key Architecture Highlights

#### Security Features
- ✅ Azure Managed Identity (no API keys)
- ✅ Environment-based credential selection
- ✅ Automatic token refresh
- ✅ Audit trail through Azure AD

#### Performance Features
- ⚡ Streaming-first design
- ⚡ Differential rendering in TUI
- ⚡ Prompt caching support
- ⚡ Connection pooling

#### Scalability Features
- 📈 700+ models across 17 providers
- 📈 Pluggable provider architecture
- 📈 Transport abstraction layer
- 📈 Session state management

### Technology Stack

**Languages & Runtimes**
- TypeScript 5.7+
- Node.js 20+

**Build & Tools**
- Custom tsgo compiler
- Vitest (testing)
- Biome (linting)

**AI SDKs**
- Official provider SDKs (OpenAI, Anthropic, Google, AWS)
- Azure Identity SDK (managed identity)

**UI Frameworks**
- Terminal: Custom TUI library
- Web: Lit (web components)

### Version Information

- **Documentation Version:** 1.0
- **Package Version:** 0.52.9
- **Last Updated:** February 11, 2026
- **Generated By:** Claude Code (Sonnet 4.5)

### Notes

1. **Unicode Characters:** Some checkmark symbols (✓) may not display in PDF due to font limitations. This is cosmetic only and doesn't affect readability.

2. **Diagram Rendering:** All diagrams are pre-rendered to PNG before PDF conversion, ensuring consistent appearance across all viewers.

3. **Print Quality:** The PDF is optimized for both screen viewing and printing at standard resolutions.

4. **Future Updates:** To update this documentation:
   - Edit ARCHITECTURE.md
   - Test diagrams at mermaid.live
   - Regenerate PDF
   - Update this README if structure changes

### Support

For questions about the architecture:
- See [README.md](README.md) for package overview
- See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- Join [Discord](https://discord.com/invite/3cU7Bz4UPx) for community support

---

**Generated with:** Claude Code + Mermaid.js + Pandoc + XeLaTeX
