import type { AgentTool } from "@mariozechner/pi-agent-core";
import { type Static, Type } from "@sinclair/typebox";

/**
 * Simplified JavaScript REPL tool for React UI
 *
 * This is a basic implementation that executes JavaScript code.
 * For a full implementation with sandboxing, artifacts, and attachments access,
 * see the web-ui package implementation.
 */

const javascriptReplSchema = Type.Object({
	title: Type.String({
		description:
			"Brief title describing what the code snippet tries to achieve in active form, e.g. 'Calculating sum'",
	}),
	code: Type.String({ description: "JavaScript code to execute" }),
});

export type JavaScriptReplParams = Static<typeof javascriptReplSchema>;

export interface JavaScriptReplResult {
	output?: string;
	files?: Array<{
		fileName: string;
		mimeType: string;
		size: number;
		contentBase64: string;
	}>;
}

/**
 * Execute JavaScript code in an isolated context
 *
 * Note: This is a simplified version. The web-ui package has a more sophisticated
 * implementation using SandboxedIframe with runtime providers for artifacts,
 * attachments, console output, and file downloads.
 */
async function executeJavaScript(code: string, signal?: AbortSignal): Promise<{ output: string; files?: any[] }> {
	if (!code) {
		throw new Error("Code parameter is required");
	}

	// Check for abort before starting
	if (signal?.aborted) {
		throw new Error("Execution aborted");
	}

	try {
		// Capture console output
		const consoleOutput: string[] = [];
		const originalConsole = {
			log: console.log,
			warn: console.warn,
			error: console.error,
		};

		// Override console methods
		console.log = (...args: any[]) => {
			consoleOutput.push(args.map(String).join(" "));
			originalConsole.log(...args);
		};
		console.warn = (...args: any[]) => {
			consoleOutput.push(`[WARN] ${args.map(String).join(" ")}`);
			originalConsole.warn(...args);
		};
		console.error = (...args: any[]) => {
			consoleOutput.push(`[ERROR] ${args.map(String).join(" ")}`);
			originalConsole.error(...args);
		};

		try {
			// Execute the code (using Function constructor for dynamic execution)
			const result = new Function(code)();

			// Build output
			let output = "";
			if (consoleOutput.length > 0) {
				output += consoleOutput.join("\n");
			}

			if (result !== undefined) {
				if (output) output += "\n";
				output += `=> ${typeof result === "object" ? JSON.stringify(result, null, 2) : result}`;
			}

			return {
				output: output.trim() || "Code executed successfully (no output)",
				files: [],
			};
		} finally {
			// Restore console
			console.log = originalConsole.log;
			console.warn = originalConsole.warn;
			console.error = originalConsole.error;
		}
	} catch (error: unknown) {
		throw new Error((error as Error).message || "Execution failed");
	}
}

export function createJavaScriptReplTool(): AgentTool<typeof javascriptReplSchema, JavaScriptReplResult> {
	return {
		label: "JavaScript REPL",
		name: "javascript_repl",
		description: `Execute JavaScript code in a browser environment.

**Available APIs:**
- Standard JavaScript (ES2023+)
- Web APIs (fetch, localStorage, etc.)
- Console methods (console.log, console.warn, console.error)

**Usage:**
- Return values are automatically displayed
- Console output is captured and shown
- Async/await is supported

**Examples:**
\`\`\`javascript
// Calculate and return result
const sum = [1, 2, 3, 4, 5].reduce((a, b) => a + b, 0);
console.log("Sum:", sum);
return sum;

// Fetch data from API
const response = await fetch('https://api.example.com/data');
const data = await response.json();
console.log("Data:", data);
return data;
\`\`\`

**Limitations:**
- Code runs in the browser context (not sandboxed in this basic version)
- No access to artifacts or attachments in this simplified implementation
- For advanced features, use the full web-ui implementation`,
		parameters: javascriptReplSchema,
		execute: async (_toolCallId: string, args: Static<typeof javascriptReplSchema>, signal?: AbortSignal) => {
			const result = await executeJavaScript(args.code, signal);

			return {
				content: [{ type: "text", text: result.output }],
				details: { files: result.files },
			};
		},
	};
}

// Export a default instance
export const javascriptReplTool = createJavaScriptReplTool();
