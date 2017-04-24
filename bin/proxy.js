#!/usr/bin/env node

const fs = require('fs');
const net = require('net');
const path = require('path');

const BASE_PORT = 30000;

const regions = {
  EU: {
    sls: {
      hostname: 'web-sls.tera.gameforge.com',
      port: 4566,
      pathname: [
        '/servers/list.uk',
        '/servers/list.de',
        '/servers/list.fr',
      ],
    },
    listenHost: '127.0.0.2',
  },

  JP: {
    sls: 'http://tera.pmang.jp/game_launcher/server_list.xml',
    listenHost: '127.0.0.3',
  },

  KR: {
    sls: 'http://tera.nexon.com/launcher/sls/servers/list.xml',
    listenHost: '127.0.0.4',
  },

  NA: {
    sls: 'http://sls.service.enmasse.com:8080/servers/list.en',
    listenHost: '127.0.0.5',
  },

  RU: {
    sls: 'http://launcher.tera-online.ru/launcher/sls/',
    listenHost: '127.0.0.6',
  },

  TW: {
    sls: 'http://tera.mangot5.com/game/tera/serverList.xml',
    listenHost: '127.0.0.7',
  },
};

const errmsgs = {
  EACCES: `
*********************************
*                               *
*  FAILED TO WRITE HOSTS FILE!  *
*  ---------------------------  *
*     FILE SET TO READ-ONLY     *
*                               *
*********************************

Your hosts file seems to be set to read-only.
Find this file and make sure it's writable:
(Right-click, Properties, uncheck Read-only)

    {PATH}
`,

  EPERM: `
*********************************
*                               *
*  FAILED TO WRITE HOSTS FILE!  *
*  ---------------------------  *
*     RUN AS ADMINISTRATOR!     *
*                               *
*********************************

You don't have sufficient privileges to create or modify the hosts file.
Please try again by right-clicking and selecting "Run as administrator".
`,
};

function tryRequire(name) {
  try {
    return require(name);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return null;
    } else {
      throw err;
    }
  }
}

function* objectKeys(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      yield key;
    }
  }
}

function* objectValues(obj) {
  for (const key of objectKeys(obj)) {
    yield obj[key];
  }
}

function* objectIter(obj) {
  for (const key of objectKeys(obj)) {
    yield [key, obj[key]];
  }
}

function objectMap(obj, func) {
  return [...objectIter(obj)].map(func);
}

// -----------------------------------------------------------------------------

// parse args
const argv = (() => {
  const argparse = tryRequire('argparse');
  if (!argparse) {
    log.debug('"argparse" not installed; parsing command line standalone');

    for (const arg of process.argv.slice(2)) {
      if (!arg.startsWith('-')) {
        return { config: arg };
      }
    }

    return {};
  }

  const argParser = new argparse.ArgumentParser();

  const verbosity = new Set(['-2', '-1', '0', '1', '2', '3']);
  const levels = new Map([
    ['vvv', '3'],
    ['vv', '2'],
    ['v', '1'],
    ['q', '-1'],
    ['qq', '-2'],
  ]);

  argParser.addArgument(['-v', '--verbose'], {
    nargs: '?',
    constant: '1',
    defaultValue: null,
  });

  argParser.addArgument('-vv', { nargs: 0 });
  argParser.addArgument('-vvv', { nargs: 0 });
  argParser.addArgument('-q', { nargs: 0 });
  argParser.addArgument('-qq', { nargs: 0 });

  argParser.addArgument(['-c', '--color'], { nargs: 0 });
  argParser.addArgument('--no-color', { nargs: 0 });

  argParser.addArgument(['-r', '--raw'], { nargs: 0 });

  argParser.addArgument('config', { nargs: '?' });

  const parsed = argParser.parseArgs();

  if (parsed.get('v') && !parsed.get('config')) {
    const v = parsed.get('v');
    if (!/^-?\d+$/.test(v) && !verbosity.has(v)) {
      parsed.set('v', '1');
      parsed.set('config', v);
    }
  }

  for (const [flag, level] of levels) {
    if (flag !== 'v' && parsed.get(flag)) {
      parsed.set('v', level);
      break;
    }
  }

  const v = parsed.get('v');
  if (v != null && !verbosity.has(v)) {
    const values = [...verbosity.values()].join(', ');
    argParser.error(`argument "-v": Invalid choice: ${v} (choose from [${values}])`);
  }

  const color = (parsed.get('color') || parsed.get('no_color'))
    ? !!parsed.get('color')
    : null;

  return {
    v,
    color,
    config: parsed.get('config'),
  };
})();

// -----------------------------------------------------------------------------

// set up logger
const logger = require('baldera-logger');

const consoleLogger = logger.parent.streams.find(stream => stream.name === 'console');
if (consoleLogger) {
  const { stream } = consoleLogger;
  if (argv.v != null) stream.level = argv.v;
  if (argv.color != null) stream.colors = argv.color;
}

const logFilePath = path.join(__dirname, 'baldera.log');

logger.parent.addStream({
  name: 'file',
  stream: fs.createWriteStream(logFilePath),
  level: 'debug',
});

const log = logger('tera-proxy');

log.debug({ argv, argv_: process.argv }, 'startup');
log.debug({ logFilePath, consoleLogger }, 'logging');

// -----------------------------------------------------------------------------

// read configuration
const config = (() => {
  if (!argv.config) {
    return { regions: '*' };
  }

  const configPath = path.resolve(argv.config);
  const type = path.extname(configPath);
  log.info({ configPath, type }, 'loading config file');

  // .js
  if (type === '.js' || type === '.json') {
    try {
      return require(configPath);
    } catch (err) {
      log.error({ err }, 'error loading config file');
    }

    return null;
  }

  // otherwise,
  const data = (() => {
    try {
      return fs.readFileSync(configPath, 'utf8');
    } catch (err) {
      log.error({ err: err.message }, 'error reading config file');
    }
  })();

  // .yml / .yaml
  if (type === '.yml' || type === '.yaml') {
    const yaml = tryRequire('js-yaml');
    if (!yaml) {
      log.error('"js-yaml" not found; install it for yaml config support');
      return null;
    }

    try {
      return yaml.safeLoad(data, { filename: configPath });
    } catch (err) {
      if (err instanceof yaml.YAMLException) {
        log.error({ err: err.toString(), data }, 'error parsing YAML');
      } else {
        log.error({ err, data }, 'unknown error parsing YAML');
      }
    }

    return null;
  }

  // - ???
  log.error({ type }, 'unrecognized config type');
  return null;
})();

if (!config) {
  process.exitCode = 1;
  return;
}

log.info({ config }, argv.config
  ? 'successfully loaded config'
  : 'using default config'
);

// normalize servers
if (config.regions === '*') {
  config.regions = Object.keys(regions).map(region => ({ region }));
} else if (typeof config.regions !== 'object') {
  log.error('"regions" must be an object or "*"');
  process.exitCode = 1;
  return;
}

for (const [name, region] of objectIter(config.regions)) {
  config.regions[name] = Object.assign(
    // base defaults
    {
      listenHost: '127.0.0.1',
      servers: '*',
    },

    // region defaults
    regions[name],

    // provided options
    region,

    // application properties
    {
      slsProxy: null,
      httpsProxy: null,
      gameProxies: new Map(),
    }
  );
}

// -----------------------------------------------------------------------------

const SlsProxy = require('tera-proxy-sls');
const { Connection, RealClient } = require('tera-proxy-game');

// preload modules
const modules = (() => {
  const moduleDir = path.join(__dirname, 'node_modules');

  log.info({ dir: moduleDir }, 'searching for modules');

  try {
    return (
      fs.readdirSync(moduleDir)
        .filter(name => !name.startsWith('.') && !name.startsWith('_'))
    );
  } catch (err) {
    log.error({ err, dir: moduleDir }, 'error reading "node_modules" directory');
  }

  return null;
})();

if (!modules) {
  log.error('no modules to load; exiting');
  process.exitCode = 1;
  return;
}

log.info({ modules }, 'preloading modules');

for (const name of modules) {
  log.trace({ module: name }, 'preload');

  try {
    require(name);
  } catch (err) {
    log.error({ err, module: name }, 'failed to preload module');
  }
}

// set up sls proxies
for (const region of objectValues(config.regions)) {
  const { sls } = region;
  const opts = (typeof sls === 'string') ? { url: sls } : sls;
  region.slsProxy = new SlsProxy(opts);
}

// -----------------------------------------------------------------------------

// set hosts
// (done here for early bailout if writing fails)

if (config.noHostsEdit) {
  log.info('skipping hosts override');
} else {
  const hosts = require('../lib/hosts');
  const hostsPath = config.hostsPath || hosts.defaultPath;

  log.trace({ path: hostsPath }, 'checking hosts file');

  let hostsStore;

  try {
    hostsStore = hosts.getSync(hostsPath);
  } catch (err) {
    log.error({ err }, 'error reading hosts file');
    process.exitCode = 1;
    return;
  }

  const overrides = objectMap(config.regions, ([, region]) => ({
    from: region.slsProxy.host,
    to: region.listenHost,
  }));

  log.debug({ overrides }, 'settings hosts overrides');

  for (const { from, to } of overrides) {
    hostsStore.set(from, to);
  }

  try {
    hosts.writeSync(hostsPath, hostsStore);
  } catch (err) {
    log.error({ err }, 'error writing hosts file');

    const msg = errmsgs[err.code];
    if (msg) console.error(msg.replace('{PATH}', hostsPath));

    process.exitCode = 1;
    return;
  }

  log.info('successfully edited hosts file');

  process.on('exit', () => {
    for (const { from } of overrides) {
      hostsStore.remove(from);
    }

    try {
      hosts.writeSync(hostsPath, hostsStore);
    } catch (err) {
      log.error({ err }, 'error reverting hosts file');
      process.exitCode = 1;
    }
  });
}

//

(() => { // set up exit handling
  let closing = false;
  function cleanExit() {
    if (closing) return;
    closing = true;

    try {
      log.info('terminating...');
    } catch (err) {
    }

    for (const region of objectValues(config.regions)) {
      const { slsProxy, httpsProxy, gameProxies } = region;

      if (slsProxy) slsProxy.close();
      if (httpsProxy) httpsProxy.close();

      if (gameProxies) {
        for (const gameProxy of gameProxies.values()) {
          gameProxy.close();
        }
      }
    }
  }

  if (process.versions.electron) {
    require('electron').app.on('will-quit', cleanExit);
    return;
  }

  if (process.platform === 'win32') {
    process.stdin.resume();
  }

  function dirtyExit() {
    cleanExit();

    if (process.platform === 'win32') {
      process.stdin.end();
    }

    setTimeout(() => {
      process.exit();
    }, 5000).unref();
  }

  process.on('SIGHUP', dirtyExit);
  process.on('SIGINT', dirtyExit);
  process.on('SIGTERM', dirtyExit);
})();

// -----------------------------------------------------------------------------

function makeSlsProxy(region, data, cb) {
  const { slsProxy } = data;
  const all = (data.servers === '*');
  const servers = (!all ? data.servers : {});

  slsProxy.fetch((err, gameServers) => {
    if (err) return cb(err);

    log.debug({ region, gameServers }, 'retrieved official server list');

    if (all) {
      for (const id of objectKeys(gameServers)) {
        servers[id] = {};
      }
    }

    const result = new Map();

    for (const [id, server] of objectIter(servers)) {
      const target = gameServers[id];
      if (!target) {
        log.warn({ region, id }, 'server not found; skipping');
        continue;
      }

      const settings = Object.assign({
        connectHost: target.ip,
        connectPort: target.port,
        listenHost: data.listenHost,
        listenPort: BASE_PORT + parseInt(id, 10),
      }, servers[id]);

      slsProxy.customServers[id] = {
        ip: settings.listenHost,
        port: settings.listenPort,
      };

      result.set(id, settings);
    }

    cb(null, result);
  });
}

function makeServer(opts) {
  const server = net.createServer((socket) => {
    socket.setNoDelay(true);

    const connection = new Connection();
    const client = new RealClient(connection, socket);
    const srvConn = connection.connect(client, {
      host: opts.connectHost,
      port: opts.connectPort,
    });

    for (const name of modules) {
      connection.dispatch.load(name, module);
    }

    // logging
    const debugObj = o => Object.assign({}, o, {
      from: socketAddress(socket),
      to: socketAddress(srvConn),
    });

    socket.on('error', (err) => {
      log.error(debugObj({ err }), 'error in client socket');
    });

    srvConn.on('connect', () => {
      log.info(debugObj(), 'routing connection');
    });

    srvConn.on('error', (err) => {
      log.error(debugObj({ err }), 'error in server socket');
    });

    srvConn.on('close', () => {
      log.info(debugObj(), 'disconnected');
    });
  });

  server.listen(opts.listenPort, opts.listenHost);
  return server;
}

function socketAddress(socket) {
  return `${socket.remoteAddress}:${socket.remotePort}`;
}

function serverAddress(server) {
  const address = server.address();
  return `${address.address}:${address.port}`;
}

function makeHttpsProxy(server) {
  const host = server.slsProxy.address;
  const port = 443;

  log.debug({ host, port, server }, 'setting up https proxy');

  const httpsProxy = net.createServer((client) => {
    const socket = net.connect({ host, port });

    socket.on('error', (err) => {
      log.warn({ err }, 'error from outgoing proxied https connection');
    });

    client.on('error', (err) => {
      log.warn({ err }, 'error from incoming proxied https connection');
    });

    client.pipe(socket).pipe(client);
  });

  httpsProxy.on('error', (err) => {
    log.error({ err, server }, 'error setting up https proxy');
  });

  httpsProxy.listen(port, server.listenHost);

  return httpsProxy;
}

for (const [region, data] of objectIter(config.regions)) {
  makeSlsProxy(region, data, (err, res) => {
    if (err) {
      log.error({ region, data, err }, 'error setting up sls proxy');      
      return;
    }

    // sls proxy
    const { slsProxy, listenHost } = data;

    log.debug({ region, host: listenHost }, 'starting sls proxy servers');

    slsProxy.listen(listenHost, () => {
      log.info({ region, address: serverAddress(slsProxy.server) }, 'sls proxy server listening');
    });

    // https proxy
    if (region === 'JP' || region === 'KR' || region === 'TW') {
      const httpsProxy = makeHttpsProxy(s);

      httpsProxy.on('listening', () => {
        log.info({ region, address: serverAddress(httpsProxy) }, 'https proxy server listening');
      });

      data.httpsProxy = httpsProxy;
    }

    // game proxies
    for (const [id, settings] of res) {
      log.debug({ region, id, settings }, 'setting up game proxy');

      const gameProxy = makeServer(settings);

      gameProxy.on('listening', () => {
        log.info({ region, id, address: serverAddress(gameProxy) }, 'game proxy server listening');
      });

      data.gameProxies.set(id, gameProxy);
    }
  });
}
