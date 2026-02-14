/**
 * Logger class that subscribes to EventEmitter events
 * and records a log of all events received.
 */
class Logger {
    constructor(emitter) {
        this.emitter = emitter;
        this.logs = [];
    }

    subscribe(eventName) {
        this.emitter.on(eventName, (data) => {
            this.logs.push({
                event: eventName,
                data,
                timestamp: new Date()
            });
        });
    }

    getLogs() {
        return this.logs;
    }
}

module.exports = Logger;
