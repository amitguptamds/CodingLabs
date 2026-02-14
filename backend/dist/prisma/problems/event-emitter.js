"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventEmitter = void 0;
exports.eventEmitter = {
    id: 'event-emitter',
    title: 'Event Emitter',
    description: 'Build a custom **Event Emitter** system across multiple files.\n\nImplement an `EventEmitter` class that supports subscribing to events, emitting events with data, and unsubscribing handlers. Then create a `Logger` class that uses the emitter, and wire everything together in `index.js`.',
    difficulty: 'Medium',
    tags: ['Design Pattern', 'OOP', 'Multi-File'],
    isMultiFile: true,
    boilerplateCode: '// Multi-file problem — edit all files in the editor.',
    solutionTemplate: 'createSystem',
    templateFiles: [
        {
            name: 'eventEmitter.js',
            path: 'src/eventEmitter.js',
            language: 'javascript',
            content: '/**\n * EventEmitter class\n * Supports: on(event, handler), emit(event, ...args), off(event, handler)\n */\nclass EventEmitter {\n  constructor() {\n    // Initialize your event storage here\n  }\n\n  on(event, handler) {\n    // Subscribe a handler to an event\n  }\n\n  emit(event, ...args) {\n    // Emit an event, calling all registered handlers\n  }\n\n  off(event, handler) {\n    // Remove a specific handler from an event\n  }\n}\n',
        },
        {
            name: 'logger.js',
            path: 'src/logger.js',
            language: 'javascript',
            content: '/**\n * Logger class that subscribes to EventEmitter events\n * and records a log of all events received.\n */\nclass Logger {\n  constructor(emitter) {\n    // Store reference to emitter and initialize log array\n  }\n\n  subscribe(eventName) {\n    // Subscribe to an event and log all received data\n  }\n\n  getLogs() {\n    // Return array of log entries: { event, data, timestamp }\n  }\n}\n',
        },
        {
            name: 'index.js',
            path: 'src/index.js',
            language: 'javascript',
            content: '/**\n * Wire the EventEmitter and Logger together.\n * createSystem() returns { emitter, logger, emit, getLogs }\n */\nfunction createSystem() {\n  // Create an EventEmitter and Logger\n  // Subscribe logger to "message" and "error" events\n  // Return an object with: emitter, logger, emit(event, data), getLogs()\n}\n',
        },
    ],
    testCases: [
        { id: 1, input: JSON.stringify(['basic-emit']), expectedOutput: JSON.stringify([{ event: 'message', data: 'hello' }]), isHidden: false },
        { id: 2, input: JSON.stringify(['multi-event']), expectedOutput: JSON.stringify([{ event: 'message', data: 'first' }, { event: 'error', data: 'oops' }, { event: 'message', data: 'second' }]), isHidden: false },
        { id: 3, input: JSON.stringify(['unsubscribe']), expectedOutput: JSON.stringify([{ event: 'message', data: 'before' }]), isHidden: false },
        { id: 4, input: JSON.stringify(['multi-handler']), expectedOutput: JSON.stringify({ count: 2 }), isHidden: true },
        { id: 5, input: JSON.stringify(['no-listeners']), expectedOutput: JSON.stringify([]), isHidden: true },
    ],
    examples: [
        { input: 'emit("message", "hello")', output: '[{event: "message", data: "hello"}]', explanation: 'Emitting a "message" event should be captured by the logger.' },
    ],
    constraints: [
        'EventEmitter must support multiple handlers per event',
        'off() should only remove the specific handler passed',
        'emit() should call handlers in registration order',
    ],
};
//# sourceMappingURL=event-emitter.js.map