class Logger {
  constructor(storageKey) {
    this.storageKey = storageKey;
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  // Get all logs
  getLogs() {
    return JSON.parse(localStorage.getItem(this.storageKey));
  }

  // Add a new log
  addLog(log) {
    const logs = this.getLogs();
    logs.push(log);
    localStorage.setItem(this.storageKey, JSON.stringify(logs));
  }

  // Edit a log by index
  editLog(index, newLog) {
    const logs = this.getLogs();
    if (index >= 0 && index < logs.length) {
      logs[index] = newLog;
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } else {
      throw new Error("Index out of bounds");
    }
  }

  // Delete a log by index
  deleteLog(index) {
    const logs = this.getLogs();
    if (index >= 0 && index < logs.length) {
      logs.splice(index, 1);
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } else {
      throw new Error("Index out of bounds");
    }
  }

  // Clear all logs
  clearLogs() {
    localStorage.setItem(this.storageKey, JSON.stringify([]));
  }
}

export default Logger;
// // Usage example
// const logger = new Logger("appLogs");

// logger.addLog({ message: "This is a log message", timestamp: new Date() });
// console.log(logger.getLogs());

// logger.editLog(0, {
//   message: "This is an edited log message",
//   timestamp: new Date(),
// });
// console.log(logger.getLogs());

// logger.deleteLog(0);
// console.log(logger.getLogs());

// logger.clearLogs();
// console.log(logger.getLogs());
