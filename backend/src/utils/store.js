const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

/**
 * Minimal file-backed JSON store.
 * Not meant for high concurrency production use, but keeps the
 * assignment stateless-friendly while still persisting data
 * between server restarts (users, imported leads).
 */
class JsonStore {
  constructor(name, defaultValue = []) {
    this.name = name;
    this.path = filePath(name);
    this.defaultValue = defaultValue;
    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify(defaultValue, null, 2));
    }
  }

  read() {
    try {
      const raw = fs.readFileSync(this.path, "utf-8");
      return JSON.parse(raw || "null") ?? this.defaultValue;
    } catch (err) {
      return this.defaultValue;
    }
  }

  write(data) {
    fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
    return data;
  }

  push(item) {
    const data = this.read();
    data.push(item);
    this.write(data);
    return item;
  }

  pushMany(items) {
    const data = this.read();
    data.push(...items);
    this.write(data);
    return items;
  }

  find(predicate) {
    return this.read().find(predicate);
  }

  filter(predicate) {
    return this.read().filter(predicate);
  }
}

module.exports = { JsonStore, DATA_DIR };
