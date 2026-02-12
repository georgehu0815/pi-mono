# Agent Loop Testing Guide - Azure OpenAI

## Overview

This guide provides detailed steps to test the agent loop functionality using Azure OpenAI with Managed Identity authentication.

**Test File:** `/Users/ghu/aiworker/pi-mono/test_agentloop_azure.ts`

**What It Tests:**
- Agent initialization with Azure OpenAI
- Message streaming via event subscription
- Real-time text delta processing
- Azure Managed Identity authentication
- Agent loop state management

---

## Prerequisites

### 1. Azure CLI Authentication

The test uses Azure Managed Identity through `AzureCliCredential`, which requires you to be logged into Azure CLI.

**Check Authentication Status:**
```bash
az account show
```

**If Not Authenticated:**
```bash
# Login to Azure
az login

# Verify account
az account show

# Expected output should show your Azure subscription details
```

**Verify Access to Azure OpenAI:**
```bash
# Check you can access the Azure OpenAI resource
az cognitiveservices account show \
  --name datacopilothub8882317788 \
  --resource-group <your-resource-group>
```

---

### 2. Node.js Version

**Check Node.js version:**
```bash
node --version
```

**Required:** Node.js v20.0.0 or higher
**Recommended:** Node.js v22.x (latest LTS)

**If outdated:**
```bash
# Install latest Node.js using nvm
nvm install 22
nvm use 22
```

---

### 3. Dependencies Installed

**Verify packages are installed:**
```bash
cd /Users/ghu/aiworker/pi-mono
npm install
```

**Check required packages:**
```bash
# Agent core package
ls packages/agent/dist

# AI package
ls packages/ai/dist

# Both should have compiled JavaScript files
```

**If missing, build packages:**
```bash
# Build all packages
npm run build
```

---

### 4. Environment Configuration

**The test automatically sets these variables:**
- `AZURE_OPENAI_BASE_URL` - Azure OpenAI endpoint
- `AZURE_OPENAI_API_VERSION` - API version (2025-03-01-preview)
- `AZURE_OPENAI_DEPLOYMENT_NAME_MAP` - Model deployment mapping

**Optional: Set manually before running:**
```bash
export AZURE_OPENAI_BASE_URL="https://datacopilothub8882317788.cognitiveservices.azure.com/openai"
export AZURE_OPENAI_API_VERSION="2025-03-01-preview"
export AZURE_OPENAI_DEPLOYMENT_NAME_MAP="gpt-5.2=gpt-5.2-chat"
```

---

## Quick Start (30 Seconds)

```bash
# 1. Navigate to project root
cd /Users/ghu/aiworker/pi-mono

# 2. Ensure Azure CLI is authenticated
az account show

# 3. Run the test
node --import tsx test_agentloop_azure.ts
```

**Expected Output:**
```
🚀 Starting Agent Loop Test with Azure OpenAI
📍 Endpoint: https://datacopilothub8882317788.cognitiveservices.azure.com/openai
🔑 Using Azure Managed Identity (AzureCliCredential)

💬 Sending prompt: 'Hello!'

📝 Response:

Hello! 😊 How can I help you today?

✅ Agent loop test completed!
```

---

## Detailed Testing Steps

### Step 1: Verify Prerequisites

**1.1 Check Azure Authentication**
```bash
az account show
```

✅ **PASS:** Should display your Azure subscription
❌ **FAIL:** Run `az login`

**1.2 Check Node.js Version**
```bash
node --version
```

✅ **PASS:** v20.0.0 or higher
❌ **FAIL:** Update Node.js

**1.3 Check Project Location**
```bash
pwd
# Should output: /Users/ghu/aiworker/pi-mono

ls test_agentloop_azure.ts
# Should output: test_agentloop_azure.ts
```

✅ **PASS:** File exists
❌ **FAIL:** Navigate to correct directory

---

### Step 2: Understand the Test File

**Read the test file:**
```bash
cat test_agentloop_azure.ts
```

**Key Components:**

**2.1 Environment Setup (Lines 4-7)**
```typescript
process.env.AZURE_OPENAI_BASE_URL = "https://datacopilothub8882317788.cognitiveservices.azure.com/openai";
process.env.AZURE_OPENAI_API_VERSION = "2025-03-01-preview";
process.env.AZURE_OPENAI_DEPLOYMENT_NAME_MAP = "gpt-5.2=gpt-5.2-chat";
```
- Configures Azure OpenAI endpoint
- Sets API version
- Maps model name to deployment

**2.2 Agent Creation (Lines 14-18)**
```typescript
const agent = new Agent({
  initialState: {
    systemPrompt: "You are a helpful assistant.",
    model: getModel("azure-openai-responses", "gpt-5.2"),
  },
});
```
- Creates new Agent instance
- Sets system prompt
- Configures Azure OpenAI model

**2.3 Event Subscription (Lines 20-26)**
```typescript
agent.subscribe((event) => {
  if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
    process.stdout.write(event.assistantMessageEvent.delta);
  }
});
```
- Subscribes to agent events
- Filters for text_delta events (streaming tokens)
- Writes tokens to stdout in real-time

**2.4 Prompt Execution (Line 31)**
```typescript
await agent.prompt("Hello!");
```
- Sends prompt to agent
- Waits for completion
- Triggers agent loop

---

### Step 3: Run the Test

**3.1 Basic Test Run**
```bash
node --import tsx test_agentloop_azure.ts
```

**What Happens:**
1. Node.js loads TypeScript support via `tsx`
2. Test file executes
3. Agent initializes
4. Azure CLI credentials are acquired
5. Prompt is sent to Azure OpenAI
6. Response streams back token-by-token
7. Each token is displayed immediately
8. Test completes

**Expected Timeline:**
- **0s:** Test starts, environment configured
- **0.5s:** Azure credentials acquired
- **1s:** Prompt sent to Azure OpenAI
- **1.5s:** First token received
- **2-3s:** Full response received
- **3s:** Test completes

---

### Step 4: Observe the Output

**4.1 Startup Messages**
```
🚀 Starting Agent Loop Test with Azure OpenAI
📍 Endpoint: https://datacopilothub8882317788.cognitiveservices.azure.com/openai
🔑 Using Azure Managed Identity (AzureCliCredential)
```
✅ Confirms Azure endpoint and authentication method

**4.2 Debug Logs**
```
[Azure OpenAI Responses] Creating client with: - azure-openai-responses.ts:208
baseURL: - azure-openai-responses.ts:209 https://datacopilothub8882317788.cognitiveservices.azure.com/openai
apiVersion: - azure-openai-responses.ts:210 2025-03-01-preview
deployment: - azure-openai-responses.ts:211 default
[Azure OpenAI Responses] Using AzureCliCredential - azure-openai-responses.ts:35
```
✅ Shows client configuration details

**4.3 Prompt Display**
```
💬 Sending prompt: 'Hello!'

📝 Response:
```
✅ Confirms prompt being sent

**4.4 Streaming Response**
```
Hello! 😊 How can I help you today?
```
✅ Shows real-time streaming (appears word-by-word)

**4.5 Completion**
```
✅ Agent loop test completed!
```
✅ Test finished successfully

---

### Step 5: Verify Success

**Success Criteria:**

✅ **No Errors**
- No error messages in output
- No stack traces
- Process exits with code 0

✅ **Authentication Worked**
- Saw "Using AzureCliCredential" message
- No "authentication failed" errors

✅ **Streaming Worked**
- Response appeared token-by-token (not all at once)
- Text was readable and coherent

✅ **Completion Confirmed**
- Saw "Agent loop test completed!" message
- Process exited normally

**Check Exit Code:**
```bash
node --import tsx test_agentloop_azure.ts
echo "Exit code: $?"
```
✅ Should output: `Exit code: 0`

---

## Advanced Testing

### Test 1: Different Prompts

**Modify the prompt to test various scenarios:**

**1.1 Simple Question**
```bash
# Edit test_agentloop_azure.ts
# Change line 31 to:
await agent.prompt("What is 2+2?");

# Run test
node --import tsx test_agentloop_azure.ts
```

**Expected:** Mathematical answer (4)

---

**1.2 Complex Question**
```bash
# Change to:
await agent.prompt("Explain quantum computing in simple terms");

# Run test
node --import tsx test_agentloop_azure.ts
```

**Expected:** Longer, detailed explanation

---

**1.3 Code Generation**
```bash
# Change to:
await agent.prompt("Write a JavaScript function to reverse a string");

# Run test
node --import tsx test_agentloop_azure.ts
```

**Expected:** Code with explanation

---

### Test 2: Enable Thinking

**Create a version with thinking enabled:**

```bash
# Create new test file
cat > test_agentloop_azure_thinking.ts << 'EOF'
import { Agent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";

process.env.AZURE_OPENAI_BASE_URL = "https://datacopilothub8882317788.cognitiveservices.azure.com/openai";
process.env.AZURE_OPENAI_API_VERSION = "2025-03-01-preview";
process.env.AZURE_OPENAI_DEPLOYMENT_NAME_MAP = "gpt-5.2=gpt-5.2-chat";

console.log("🚀 Starting Agent Loop Test with Thinking Enabled");

const agent = new Agent({
  initialState: {
    systemPrompt: "You are a helpful assistant.",
    model: getModel("azure-openai-responses", "gpt-5.2"),
    thinkingLevel: "extended", // Enable thinking!
  },
});

agent.subscribe((event) => {
  if (event.type === "message_update") {
    if (event.assistantMessageEvent.type === "text_delta") {
      // Normal text in default color
      process.stdout.write(event.assistantMessageEvent.delta);
    } else if (event.assistantMessageEvent.type === "thinking_delta") {
      // Thinking in gray color
      process.stdout.write("\x1b[90m" + event.assistantMessageEvent.delta + "\x1b[0m");
    }
  }
});

console.log("💬 Sending prompt: 'Solve this riddle: I speak without a mouth and hear without ears. What am I?'\n");

await agent.prompt("Solve this riddle: I speak without a mouth and hear without ears. What am I?");

console.log("\n\n✅ Test completed!");
EOF

# Run test
node --import tsx test_agentloop_azure_thinking.ts
```

**Expected:**
- Gray text showing thinking process
- Regular text showing final answer
- Answer: "An echo"

---

### Test 3: Multiple Prompts in Sequence

**Create a multi-turn conversation test:**

```bash
cat > test_agentloop_azure_multiturm.ts << 'EOF'
import { Agent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";

process.env.AZURE_OPENAI_BASE_URL = "https://datacopilothub8882317788.cognitiveservices.azure.com/openai";
process.env.AZURE_OPENAI_API_VERSION = "2025-03-01-preview";
process.env.AZURE_OPENAI_DEPLOYMENT_NAME_MAP = "gpt-5.2=gpt-5.2-chat";

console.log("🚀 Starting Multi-Turn Conversation Test\n");

const agent = new Agent({
  initialState: {
    systemPrompt: "You are a helpful assistant.",
    model: getModel("azure-openai-responses", "gpt-5.2"),
  },
});

agent.subscribe((event) => {
  if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
    process.stdout.write(event.assistantMessageEvent.delta);
  }
});

// Turn 1
console.log("👤 User: My name is Alice");
console.log("🤖 Assistant: ");
await agent.prompt("My name is Alice");
console.log("\n");

// Turn 2
console.log("👤 User: What's my name?");
console.log("🤖 Assistant: ");
await agent.prompt("What's my name?");
console.log("\n");

// Turn 3
console.log("👤 User: What was the first thing I told you?");
console.log("🤖 Assistant: ");
await agent.prompt("What was the first thing I told you?");
console.log("\n");

console.log("✅ Multi-turn test completed!");
EOF

node --import tsx test_agentloop_azure_multiturm.ts
```

**Expected:**
- Agent remembers context across prompts
- Correctly recalls "Alice"
- Correctly recalls first message

---

### Test 4: Error Handling

**Test how the agent handles errors:**

```bash
cat > test_agentloop_azure_error.ts << 'EOF'
import { Agent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";

// INTENTIONALLY USE WRONG ENDPOINT
process.env.AZURE_OPENAI_BASE_URL = "https://invalid-endpoint.example.com/openai";
process.env.AZURE_OPENAI_API_VERSION = "2025-03-01-preview";
process.env.AZURE_OPENAI_DEPLOYMENT_NAME_MAP = "gpt-5.2=gpt-5.2-chat";

console.log("🚀 Testing Error Handling\n");

const agent = new Agent({
  initialState: {
    systemPrompt: "You are a helpful assistant.",
    model: getModel("azure-openai-responses", "gpt-5.2"),
  },
});

agent.subscribe((event) => {
  console.log("Event:", event.type);
  if (event.type === "agent_error") {
    console.error("❌ Error detected:", event.error);
  }
});

try {
  await agent.prompt("Hello!");
} catch (error) {
  console.error("❌ Caught error:", error.message);
}

console.log("✅ Error handling test completed!");
EOF

node --import tsx test_agentloop_azure_error.ts 2>&1
```

**Expected:**
- Error is caught and displayed
- No uncaught exceptions
- Graceful failure

---

### Test 5: Performance Testing

**Measure response times:**

```bash
cat > test_agentloop_azure_perf.ts << 'EOF'
import { Agent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";

process.env.AZURE_OPENAI_BASE_URL = "https://datacopilothub8882317788.cognitiveservices.azure.com/openai";
process.env.AZURE_OPENAI_API_VERSION = "2025-03-01-preview";
process.env.AZURE_OPENAI_DEPLOYMENT_NAME_MAP = "gpt-5.2=gpt-5.2-chat";

console.log("🚀 Starting Performance Test\n");

const agent = new Agent({
  initialState: {
    systemPrompt: "You are a helpful assistant.",
    model: getModel("azure-openai-responses", "gpt-5.2"),
  },
});

let firstTokenTime: number | null = null;
let tokenCount = 0;
const startTime = Date.now();

agent.subscribe((event) => {
  if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
    if (firstTokenTime === null) {
      firstTokenTime = Date.now();
      console.log(`⏱️  Time to first token: ${firstTokenTime - startTime}ms`);
    }
    tokenCount++;
    process.stdout.write(event.assistantMessageEvent.delta);
  }
});

console.log("💬 Prompt: What is TypeScript?\n");
await agent.prompt("What is TypeScript?");

const endTime = Date.now();
const totalTime = endTime - startTime;
const avgTokenTime = firstTokenTime ? (endTime - firstTokenTime) / tokenCount : 0;

console.log(`\n\n📊 Performance Metrics:`);
console.log(`   Total time: ${totalTime}ms`);
console.log(`   Time to first token: ${firstTokenTime ? firstTokenTime - startTime : 0}ms`);
console.log(`   Total tokens: ${tokenCount}`);
console.log(`   Avg time per token: ${avgTokenTime.toFixed(2)}ms`);
console.log(`   Tokens per second: ${(1000 / avgTokenTime).toFixed(2)}`);

console.log("\n✅ Performance test completed!");
EOF

node --import tsx test_agentloop_azure_perf.ts
```

**Expected Metrics:**
- Time to first token: 500-1500ms
- Total time: 2000-5000ms
- Avg time per token: 20-50ms
- Tokens per second: 20-50 tokens/sec

---

## Troubleshooting

### Issue 1: Azure CLI Not Authenticated

**Error:**
```
Error: Azure CLI not authenticated
```

**Solution:**
```bash
az login
az account show
```

---

### Issue 2: Wrong Node.js Flag

**Error:**
```
Error: tsx must be loaded with --import instead of --loader
```

**Solution:**
Use `--import` instead of `--loader`:
```bash
# Wrong
node --loader tsx test_agentloop_azure.ts

# Correct
node --import tsx test_agentloop_azure.ts
```

---

### Issue 3: Module Not Found

**Error:**
```
Cannot find module '@mariozechner/pi-agent-core'
```

**Solution:**
```bash
# Install dependencies
npm install

# Build packages
npm run build

# Verify packages exist
ls packages/agent/dist
ls packages/ai/dist
```

---

### Issue 4: TypeScript Compilation Error

**Error:**
```
SyntaxError: Unexpected token 'import'
```

**Solution:**
Ensure using `--import tsx` flag:
```bash
node --import tsx test_agentloop_azure.ts
```

---

### Issue 5: Network Timeout

**Error:**
```
Error: Request timeout
```

**Solutions:**

1. **Check Internet Connection:**
   ```bash
   ping google.com
   ```

2. **Check Azure Endpoint:**
   ```bash
   curl https://datacopilothub8882317788.cognitiveservices.azure.com
   ```

3. **Check Firewall:**
   - Ensure port 443 is not blocked
   - Check corporate firewall/VPN

---

### Issue 6: Authentication Token Expired

**Error:**
```
Error: Authentication token expired
```

**Solution:**
```bash
# Re-authenticate
az logout
az login
az account show
```

---

### Issue 7: Model Not Found

**Error:**
```
Error: Deployment 'gpt-5.2-chat' not found
```

**Solutions:**

1. **Verify Deployment Name:**
   ```bash
   az cognitiveservices account deployment list \
     --name datacopilothub8882317788 \
     --resource-group <your-resource-group>
   ```

2. **Update Deployment Mapping:**
   ```bash
   # Edit test_agentloop_azure.ts
   # Update line 7 with correct deployment name
   ```

---

## Verification Checklist

After running the test, verify:

### ✅ Functional Tests
- [ ] Test runs without errors
- [ ] Azure authentication succeeds
- [ ] Prompt is sent successfully
- [ ] Response streams in real-time
- [ ] Response is coherent and relevant
- [ ] Test completes normally
- [ ] Exit code is 0

### ✅ Performance Tests
- [ ] Time to first token < 2 seconds
- [ ] Total response time < 10 seconds
- [ ] Streaming appears smooth
- [ ] No noticeable delays

### ✅ Output Tests
- [ ] Startup messages display correctly
- [ ] Debug logs show correct endpoint
- [ ] Response text is readable
- [ ] Completion message appears
- [ ] No error messages or warnings

---

## Understanding the Results

### What the Test Demonstrates

**1. Agent Initialization ✅**
- Agent core library works correctly
- Azure OpenAI provider integration works
- Model configuration is correct

**2. Azure Managed Identity ✅**
- AzureCliCredential successfully acquires token
- No API key needed
- Secure authentication via Azure RBAC

**3. Message Streaming ✅**
- Real-time token-by-token streaming
- Event subscription system works
- text_delta events fire correctly

**4. Agent Loop ✅**
- Agent loop processes requests
- State management works
- Event dispatching works
- Completion detection works

**5. End-to-End Flow ✅**
- Full request/response cycle
- All components integrated correctly
- Production-ready setup

---

## Next Steps

### 1. Test with React UI

Now that the agent loop works in isolation, test it in the React UI:

```bash
# Terminal 1: Proxy server
cd /Users/ghu/aiworker/pi-mono/packages/web-ui
node azure-proxy-server.js

# Terminal 2: React app
cd /Users/ghu/aiworker/pi-mono/packages/web-ui-react
npm run dev

# Browser: http://localhost:5174
```

### 2. Test with Tools

The React UI includes the JavaScript REPL tool. Test prompts like:
- "Calculate the sum of numbers from 1 to 100"
- "Generate an array of random numbers and sort them"

### 3. Test Multi-Turn Conversations

Test context retention:
- Start a conversation
- Reference previous messages
- Verify agent remembers context

### 4. Test Different Models

Try different Azure OpenAI models:
```typescript
// Edit test file
model: getModel("azure-openai-responses", "gpt-4")
```

---

## Related Documentation

- **[AZURE_TUI_SETUP.md](AZURE_TUI_SETUP.md)** - Azure OpenAI setup guide
- **[TESTING_REACT_UI_TOOLS.md](TESTING_REACT_UI_TOOLS.md)** - React UI testing guide
- **[REACT_UI_TOOLS_SETUP.md](REACT_UI_TOOLS_SETUP.md)** - Tools setup summary

---

## Summary

The `test_agentloop_azure.ts` file provides a simple way to verify:
- ✅ Agent core functionality
- ✅ Azure OpenAI integration
- ✅ Managed identity authentication
- ✅ Message streaming
- ✅ Event system

**Time to complete all tests:** ~10-15 minutes
**Success rate:** Should be 100% if Azure CLI is authenticated

This test validates the foundation that powers both the CLI and React UI applications! 🎉
