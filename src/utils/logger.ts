const isDev = import.meta.env.DEV;

type LogLevel = "error" | "warn" | "info" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  userAgent?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  // Returns a static log prefix that does not include untrusted message content
  private formatMessage(level: LogLevel): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return prefix;
  }

  private addLog(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  error(message: string, data?: any) {
    this.addLog("error", message, data);

    if (isDev) {
      console.error(this.formatMessage("error"), message, data);
    } else {
      console.error(message);
    }
  }

  warn(message: string, data?: any) {
    this.addLog("warn", message, data);

    if (isDev) {
      console.warn(this.formatMessage("warn"), message, data);
    }
  }

  info(message: string, data?: any) {
    this.addLog("info", message, data);

    if (isDev) {
      console.log(this.formatMessage("info"), message, data);
    }
  }

  debug(message: string, data?: any) {
    this.addLog("debug", message, data);

    if (isDev) {
      console.debug(this.formatMessage("debug"), message, data);
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
