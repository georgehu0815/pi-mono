# Tools for React Web UI

This directory contains agent tools for the React-based web UI.

## Available Tools

### JavaScript REPL (`javascript-repl.ts`)

Executes JavaScript code in a browser environment.

**Features:**
- Execute JavaScript code (ES2023+)
- Access to Web APIs (fetch, localStorage, etc.)
- Console output capture (console.log, console.warn, console.error)
- Return value display
- Async/await support

**Usage:**
The tool is automatically registered when the agent is created. Users can ask the AI to run JavaScript code, and the agent will use this tool to execute it.

**Example prompts:**
- "Calculate the sum of [1, 2, 3, 4, 5]"
- "Fetch data from https://api.example.com"
- "Generate a random UUID"

**Limitations:**
- This is a simplified version compared to the full web-ui implementation
- No sandboxing in this basic version (code runs in the browser context)
- No access to artifacts or attachments
- For advanced features like sandboxed execution with runtime providers, see the web-ui package implementation

## Future Tools

Additional tools can be added to this directory:

### Planned Tools
- **Artifacts Tool**: Create and manage HTML/SVG/Markdown artifacts
- **Extract Document Tool**: Extract text from PDFs, DOCX, XLSX files
- **File Download Tool**: Download files from URLs

### Adding New Tools

To add a new tool:

1. Create a new `.ts` file in this directory
2. Implement the `AgentTool` interface from `@mariozechner/pi-agent-core`
3. Export a factory function (e.g., `createMyTool()`)
4. Import and add to the agent's tools array in `App.tsx`

**Example:**

```typescript
import type { AgentTool } from "@mariozechner/pi-agent-core";
import { Type } from "@sinclair/typebox";

const myToolSchema = Type.Object({
  input: Type.String({ description: "Input parameter" }),
});

export function createMyTool(): AgentTool<typeof myToolSchema, MyToolResult> {
  return {
    label: "My Tool",
    name: "my_tool",
    description: "Description of what the tool does",
    parameters: myToolSchema,
    execute: async (_toolCallId, args, signal) => {
      // Tool implementation
      return {
        content: [{ type: "text", text: "Result" }],
        details: {},
      };
    },
  };
}
```

Then in `App.tsx`:

```typescript
import { createMyTool } from './tools/my-tool';

// In the createAgent call:
const myTool = createMyTool();
createAgent({
  initialState: {
    // ... other config
    tools: [javascriptRepl, myTool],
  },
});
```

## Architecture Notes

### Tool Execution Flow

1. User sends a message
2. Agent analyzes the request and determines if a tool is needed
3. Agent calls the tool's `execute()` function with parameters
4. Tool performs the action and returns results
5. Results are displayed in the chat

### Tool Results

Tools return results in this format:

```typescript
{
  content: [{ type: "text", text: "Result text" }],
  details: { /* optional additional data */ }
}
```

### Error Handling

Tools should throw errors when execution fails:

```typescript
throw new Error("Descriptive error message");
```

The agent will handle the error and display it to the user.

## References

- **Full Implementation**: See `/packages/web-ui/src/tools/` for the complete Lit-based implementation with sandboxing, runtime providers, and custom renderers
- **Agent Core**: See `@mariozechner/pi-agent-core` for the `AgentTool` interface definition
- **TypeBox**: See `@sinclair/typebox` for schema definition
