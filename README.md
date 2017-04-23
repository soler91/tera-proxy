# tera-proxy

Easy script modding through modular network-based hooks.

Website: <https://meishuu.github.io/tera-proxy/>

Discord: [![Discord](https://discordapp.com/api/guilds/281214121280798731/widget.png)](https://discord.gg/D2BCbgq)

**Just here for a download? Go to the [website](https://meishuu.github.io/tera-proxy/) for instructions. Prepackaged downloads are on the [releases](https://github.com/meishuu/tera-proxy/releases) page.**

Developers, read on.

## Installation

First, install [Node.js](https://nodejs.org/) (preferably the latest, but any version that's at least 6.0.0 should be fine). Then run:

    $ npm install meishuu/tera-proxy --only=production

If you know what you're doing with `npm`, a `--global` install is supported.

For an even smaller install, you can also add `--no-optional` with the following effects:
* YAML configuration will no longer be supported
* Command line flags (verbosity, colors, raw log output, etc.) will no longer be supported
* The installed [`bunyan`](https://github.com/trentm/node-bunyan) will probably not have proper output

## Configuration

`tera-proxy` supports an optional configuration file. Check `bin/config-sample.yml` for a detailed explanation of all settings.

If you just want to proxy all servers on one region (such as NA), here's a short `config.yml` you could use:

```yml
regions:
  NA: "*"
```

## Usage

Running the proxy is simple:

    $ node proxy.js

If hosts editing is enabled (which is the default), you will need to be running as administrator. The proxy will load all modules in `bin/node_modules` as long as the module's name does not begin with either a period (`.`) or underscore (`_`).

You can also provide a configuration file:

    $ node proxy.js config.yml

You can also add `-v`, `-vv`, or `-vvv` to make the console output more information. Alternatively, pass `-q` or `-qq` to make it output *less*. These correspond to setting `BALDERA_DEBUG_LEVEL` used by [`baldera-logger`](https://github.com/meishuu/baldera-logger).

If colors aren't working, you can use `-c` or `--color` to force them on, or `--no-color` to disable them.

If you want to pipe to [`bunyan`](https://github.com/trentm/node-bunyan), use the `-r` or `--raw` flag to force `bunyan`-compatible output.
