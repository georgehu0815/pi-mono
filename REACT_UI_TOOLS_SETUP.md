# React UI Tools Setup - Summary

## What Was Added

JavaScript REPL tool has been successfully integrated into the React Web UI application.

### Files Created

1. **`/packages/web-ui-react/src/tools/javascript-repl.ts`** (169 lines)
   - Simplified JavaScript REPL tool implementation
   - Executes JavaScript code in browser environment
   - Captures console output (log, warn, error)
   - Displays return values
   - Supports async/await

2. **`/packages/web-ui-react/src/tools/README.md`** (Documentation)
   - Tool usage guide
   - Architecture notes
   - Instructions for adding new tools

### Files Modified

1. **`/packages/web-ui-react/src/App.tsx`**
   - Added import: `import { createJavaScriptReplTool } from './tools/javascript-repl'`
   - Updated agent initialization to include the JavaScript REPL tool
   - Enhanced system prompt to mention available tools

## Verification

### TypeScript Compilation
✅ **PASSED** - No TypeScript errors
```bash
cd /Users/ghu/aiworker/pi-mono/packages/web-ui-react
npm run check
# Result: Success (0 errors)
```

### Running Services
✅ **React Dev Server** - Running on http://localhost:5174
✅ **Azure Proxy Server** - Running on http://localhost:3001

### Tool Configuration

The agent is now initialized with:
- **Model**: Azure OpenAI gpt-5.2 (via managed identity proxy)
- **Tools**: JavaScript REPL
- **System Prompt**: Updated to inform AI about available tools

## How to Use

### Starting the Application

1. **Start Azure Proxy Server** (if not running):
   ```bash
   cd /Users/ghu/aiworker/pi-mono/packages/web-ui
   node azure-proxy-server.js
   ```

2. **Start React Dev Server** (if not running):
   ```bash
   cd /Users/ghu/aiworker/pi-mono/packages/web-ui-react
   npm run dev
   ```

3. **Open Browser**: Navigate to http://localhost:5174

### Testing the JavaScript REPL Tool

Try these prompts in the chat:

1. **Simple Calculation**:
   ```
   Calculate the sum of numbers from 1 to 100
   ```

2. **Array Operations**:
   ```
   Generate an array of 10 random numbers between 1 and 100, then sort them
   ```

3. **Async Operation**:
   ```
   Fetch data from https://jsonplaceholder.typicode.com/todos/1 and show me the result
   ```

4. **Console Output**:
   ```
   Write JavaScript code that logs "Hello, World!" to the console
   ```

The AI should automatically use the JavaScript REPL tool to execute the code and show you the results.

## Architecture

### Tool Execution Flow

```
User Message
    ↓
Agent Analysis (Azure OpenAI)
    ↓
Tool Selection (javascript_repl)
    ↓
Tool Execution (javascript-repl.ts)
    ↓
Result Display (Chat UI)
```

### Current Implementation

**Type**: Simplified JavaScript executor

**Features**:
- ✅ Execute JavaScript code (ES2023+)
- ✅ Capture console output
- ✅ Display return values
- ✅ Support async/await
- ✅ Access Web APIs (fetch, localStorage, etc.)

**Limitations**:
- ⚠️ No sandboxing (code runs in browser context)
- ⚠️ No access to artifacts
- ⚠️ No access to attachments
- ⚠️ No file download capability

### Future Enhancements

To match the full web-ui implementation, these features need to be added:

1. **Sandboxed Execution**
   - Use `SandboxedIframe` for isolated code execution
   - Prevent access to parent page context

2. **Runtime Providers**
   - `ArtifactsRuntimeProvider` - Read/write artifacts
   - `AttachmentsRuntimeProvider` - Access uploaded files
   - `ConsoleRuntimeProvider` - Enhanced console output
   - `FileDownloadRuntimeProvider` - Generate downloadable files

3. **Additional Tools**
   - `extract_document` - Extract text from PDFs, DOCX, XLSX
   - `artifacts_tool` - Create interactive HTML/SVG/Markdown artifacts

## Differences from Lit Web UI

| Feature | Lit Web UI | React Web UI |
|---------|-----------|--------------|
| JavaScript REPL | ✅ Full (with sandbox) | ⚠️ Simplified (no sandbox) |
| Runtime Providers | ✅ Artifacts, Attachments, Console, Files | ❌ Not implemented |
| Extract Document Tool | ✅ Implemented | ❌ Not implemented |
| Artifacts Tool | ✅ Implemented | ❌ Not implemented |
| Tool Result Rendering | ✅ Custom Lit renderers | ⚠️ Default text display |

## Next Steps

### Immediate
- [x] Add JavaScript REPL tool
- [x] Update system prompt
- [x] Document tool usage

### Phase 2 - Enhanced REPL
- [ ] Implement `SandboxedIframe` component for React
- [ ] Create runtime providers
- [ ] Add artifacts access
- [ ] Add attachments access
- [ ] Add file download capability

### Phase 3 - Additional Tools
- [ ] Add `extract_document` tool
- [ ] Add `artifacts_tool`
- [ ] Add custom tool result renderers

### Phase 4 - UI Enhancements
- [ ] Display tool calls in UI (like Lit version)
- [ ] Show collapsible code blocks
- [ ] Show console output with syntax highlighting
- [ ] Show file attachments from tool results

## Testing Checklist

- [x] TypeScript compilation passes
- [x] React dev server runs without errors
- [x] Azure proxy server is running
- [x] Tool is registered in agent
- [ ] Tool executes successfully (manual test needed)
- [ ] Tool results display correctly (manual test needed)
- [ ] Console output is captured (manual test needed)
- [ ] Return values display correctly (manual test needed)

## Related Documentation

- [PI_TUI_USER_GUIDE.md](PI_TUI_USER_GUIDE.md) - Pi CLI/TUI usage guide
- [AZURE_TUI_SETUP.md](AZURE_TUI_SETUP.md) - Azure OpenAI setup
- [packages/web-ui-react/src/tools/README.md](packages/web-ui-react/src/tools/README.md) - Tools documentation
- [packages/web-ui/src/tools/](packages/web-ui/src/tools/) - Full Lit implementation reference

## Troubleshooting

### Tool Not Executing

1. **Check browser console** for JavaScript errors
2. **Verify agent is initialized** with tools array
3. **Check system prompt** mentions available tools
4. **Test with simple prompt**: "Calculate 2+2 using JavaScript"

### TypeScript Errors

```bash
cd /Users/ghu/aiworker/pi-mono/packages/web-ui-react
npm run check
```

### Dev Server Issues

```bash
# Stop and restart
cd /Users/ghu/aiworker/pi-mono/packages/web-ui-react
npm run dev
```

### Proxy Server Issues

```bash
# Check if running
ps aux | grep azure-proxy

# Restart if needed
cd /Users/ghu/aiworker/pi-mono/packages/web-ui
node azure-proxy-server.js
```

## Code References

### Agent Initialization with Tools

[App.tsx:33-57](packages/web-ui-react/src/App.tsx#L33-L57):
```typescript
useEffect(() => {
  const defaultModel = getModel('azure-openai-responses', 'gpt-5.2');
  defaultModel.baseUrl = 'http://localhost:3001';

  const javascriptRepl = createJavaScriptReplTool();

  createAgent({
    initialState: {
      systemPrompt: `You are a helpful AI assistant powered by Azure OpenAI with Managed Identity.

Available tools:
- JavaScript REPL: Execute JavaScript code in a browser environment with access to standard Web APIs

Feel free to use these tools when needed to provide accurate and helpful responses.`,
      model: defaultModel,
      thinkingLevel: 'off',
      messages: [],
      tools: [javascriptRepl],
    },
  });
}, [createAgent]);
```

### JavaScript REPL Tool Implementation

[javascript-repl.ts:1-169](packages/web-ui-react/src/tools/javascript-repl.ts):
- Lines 1-28: TypeScript types and schema definition
- Lines 30-91: `executeJavaScript()` function with console capture
- Lines 93-169: Tool factory and export

## Summary

✅ **Successfully added JavaScript REPL tool to React Web UI**

The React Web UI now has basic tool support with the JavaScript REPL tool. Users can ask the AI to execute JavaScript code, and the agent will use this tool to run the code and display results.

While this is a simplified implementation compared to the Lit version, it provides a foundation for adding more sophisticated tools and features in future phases.

**Next**: Test the tool in the browser by asking the AI to execute JavaScript code!
