/**
 * EventEmitter class
 * Supports: on(event, handler), emit(event, ...args), off(event, handler)
 */
class EventEmitter {
    constructor() {
        // Store events as: { eventName: [handler1, handler2] }
        this._events = {};
    }

    off(event, handler) {
        if (!this.events[event]) return;

        // Remove only the specific handler
        this.events[event] = this._events[event].filter(
            h => h !== handler
        );

        // Optional: clean up empty event arrays
        if (this.events[event].length === 0) {
            delete this._events[event];
        }
    }
}

module.exports = EventEmitter;
