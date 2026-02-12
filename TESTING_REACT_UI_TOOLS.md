# Testing React UI Tools - Complete Guide

## Overview

This guide walks you through testing the JavaScript REPL tool that was added to the React Web UI application.

## Prerequisites

### 1. Ensure Azure CLI is Authenticated

```bash
az login
az account show
```

You should see your Azure account details. If not, run `az login` again.

### 2. Start the Azure Proxy Server

The proxy server handles Azure Managed Identity authentication for the browser.

```bash
# Terminal 1
cd /Users/ghu/aiworker/pi-mono/packages/web-ui
node azure-proxy-server.js
```

**Expected Output:**
```
🚀 Azure OpenAI Proxy Server
📍 Endpoint: https://datacopilothub8882317788.cognitiveservices.azure.com
🔑 Using Azure Managed Identity (AzureCliCredential for local dev)
🌐 Server running on http://localhost:3001
✅ Ready to proxy requests to Azure OpenAI
```

**Verification:**
```bash
# In another terminal, test the proxy
curl -X POST http://localhost:3001/openai/deployments/gpt-5.2-chat/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}],"max_tokens":5}' 2>&1 | head -20
```

You should see a response from Azure OpenAI.

### 3. Start the React Dev Server

```bash
# Terminal 2
cd /Users/ghu/aiworker/pi-mono/packages/web-ui-react
npm run dev
```

**Expected Output:**
```
> @mariozechner/pi-web-ui-react@0.1.0 dev
> vite

  VITE v7.3.1  ready in 180 ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

### 4. Open the Application

1. Open your browser
2. Navigate to http://localhost:5174
3. Open browser DevTools (F12 or Cmd+Option+I on Mac)
4. Switch to the **Console** tab

**Expected:**
- No console errors
- Application loads with "New Session" title
- Azure OpenAI badge visible in header
- Message input box at the bottom

---

## Test Cases

### Test 1: Simple Calculation

**Objective:** Verify the JavaScript REPL can execute basic arithmetic.

**Prompt:**
```
Calculate the sum of numbers from 1 to 100
```

**Expected Behavior:**

1. **Agent Thinking:**
   - Agent should recognize this requires code execution
   - Agent should decide to use the `javascript_repl` tool

2. **Tool Call:**
   - A tool call block should appear in the chat
   - Tool name: `javascript_repl`
   - Parameters should include:
     - `title`: Something like "Calculating sum"
     - `code`: JavaScript code to calculate the sum

3. **Tool Result:**
   - Console output showing the result
   - Return value: `5050` (or similar)

4. **Agent Response:**
   - Agent explains the result
   - "The sum of numbers from 1 to 100 is 5050"

**Browser Console Verification:**
- No JavaScript errors
- You may see console.log output from the executed code

**Example Expected Code:**
```javascript
const sum = Array.from({length: 100}, (_, i) => i + 1).reduce((a, b) => a + b, 0);
console.log("Sum:", sum);
return sum;
```

---

### Test 2: Array Operations

**Objective:** Verify the REPL can work with arrays and complex operations.

**Prompt:**
```
Generate an array of 10 random numbers between 1 and 100, sort them in ascending order, and show me both the original and sorted arrays
```

**Expected Behavior:**

1. **Tool Call:**
   - Title: "Generating and sorting random numbers"
   - Code should:
     - Generate 10 random numbers
     - Create a sorted copy
     - Log both arrays
     - Return the results

2. **Tool Result:**
   - Console output showing both arrays
   - Original array (unsorted)
   - Sorted array

3. **Agent Response:**
   - Explains the arrays
   - Shows the comparison

**Example Expected Code:**
```javascript
const original = Array.from({length: 10}, () => Math.floor(Math.random() * 100) + 1);
const sorted = [...original].sort((a, b) => a - b);
console.log("Original:", original);
console.log("Sorted:", sorted);
return { original, sorted };
```

---

### Test 3: Async/Await with Fetch

**Objective:** Verify the REPL supports asynchronous operations.

**Prompt:**
```
Fetch data from https://jsonplaceholder.typicode.com/todos/1 and show me the result
```

**Expected Behavior:**

1. **Tool Call:**
   - Title: "Fetching data from API"
   - Code should use `fetch()` with `await`

2. **Tool Result:**
   - Console output showing the fetched data
   - JSON object with:
     - `userId`: 1
     - `id`: 1
     - `title`: "delectus aut autem"
     - `completed`: false

3. **Agent Response:**
   - Explains the fetched todo item
   - Shows the data structure

**Example Expected Code:**
```javascript
const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
const data = await response.json();
console.log("Fetched data:", data);
return data;
```

**Note:** If you see a CORS error, this is expected for some URLs. The fetch should work for `jsonplaceholder.typicode.com` which has CORS enabled.

---

### Test 4: Console Output Capture

**Objective:** Verify console.log, console.warn, and console.error are captured.

**Prompt:**
```
Write JavaScript code that demonstrates console.log, console.warn, and console.error
```

**Expected Behavior:**

1. **Tool Call:**
   - Code should call all three console methods

2. **Tool Result:**
   - Shows all console output
   - `console.log` output appears normally
   - `console.warn` appears with `[WARN]` prefix
   - `console.error` appears with `[ERROR]` prefix

3. **Browser Console:**
   - All console calls should also appear in DevTools Console
   - (The tool captures AND forwards to the real console)

**Example Expected Code:**
```javascript
console.log("This is a log message");
console.warn("This is a warning message");
console.error("This is an error message");
return "Console output test complete";
```

---

### Test 5: Error Handling

**Objective:** Verify errors are caught and displayed properly.

**Prompt:**
```
Write JavaScript code that throws an error
```

**Expected Behavior:**

1. **Tool Call:**
   - Code should intentionally throw an error

2. **Tool Result:**
   - Tool call should show as failed/error state
   - Error message should be visible
   - Stack trace might be included

3. **Agent Response:**
   - Agent should acknowledge the error
   - Might explain what went wrong

**Example Expected Code:**
```javascript
throw new Error("This is a test error");
```

---

### Test 6: Return Value Display

**Objective:** Verify different return value types are displayed correctly.

**Prompt:**
```
Show me examples of different JavaScript return types: string, number, boolean, object, and array
```

**Expected Behavior:**

1. **Tool Call:**
   - Code should return different types

2. **Tool Result:**
   - Return value should be displayed
   - Objects should be formatted as JSON
   - Arrays should be readable

**Example Expected Code:**
```javascript
const examples = {
  string: "Hello, World!",
  number: 42,
  boolean: true,
  object: { name: "Test", value: 123 },
  array: [1, 2, 3, 4, 5]
};

console.log("Examples:", examples);
return examples;
```

---

### Test 7: Web APIs Access

**Objective:** Verify access to browser Web APIs.

**Prompt:**
```
Use localStorage to save and retrieve a value
```

**Expected Behavior:**

1. **Tool Call:**
   - Code should use `localStorage.setItem()` and `localStorage.getItem()`

2. **Tool Result:**
   - Shows the saved and retrieved value
   - Value should match

3. **Browser DevTools Verification:**
   - Open Application/Storage tab
   - Check Local Storage for `http://localhost:5174`
   - Should see the saved value

**Example Expected Code:**
```javascript
const key = "test_key";
const value = "Hello from localStorage!";

localStorage.setItem(key, value);
const retrieved = localStorage.getItem(key);

console.log("Saved:", value);
console.log("Retrieved:", retrieved);

return { saved: value, retrieved: retrieved };
```

---

### Test 8: Date and Time Operations

**Objective:** Verify Date API works correctly.

**Prompt:**
```
Get the current date and time, and calculate how many days until Christmas 2026
```

**Expected Behavior:**

1. **Tool Call:**
   - Code should use `new Date()`
   - Calculate difference between dates

2. **Tool Result:**
   - Current date/time
   - Days until Christmas
   - Maybe hours/minutes as well

**Example Expected Code:**
```javascript
const now = new Date();
const christmas = new Date(2026, 11, 25); // December 25, 2026
const diff = christmas - now;
const days = Math.floor(diff / (1000 * 60 * 60 * 24));

console.log("Current date:", now.toLocaleString());
console.log("Christmas 2026:", christmas.toLocaleString());
console.log("Days until Christmas:", days);

return { now: now.toISOString(), daysUntilChristmas: days };
```

---

### Test 9: String Manipulation

**Objective:** Verify string methods work correctly.

**Prompt:**
```
Reverse the string "Hello, World!" and convert it to uppercase
```

**Expected Behavior:**

1. **Tool Call:**
   - Code should use string methods
   - Reverse using split/reverse/join
   - Convert to uppercase

2. **Tool Result:**
   - Shows original string
   - Shows reversed string
   - Shows uppercase reversed string

**Example Expected Code:**
```javascript
const original = "Hello, World!";
const reversed = original.split('').reverse().join('');
const uppercase = reversed.toUpperCase();

console.log("Original:", original);
console.log("Reversed:", reversed);
console.log("Uppercase reversed:", uppercase);

return { original, reversed, uppercase };
```

---

### Test 10: Regular Expressions

**Objective:** Verify regex works correctly.

**Prompt:**
```
Extract all email addresses from this text: "Contact us at support@example.com or sales@company.org"
```

**Expected Behavior:**

1. **Tool Call:**
   - Code should use regex to match email patterns
   - Use `match()` or `exec()`

2. **Tool Result:**
   - Shows extracted email addresses
   - Both emails should be found

**Example Expected Code:**
```javascript
const text = "Contact us at support@example.com or sales@company.org";
const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
const emails = text.match(emailRegex);

console.log("Text:", text);
console.log("Found emails:", emails);

return emails;
```

---

## Verification Checklist

After running all tests, verify:

### ✅ Functional Requirements
- [ ] JavaScript code executes successfully
- [ ] Console output is captured and displayed
- [ ] Return values are shown correctly
- [ ] Errors are caught and displayed
- [ ] Async/await operations work
- [ ] Web APIs are accessible
- [ ] No security warnings in browser console

### ✅ UI/UX Requirements
- [ ] Tool calls are visible in the chat
- [ ] Tool results are displayed clearly
- [ ] No visual glitches or layout issues
- [ ] Loading states work correctly
- [ ] Error states are visually distinct

### ✅ Browser Console
- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No TypeScript errors
- [ ] HMR updates work correctly

### ✅ Network Tab (DevTools)
- [ ] Requests to Azure proxy succeed
- [ ] Chat completions API calls succeed
- [ ] Response times are reasonable (< 5 seconds)

---

## Troubleshooting

### Issue: Tool Not Being Called

**Symptoms:**
- Agent responds directly without using the tool
- No tool call block appears in chat

**Debugging:**

1. **Check System Prompt:**
   ```javascript
   // In App.tsx, verify the system prompt mentions tools
   console.log(agent?.state?.systemPrompt);
   ```

2. **Check Tools Array:**
   ```javascript
   // In browser console
   console.log(agent?.state?.tools);
   // Should show: [{ name: "javascript_repl", ... }]
   ```

3. **Try More Explicit Prompt:**
   ```
   Use the JavaScript REPL tool to calculate 2+2
   ```

**Solutions:**
- Restart the React dev server
- Clear browser cache and reload
- Check that App.tsx includes the tool in the tools array

---

### Issue: Tool Execution Fails

**Symptoms:**
- Tool call appears but shows error
- Red error message in chat

**Debugging:**

1. **Check Browser Console:**
   - Look for JavaScript errors
   - Check if Function constructor is being blocked

2. **Check Code Syntax:**
   - Is the generated code valid JavaScript?
   - Copy the code and try running it manually in browser console

3. **Check for Blocked APIs:**
   - Some APIs might be restricted (e.g., file system access)

**Solutions:**
- Review the error message carefully
- Try simpler code first
- Check browser security settings

---

### Issue: Console Output Not Captured

**Symptoms:**
- Code executes but no console output shown
- Only return value is displayed

**Debugging:**

1. **Check if Code Uses Console:**
   ```javascript
   // Does the generated code include console.log?
   ```

2. **Test Directly:**
   ```javascript
   // In browser console
   console.log("Test");
   // Should appear in console
   ```

**Solutions:**
- Ask agent to explicitly use console.log
- Example: "Calculate the sum and log each step"

---

### Issue: Async Code Times Out

**Symptoms:**
- Fetch requests never complete
- Tool call hangs

**Debugging:**

1. **Check Network Tab:**
   - Is the request being sent?
   - What's the response status?

2. **Check for CORS:**
   - Some URLs block cross-origin requests
   - Look for CORS errors in console

3. **Test URL Directly:**
   ```bash
   curl https://jsonplaceholder.typicode.com/todos/1
   ```

**Solutions:**
- Use CORS-enabled APIs (like jsonplaceholder.typicode.com)
- Add error handling in the code
- Use shorter timeouts

---

### Issue: Azure Proxy Connection Fails

**Symptoms:**
- Chat messages don't send
- Network errors in console
- "Failed to fetch" errors

**Debugging:**

1. **Check Proxy Server:**
   ```bash
   ps aux | grep azure-proxy
   # Should show running process
   ```

2. **Test Proxy Directly:**
   ```bash
   curl http://localhost:3001/health
   ```

3. **Check Azure CLI Auth:**
   ```bash
   az account show
   ```

**Solutions:**
- Restart proxy server: `node azure-proxy-server.js`
- Re-authenticate: `az login`
- Check firewall/antivirus blocking port 3001

---

### Issue: TypeScript Errors After Changes

**Symptoms:**
- IDE shows red underlines
- TypeScript errors in terminal

**Debugging:**

1. **Run Type Check:**
   ```bash
   cd /Users/ghu/aiworker/pi-mono/packages/web-ui-react
   npm run check
   ```

2. **Check Import Paths:**
   - Are all imports correct?
   - Are types exported properly?

**Solutions:**
- Fix type errors shown by TypeScript
- Restart TypeScript server in IDE
- Restart VS Code

---

## Performance Testing

### Response Time Benchmarks

**Expected Response Times:**
- Simple calculation: 2-4 seconds
- Array operations: 2-5 seconds
- Fetch API call: 3-6 seconds (depending on network)
- Complex operations: 5-10 seconds

**How to Measure:**

1. **Use Browser DevTools:**
   - Open Network tab
   - Filter by "chat/completions"
   - Check "Time" column

2. **Use Performance API:**
   ```javascript
   // In browser console
   performance.mark('start');
   // Send message
   // Wait for response
   performance.mark('end');
   performance.measure('chat', 'start', 'end');
   console.log(performance.getEntriesByName('chat')[0].duration);
   ```

**Red Flags:**
- ⚠️ Responses taking > 15 seconds
- ⚠️ Network timeouts
- ⚠️ Hanging requests

---

## Security Testing

### Security Checklist

- [ ] **Code Isolation**: Verify code runs in browser context (not sandboxed in this version)
- [ ] **XSS Protection**: Tool output should not execute arbitrary HTML
- [ ] **API Key Safety**: No API keys visible in network requests (using managed identity)
- [ ] **CORS Enforcement**: Cross-origin requests are properly restricted
- [ ] **Error Messages**: Error messages don't leak sensitive information

### Security Notes

⚠️ **Current Implementation Limitations:**
- Code runs in the same context as the UI (not sandboxed)
- Has access to `localStorage`, `sessionStorage`, DOM
- Can potentially access the page's global variables

⚠️ **Do NOT Run Untrusted Code:**
- Only test with code you understand
- Don't copy/paste random code from the internet
- Be cautious with code that accesses storage or makes network requests

✅ **Future Enhancement:**
- Full implementation should use `SandboxedIframe`
- Code runs in isolated iframe with restricted permissions
- See `/packages/web-ui/src/components/SandboxedIframe.ts` for reference

---

## Advanced Testing

### Test with Complex Scenarios

**1. Multi-Step Calculation:**
```
Create a function to calculate the Fibonacci sequence up to the 10th number,
then find the sum of all even numbers in the sequence
```

**2. Data Transformation:**
```
Create an array of 5 random user objects with name, age, and email properties,
then filter users over 25 and sort by name
```

**3. Error Recovery:**
```
Try to parse this invalid JSON: "{invalid}",
catch the error, and return a helpful error message
```

**4. Performance Test:**
```
Calculate the factorial of 20 using recursion,
and measure how long it takes
```

**5. Browser API Combination:**
```
Get the current URL, create a Date object,
save both to localStorage, then retrieve and display them
```

---

## Success Criteria

### ✅ All Tests Pass If:

1. **Functionality:**
   - All 10 test cases execute successfully
   - Results match expected behavior
   - No unexpected errors

2. **Performance:**
   - Response times within acceptable range
   - No hanging requests
   - Smooth UI interactions

3. **Reliability:**
   - Consistent behavior across multiple runs
   - No random failures
   - Proper error handling

4. **Code Quality:**
   - TypeScript compilation succeeds
   - No console errors
   - No lint warnings

### 🎉 Testing Complete!

If all tests pass, the JavaScript REPL tool is working correctly and ready for use!

---

## Next Steps After Testing

### If Tests Pass ✅
- [ ] Document any edge cases discovered
- [ ] Add more tools (extract_document, artifacts_tool)
- [ ] Implement sandboxed execution
- [ ] Add custom tool result renderers

### If Tests Fail ❌
- [ ] Review error messages and logs
- [ ] Check troubleshooting section
- [ ] Run TypeScript checks: `npm run check`
- [ ] Verify servers are running
- [ ] Check Azure CLI authentication

---

## Additional Resources

- **[REACT_UI_TOOLS_SETUP.md](REACT_UI_TOOLS_SETUP.md)** - Setup summary and architecture
- **[PI_TUI_USER_GUIDE.md](PI_TUI_USER_GUIDE.md)** - Pi CLI/TUI usage
- **[AZURE_TUI_SETUP.md](AZURE_TUI_SETUP.md)** - Azure OpenAI setup
- **[packages/web-ui-react/src/tools/README.md](packages/web-ui-react/src/tools/README.md)** - Tools documentation
- **[packages/web-ui/src/tools/](packages/web-ui/src/tools/)** - Full Lit implementation reference

---

## Feedback and Issues

If you encounter issues not covered in this guide:

1. Check browser console for errors
2. Review troubleshooting section
3. Verify prerequisites are met
4. Test with simpler prompts first
5. Check that both servers are running

**Common Quick Fixes:**
```bash
# Restart everything
# Terminal 1: Proxy server
cd /Users/ghu/aiworker/pi-mono/packages/web-ui
node azure-proxy-server.js

# Terminal 2: React dev server
cd /Users/ghu/aiworker/pi-mono/packages/web-ui-react
npm run dev

# Browser: Hard reload
# Mac: Cmd+Shift+R
# Windows/Linux: Ctrl+Shift+R
```

Happy Testing! 🚀
