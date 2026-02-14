import { Problem } from '../../models/problem.model';

export const eventEmitter: Problem = {
    id: 'event-emitter',
    title: 'Event Emitter',
    description: `Build a custom **Event Emitter** system across multiple files.

Implement an \`EventEmitter\` class that supports subscribing to events, emitting events with data, and unsubscribing handlers. Then create a \`Logger\` class that uses the emitter, and wire everything together in \`index.js\`.

Your implementation should support:
- **\`on(event, handler)\`** — Register a handler for an event
- **\`emit(event, ...args)\`** — Trigger all handlers for an event with optional data
- **\`off(event, handler)\`** — Remove a specific handler from an event

The \`createSystem()\` function in \`index.js\` should return an object with methods for working with the system.`,
    difficulty: 'Medium',
    tags: ['Design Pattern', 'OOP', 'Multi-File'],
    isMultiFile: true,
    files: [
        {
            name: 'eventEmitter.js',
            path: 'src/eventEmitter.js',
            language: 'javascript',
            content: `/**
 * EventEmitter class
 * Supports: on(event, handler), emit(event, ...args), off(event, handler)
 */
class EventEmitter {
  constructor() {
    // Initialize your event storage here
  }

  on(event, handler) {
    // Subscribe a handler to an event
  }

  emit(event, ...args) {
    // Emit an event, calling all registered handlers
  }

  off(event, handler) {
    // Remove a specific handler from an event
  }
}
`
        },
        {
            name: 'logger.js',
            path: 'src/logger.js',
            language: 'javascript',
            content: `/**
 * Logger class that subscribes to EventEmitter events
 * and records a log of all events received.
 */
class Logger {
  constructor(emitter) {
    // Store reference to emitter and initialize log array
  }

  subscribe(eventName) {
    // Subscribe to an event and log all received data
  }

  getLogs() {
    // Return array of log entries: { event, data, timestamp }
  }
}
`
        },
        {
            name: 'index.js',
            path: 'src/index.js',
            language: 'javascript',
            content: `/**
 * Wire the EventEmitter and Logger together.
 * createSystem() returns { emitter, logger, emit, getLogs }
 */
function createSystem() {
  // Create an EventEmitter and Logger
  // Subscribe logger to "message" and "error" events
  // Return an object with: emitter, logger, emit(event, data), getLogs()
}
`
        }
    ],
    boilerplateCode: `// This is a multi-file problem. Edit all files in the VSCode editor.
// Main entry: index.js
function createSystem() {
  // Create an EventEmitter and Logger
}`,
    solutionTemplate: 'createSystem',
    examples: [
        {
            input: 'emit("message", "hello")',
            output: '[{event: "message", data: "hello"}]',
            explanation: 'Emitting a "message" event should be captured by the logger.'
        },
        {
            input: 'emit("message", "a"), emit("error", "fail")',
            output: '[{event: "message", data: "a"}, {event: "error", data: "fail"}]',
            explanation: 'Logger captures events in order across different channels.'
        }
    ],
    constraints: [
        'EventEmitter must support multiple handlers per event',
        'off() should only remove the specific handler passed',
        'emit() should call handlers in registration order',
        'Logger must record event name, data, and timestamp'
    ],
    testCases: [
        {
            id: 1,
            input: JSON.stringify(["basic-emit"]),
            expectedOutput: JSON.stringify([{ event: "message", data: "hello" }]),
            isHidden: false
        },
        {
            id: 2,
            input: JSON.stringify(["multi-event"]),
            expectedOutput: JSON.stringify([
                { event: "message", data: "first" },
                { event: "error", data: "oops" },
                { event: "message", data: "second" }
            ]),
            isHidden: false
        },
        {
            id: 3,
            input: JSON.stringify(["unsubscribe"]),
            expectedOutput: JSON.stringify([{ event: "message", data: "before" }]),
            isHidden: false
        },
        {
            id: 4,
            input: JSON.stringify(["multi-handler"]),
            expectedOutput: JSON.stringify({ count: 2 }),
            isHidden: true
        },
        {
            id: 5,
            input: JSON.stringify(["no-listeners"]),
            expectedOutput: JSON.stringify([]),
            isHidden: true
        }
    ]
};
