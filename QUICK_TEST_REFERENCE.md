# Quick Test Reference - React UI Tools

## 🚀 Quick Start (30 seconds)

```bash
# Terminal 1: Start proxy
cd /Users/ghu/aiworker/pi-mono/packages/web-ui && node azure-proxy-server.js

# Terminal 2: Start React app
cd /Users/ghu/aiworker/pi-mono/packages/web-ui-react && npm run dev

# Browser: Open http://localhost:5174
```

## 📝 Test Prompts (Copy & Paste)

### 1️⃣ Basic Test (30 seconds)
```
Calculate the sum of numbers from 1 to 100
```
**Expected:** Result should be 5050

---

### 2️⃣ Array Test (30 seconds)
```
Generate an array of 10 random numbers between 1 and 100, sort them, and show me the result
```
**Expected:** See both original and sorted arrays

---

### 3️⃣ Async Test (30 seconds)
```
Fetch data from https://jsonplaceholder.typicode.com/todos/1 and show me the result
```
**Expected:** JSON object with todo item

---

### 4️⃣ Console Test (30 seconds)
```
Write JavaScript code that uses console.log, console.warn, and console.error
```
**Expected:** See all three console outputs

---

### 5️⃣ Error Test (30 seconds)
```
Write JavaScript code that throws an error
```
**Expected:** See error message displayed

---

## ✅ Quick Verification

After each test, check:
- [ ] No console errors in browser DevTools (F12)
- [ ] Tool call block appears in chat
- [ ] Tool result shows correctly
- [ ] Agent response makes sense

## 🔧 Quick Troubleshooting

**Tool not being called?**
→ Try: "Use the JavaScript REPL tool to calculate 2+2"

**Connection errors?**
→ Check both servers are running (see Quick Start above)

**TypeScript errors?**
→ Run: `cd /Users/ghu/aiworker/pi-mono && npm run check`

**Azure auth errors?**
→ Run: `az login`

## 📚 Full Guide

For detailed testing, see: [TESTING_REACT_UI_TOOLS.md](TESTING_REACT_UI_TOOLS.md)

---

**Time to complete all 5 quick tests:** ~3 minutes
**Success rate:** Should be 100% if servers are running correctly
