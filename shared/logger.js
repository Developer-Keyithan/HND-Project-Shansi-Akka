// Logging System for Developers

class Logger {
    constructor() {
        this.config = window.Config?.logging || {};
        this.logs = [];
        this.maxLogs = 1000;
    }

    // Get device information
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            referrer: document.referrer
        };
    }

    // Get user information
    getUserInfo() {
        const user = window.Auth?.getCurrentUser();
        return user ? {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        } : null;
    }

    // Create log entry
    createLogEntry(level, message, data = {}) {
        const logEntry = {
            id: Date.now() + Math.random(),
            level,
            message,
            data,
            device: this.getDeviceInfo(),
            user: this.getUserInfo(),
            timestamp: new Date().toISOString()
        };

        this.logs.push(logEntry);

        // Keep only last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        return logEntry;
    }

    // Log info
    info(message, data = {}) {
        const logEntry = this.createLogEntry('info', message, data);
        console.log(`[INFO] ${message}`, data);
        this.sendToServer(logEntry);
        return logEntry;
    }

    // Log warning
    warn(message, data = {}) {
        const logEntry = this.createLogEntry('warn', message, data);
        console.warn(`[WARN] ${message}`, data);
        this.sendToServer(logEntry);
        return logEntry;
    }

    // Log error
    error(message, error = null, data = {}) {
        const errorData = {
            ...data,
            error: error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : null
        };

        const logEntry = this.createLogEntry('error', message, errorData);
        console.error(`[ERROR] ${message}`, errorData);
        this.sendToServer(logEntry);
        return logEntry;
    }

    // Log debug
    debug(message, data = {}) {
        const logEntry = this.createLogEntry('debug', message, data);
        console.debug(`[DEBUG] ${message}`, data);
        this.sendToServer(logEntry);
        return logEntry;
    }

    // Send log to server
    async sendToServer(logEntry) {
        if (!this.config.enabled) return;

        try {
            await fetch(this.config.apiEndpoint || '/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logEntry)
            });
        } catch (error) {
            console.error('Failed to send log to server:', error);
        }
    }

    // Get logs
    getLogs(level = null, limit = 100) {
        let filteredLogs = this.logs;

        if (level) {
            filteredLogs = filteredLogs.filter(log => log.level === level);
        }

        return filteredLogs.slice(-limit);
    }

    // Clear logs
    clearLogs() {
        this.logs = [];
    }

    // Export logs
    exportLogs(format = 'json') {
        const logs = this.getLogs();
        
        if (format === 'json') {
            return JSON.stringify(logs, null, 2);
        } else if (format === 'csv') {
            const headers = ['Timestamp', 'Level', 'Message', 'User', 'URL'];
            const rows = logs.map(log => [
                log.timestamp,
                log.level,
                log.message,
                log.user?.email || 'Anonymous',
                log.device.url
            ]);
            
            return [headers, ...rows].map(row => row.join(',')).join('\n');
        }
    }
}

// Initialize Logger
window.Logger = new Logger();

// Log page load
window.addEventListener('load', () => {
    window.Logger.info('Page loaded', {
        page: window.location.pathname,
        title: document.title
    });
});

// Log errors
window.addEventListener('error', (event) => {
    window.Logger.error('JavaScript error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// Log unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    window.Logger.error('Unhandled promise rejection', event.reason, {
        promise: event.promise
    });
});


