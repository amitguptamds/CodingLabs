const EventEmitter = require('./eventEmitter');
const Logger = require('./logger');

/**
 * Wire the EventEmitter and Logger together.
 * createSystem() returns { emitter, logger, emit, getLogs }
 */
function createSystem() {
    const emitter = new EventEmitter();
    const logger = new Logger(emitter);

    // Subscribe logger to required events
    logger.subscribe('message');
    logger.subscribe('error');

    return {
        emitter,
        logger,
        emit(event, data) {
            emitter.emit(event, data);
        },
        getLogs() {
            return logger.getLogs();
        }
    };
}

module.exports = { createSystem };
