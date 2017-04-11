`tera-proxy` is an open source framework for modding TERA through scripts.

If you just want to use the thing, keep reading. For developers, have a look at the [developer documentation](developers).

We also have a Discord for help and updates: <https://discord.gg/D2BCbgq>

## Installation

**Note:** `tera-proxy` and its data files are updated constantly, and there's currently no GUI nor autoupdater. Additionally, only NA TERA is openly supported at the moment, though if you change the right files or ask the right people how, you can get it working for other regions as well (see developer docs if you feel like tinkering around).

### Step 1: Download `tera-proxy`

The most convenient way for most users will be to download the latest ZIP from the [releases](https://github.com/meishuu/tera-proxy/releases) page. Go ahead and extract it anywhere that's convenient for you.

### Step 2: Download modules

`tera-proxy` does very little on its own. If you want something done, find (or make!) a module for it.

Let's say you'd like to install [autovanguard](https://github.com/baldera-mods/autovanguard) so you never forget to turn in a Vanguard quest ever again. Since there are no prepackaged releases, you can click the green "Clone or download" button and click on "Download ZIP". Extract it anywhere convenient and you should have a folder called `autovanguard-master` with three files in it.

Over in your `tera-proxy` installation, go and make a folder at: `tera-proxy/bin/node_modules/autovanguard` and then put the three files in there. You're done!

For the vast majority of standalone modules, you *should* have a file in at least one of the following places:

- `tera-proxy/bin/node_modules/<module_name>/index.js` (most common)
- `tera-proxy/bin/node_modules/<module_name>/package.json`

If neither of those exist, you might have an extra folder and should try moving things up.

**If you have an existing installation of `tera-proxy`,** you can simply copy over your old `tera-proxy/bin/node_modules`.

### Step 3: Run `tera-proxy`

In the provided `tera-proxy` download, there should be a file called `run.bat`. Right-click it, select "Run as administrator", and you're set.

If you got `tera-proxy` from anywhere else and there is no `run.bat`, follow their instructions. If you didn't get instructions or forgot them, you're on your own.

### Step 4: Connect to `tera-proxy`

`tera-proxy` modifies the server list and adds custom entries that point to itself, which it then forwards to the real server.

If TERA is already closed when you launch `tera-proxy`, you can just start up the game and it'll work just fine.

If you are already in TERA, you must at least back out to the server select screen *after launching `tera-proxy`*. Exiting the game is sufficient as well.

### Step 5: Enjoy!

You're set! Go have fun with your fancy new modules.

## FAQ

#### How do I add my server? (TR/AV/FF)

[...]

#### How do I make this work on other regions?

[...]

#### There was a TERA patch and the proxy broke!

[...]
