
// Logger Utility (Mock)
export class LoggerService {
    constructor() {
        this.logs = [];
    }

    log(level, message, data = null) {
        const entry = {
            timestamp: Date.now(),
            level,
            message,
            data
        };
        this.logs.push(entry);
        console.log(`[${level.toUpperCase()}] ${message}`, data || '');

        // Keep logs manageable
        if (this.logs.length > 200) {
            this.logs.shift();
        }

        // Optional: Save to localStorage for persistence across reloads (dev convenience)
        // localStorage.setItem('hb-logs', JSON.stringify(this.logs));
    }

    info(message, data) {
        this.log('info', message, data);
    }

    warn(message, data) {
        this.log('warn', message, data);
    }

    error(message, error, data) {
        this.log('error', message, { error, ...data });
    }

    getLogs(filter = null, limit = 100) {
        let filtered = this.logs;
        if (filter) {
            filtered = filtered.filter(l => l.level === filter || l.message.includes(filter));
        }
        return filtered.slice(-limit);
    }

    clearLogs() {
        this.logs = [];
    }
}

export const Logger = new LoggerService();
