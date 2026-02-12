# Debug Commands for Browser Console

Open http://localhost:5173 and run these in the browser console (F12):

## 1. Check if ChatPanel Element Exists

```javascript
// Should return an HTMLElement, not null
document.querySelector('pi-chat-panel')
```

**Expected**: An object like `<pi-chat-panel>`
**If null**: ChatPanel is not being added to the DOM

## 2. Check ChatPanel Visibility

```javascript
const panel = document.querySelector('pi-chat-panel');
if (panel) {
    console.log('ChatPanel found!');
    console.log('Display:', window.getComputedStyle(panel).display);
    console.log('Height:', window.getComputedStyle(panel).height);
    console.log('Visibility:', window.getComputedStyle(panel).visibility);
} else {
    console.log('ChatPanel not in DOM!');
}
```

## 3. Check if Agent is Initialized

```javascript
// Check if there's a global agent variable
console.log('Agent exists:', typeof window.agent !== 'undefined');

// Check the app container
const app = document.getElementById('app');
console.log('App container children:', app.children.length);
console.log('App HTML:', app.innerHTML.substring(0, 500));
```

## 4. Check for JavaScript Errors

```javascript
// This should already show in console, but check:
window.addEventListener('error', (e) => {
    console.error('Error caught:', e.error);
});
```

## 5. Force Re-render (if ChatPanel exists but is hidden)

```javascript
const panel = document.querySelector('pi-chat-panel');
if (panel) {
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.flex = '1';
    panel.style.minHeight = '400px';
    console.log('Forced ChatPanel visibility');
}
```

## What to Look For

- ✅ **ChatPanel exists**: Panel is in DOM but CSS issue
- ❌ **ChatPanel is null**: Panel not being created/rendered
- ⚠️ **Agent undefined**: Agent initialization failed
- 🔴 **JavaScript errors**: Check Console tab for red errors
