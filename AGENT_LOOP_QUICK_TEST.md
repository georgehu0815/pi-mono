# Agent Loop Quick Test Reference

## 🚀 Quick Start (30 seconds)

```bash
# 1. Authenticate
az account show || az login

# 2. Run test
cd /Users/ghu/aiworker/pi-mono
node --import tsx test_agentloop_azure.ts
```

**Expected:** Response "Hello! 😊 How can I help you today?"

---

## 📝 Common Test Scenarios

### Test 1: Basic Prompt (Default)
```bash
node --import tsx test_agentloop_azure.ts
```
Prompt: "Hello!"

### Test 2: Math Question
Edit line 31, change to:
```typescript
await agent.prompt("What is 2+2?");
```
Then run: `node --import tsx test_agentloop_azure.ts`

### Test 3: Code Generation
Edit line 31, change to:
```typescript
await agent.prompt("Write a JavaScript function to reverse a string");
```
Then run: `node --import tsx test_agentloop_azure.ts`

### Test 4: Complex Question
Edit line 31, change to:
```typescript
await agent.prompt("Explain quantum computing in simple terms");
```
Then run: `node --import tsx test_agentloop_azure.ts`

---

## ✅ Success Indicators

- ✅ No errors in output
- ✅ Sees "Using AzureCliCredential" message
- ✅ Response streams word-by-word
- ✅ Sees "Agent loop test completed!"
- ✅ Exit code 0: `echo $?` returns 0

---

## ❌ Common Errors

| Error | Solution |
|-------|----------|
| Azure CLI not authenticated | `az login` |
| tsx must use --import | Use `--import` not `--loader` |
| Module not found | `npm install && npm run build` |
| Timeout | Check internet connection |

---

## 📊 Expected Performance

- **Time to first token:** < 2 seconds
- **Total response time:** 2-5 seconds
- **Streaming:** Real-time (visible word-by-word)

---

## 🔗 Full Guide

For detailed testing, see: [AGENT_LOOP_TESTING_GUIDE.md](AGENT_LOOP_TESTING_GUIDE.md)

**Test variations:**
- Multi-turn conversations
- Thinking mode enabled
- Performance benchmarks
- Error handling
- Different models

---

**Time to run:** 30 seconds
**Prerequisites:** Azure CLI authenticated, Node.js v20+
