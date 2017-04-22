const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const writeFileAtomic = require('write-file-atomic');

const HOSTS = (() => {
  if (process.platform !== 'win32') return '/etc/hosts';

  return path.join(
    process.env.SystemRoot || path.join(process.env.SystemDrive || 'C:', 'Windows'),
    '/System32/drivers/etc/hosts'
  );
})();

function onlyOnce(cb) {
  let called = false;

  return (...args) => {
    if (!called) {
      called = true;
      cb(...args);
    }
  };
}

class HostsLine {
  constructor(line) {
    this.line = line;

    const commentIndex = line.indexOf('#');

    const content = (commentIndex === -1) ? line : line.slice(0, commentIndex);
    const comment = (commentIndex === -1) ? null : line.slice(commentIndex + 1);

    const hostList = content.trim().split(/\s+/);
    const ip = hostList.shift();

    if (hostList.length > 0) {
      Object.assign(this, { ip, hostList, comment });
    }
  }

  remove(host) {
    host = host.toLowerCase();

    const hostList = this.hostList.filter(h => h.toLowerCase() !== host);
    if (hostList.length > 0) {
      this.hostList = hostList;
    } else {
      this.ip = null;
      this.hostList = null;
    }

    this.line = null;
  }

  isEmpty() {
    return (this.line === null) && !this.ip && !this.hostList && !this.comment;
  }

  toString() {
    if (this.line !== null) {
      return this.line;
    }

    if (this.ip && this.hostList) {
      const comment = (this.comment ? ` #${this.comment}` : '');
      return `${this.ip} ${this.hostList.join(' ')}${comment}`;
    }

    if (this.comment) {
      return `#${this.comment}`;
    }

    return '';
  }
}

class HostsStore {
  constructor(lines = []) {
    this.lines = lines;
    this.map = new Map();

    for (const line of lines) {
      if (line.ip) {
        for (const host of line.hostList) {
          this.map.set(host.toLowerCase(), line);
        }
      }
    }
  }

  get(host) {
    host = host.toLowerCase();
    return this.map.has(host) && this.map.get(host).ip;
  }

  set(host, ip) {
    host = host.toLowerCase();

    if (this.map.has(host)) {
      const line = this.map.get(host);
      if (line.ip === ip) return;
      line.remove(host);
      this.map.delete(host);
    }

    if (ip) {
      const line = new HostsLine(`${ip} ${host}`);
      this.lines.push(line);
      this.map.set(host, line);
    }
  }

  remove(host) {
    this.set(host, null);
  }

  toString() {
    return (
      this.lines
        .filter(line => !line.isEmpty())
        .map(line => `${line}${os.EOL}`)
        .join('')
    );
  }
}

module.exports = {
  get defaultPath() {
    return HOSTS;
  },

  get(hostsPath, cb) {
    if (typeof hostsPath === 'function') {
      cb = hostsPath;
      hostsPath = HOSTS;
    }

    cb = onlyOnce(cb);

    const lines = [];

    const input = fs.createReadStream(hostsPath);
    const reader = readline.createInterface({ input });

    input.on('error', (err) => {
      if (err.code === 'ENOENT') {
        // file doesn't exist - equivalent to empty file
        cb(null, []);
      } else {
        // otherwise, let caller handle it
        cb(err);
      }
    });

    reader.on('line', (line) => {
      lines.push(new HostsLine(line));
    });

    reader.on('close', () => {
      cb(null, new HostsStore(lines));
    });
  },

  getSync(hostsPath) {
    try {
      return new HostsStore(
        fs.readFileSync(hostsPath || HOSTS, { encoding: 'utf8' })
          .replace(/\r?\n$/, '') // remove trailing newline
          .split(/\r?\n/)
          .map(line => new HostsLine(line))
      );
    } catch (e) {
      // ENOENT: file doesn't exist (equivalent to empty file)
      // if anything else, throw
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }

    return new HostsStore();
  },

  write(hostsPath, hostsStore, cb) {
    if (hostsPath instanceof HostsStore) {
      cb = hostsStore;
      hostsStore = hostsPath;
      hostsPath = HOSTS;
    }

    fs.stat(hostsPath, (err, stats) => {
      let mode = 33188; // 0100644 (regular file, rw-r--r--)

      if (err) {
        if (err.code !== 'ENOENT') {
          return cb(err);
        }
      } else if (!(stats.mode & 128)) { // 0200 (owner, write)
        const err = new Error('EACCES: Permission denied');
        err.code = 'EACCES';
        err.path = hostsPath;
        return cb(err);
      } else {
        mode = stats.mode;
      }

      writeFileAtomic(hostsPath, hostsStore.toString(), { mode }, cb);
    });
  },

  writeSync(hostsPath, hostsStore) {
    if (hostsPath instanceof HostsStore) {
      hostsStore = hostsPath;
      hostsPath = HOSTS;
    }

    let mode = 33188; // 0100644 (regular file, rw-r--r--)

    try {
      const stats = fs.statSync(hostsPath);

      if (!(stats.mode & 128)) { // 0200 (owner, write)
        const err = new Error('EACCES: Permission denied');
        err.code = 'EACCES';
        err.path = hostsPath;
        throw err;
      }

      mode = stats.mode;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }

    writeFileAtomic.sync(hostsPath, hostsStore.toString(), { mode });
  }
};
