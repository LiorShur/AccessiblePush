/**
 * Access Nature - Centralized Debug Logging Utility
 *
 * Provides log level filtering and conditional logging based on environment.
 * In production, only errors and warnings are shown.
 * In development, all log levels are available.
 *
 * Usage:
 *   import { logger } from './utils/logger.js';
 *
 *   logger.debug('Detailed info');     // Only in dev mode
 *   logger.info('General info');       // Only in dev mode
 *   logger.warn('Warning message');    // Always shown
 *   logger.error('Error message');     // Always shown
 *   logger.group('Group name');        // Console grouping
 *   logger.groupEnd();
 */

import { FEATURES } from '../config/appConfig.js';

// Log levels (higher = more severe)
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// Determine environment
const isProduction = typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  !window.location.hostname.includes('127.0.0.1');

// Set minimum log level based on environment
// In production: only WARN and ERROR
// In development: all logs if VERBOSE_LOGGING is enabled
const getMinLogLevel = () => {
  if (isProduction) {
    return LOG_LEVELS.WARN;
  }
  // In dev, check if verbose logging is enabled
  if (FEATURES?.VERBOSE_LOGGING) {
    return LOG_LEVELS.DEBUG;
  }
  // Default dev behavior: INFO and above
  return LOG_LEVELS.INFO;
};

let currentLogLevel = getMinLogLevel();

/**
 * Format log prefix with timestamp and optional module name
 */
function formatPrefix(level, module = '') {
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const moduleStr = module ? `[${module}]` : '';
  return `[${timestamp}]${moduleStr}`;
}

/**
 * Check if logging is enabled for a given level
 */
function shouldLog(level) {
  return level >= currentLogLevel;
}

/**
 * Main logger object
 */
const logger = {
  /**
   * Debug level - detailed information for debugging
   * Only shown in development with VERBOSE_LOGGING enabled
   */
  debug(message, ...args) {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(`%c${formatPrefix('DEBUG')} ${message}`, 'color: #6b7280', ...args);
    }
  },

  /**
   * Info level - general informational messages
   * Only shown in development
   */
  info(message, ...args) {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.log(`${formatPrefix('INFO')} ${message}`, ...args);
    }
  },

  /**
   * Warning level - potential issues that don't stop execution
   * Always shown
   */
  warn(message, ...args) {
    if (shouldLog(LOG_LEVELS.WARN)) {
      console.warn(`${formatPrefix('WARN')} ${message}`, ...args);
    }
    // Also send to error monitoring in production
    if (isProduction && window.errorMonitor) {
      window.errorMonitor.captureMessage(message, 'warning');
    }
  },

  /**
   * Error level - errors that need attention
   * Always shown, and sent to error monitoring
   */
  error(message, errorOrArgs, ...args) {
    if (shouldLog(LOG_LEVELS.ERROR)) {
      console.error(`${formatPrefix('ERROR')} ${message}`, errorOrArgs, ...args);
    }
    // Send to error monitoring
    if (window.errorMonitor) {
      if (errorOrArgs instanceof Error) {
        window.errorMonitor.captureException(errorOrArgs, { message });
      } else {
        window.errorMonitor.captureMessage(message, 'error');
      }
    }
  },

  /**
   * Console group (for organizing related logs)
   * Only shown in development
   */
  group(label) {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.group(label);
    }
  },

  /**
   * End console group
   */
  groupEnd() {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.groupEnd();
    }
  },

  /**
   * Collapsed group (for less important groupings)
   */
  groupCollapsed(label) {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.groupCollapsed(label);
    }
  },

  /**
   * Table output for structured data
   * Only shown in development
   */
  table(data) {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.table(data);
    }
  },

  /**
   * Set the minimum log level
   */
  setLevel(level) {
    if (LOG_LEVELS[level] !== undefined) {
      currentLogLevel = LOG_LEVELS[level];
    }
  },

  /**
   * Get current log level
   */
  getLevel() {
    return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === currentLogLevel);
  },

  /**
   * Check if running in production
   */
  isProduction() {
    return isProduction;
  },

  /**
   * Create a scoped logger for a specific module
   * Usage: const log = logger.createScoped('Auth');
   *        log.info('User logged in');  // Output: [12:34:56][Auth] User logged in
   */
  createScoped(moduleName) {
    return {
      debug: (message, ...args) => {
        if (shouldLog(LOG_LEVELS.DEBUG)) {
          console.log(`%c${formatPrefix('DEBUG', moduleName)} ${message}`, 'color: #6b7280', ...args);
        }
      },
      info: (message, ...args) => {
        if (shouldLog(LOG_LEVELS.INFO)) {
          console.log(`${formatPrefix('INFO', moduleName)} ${message}`, ...args);
        }
      },
      warn: (message, ...args) => {
        if (shouldLog(LOG_LEVELS.WARN)) {
          console.warn(`${formatPrefix('WARN', moduleName)} ${message}`, ...args);
        }
        if (isProduction && window.errorMonitor) {
          window.errorMonitor.captureMessage(`[${moduleName}] ${message}`, 'warning');
        }
      },
      error: (message, errorOrArgs, ...args) => {
        if (shouldLog(LOG_LEVELS.ERROR)) {
          console.error(`${formatPrefix('ERROR', moduleName)} ${message}`, errorOrArgs, ...args);
        }
        if (window.errorMonitor) {
          if (errorOrArgs instanceof Error) {
            window.errorMonitor.captureException(errorOrArgs, { module: moduleName, message });
          } else {
            window.errorMonitor.captureMessage(`[${moduleName}] ${message}`, 'error');
          }
        }
      }
    };
  }
};

// Export log levels for external use
export { LOG_LEVELS };

// Export main logger
export { logger };

// Default export
export default logger;
