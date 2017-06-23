---
permalink: /modules
title: Module Directory
classes: page--modules

categories:
- header: Skill Predictors
  description: "Simulates skills client-side so you can evade taxes of the ping variety."
  modules:
  - repo: pinkipi/skill-prediction
    desc: The big one. Supports most skills.
  - repo: baldera-mods/fast-fire
    author: meishuu
    desc: Just Rapid Fire, Burning Heart, and Burst Fire.
  - repo: baldera-mods/lockons
    author: meishuu
    desc: Just lockons. Exactly what it says on the tin.
- header: Notable Modules
  description: "The big guns. These modules are more than simple scripts."
  modules:
  - repo: wuaw/battle-notify
    desc: Shows text notifications on configurable in-game events.
- header: Quality of Life
  description: "These modules are relatively benign, and there's likely little risk to using these. But they *will* make your life better, probably."
  modules:
  - repo: TeraProxy/AFKer
    desc: Prevents the client from going back to character selection.
  - repo: baldera-mods/autovanguard
    author: meishuu
    desc: Automatically turns in Vanguard quests upon completion.
  - repo: teralove/camera-distance
    desc: Removes limit on the camera's max range.
  - repo: teralove/channel-command
    desc: Switch channels via chat command.
  - repo: teralove/disable-ghillieglade-scroll
    desc: Makes clicking on the scroll do nothing. Use a chat command instead.
  - repo: TeraProxy/emo
    desc: Reuses your last used emote when it gets interrupted.
  - repo: TeraProxy/EnrageNotifier
    desc: Shows private party notices for enrage and next enrage percentage.
  - repo: teralove/exit-command
    desc: Exit the game via chat command.
  - repo: teralove/exit-instantly
    desc: Exit the game without having to wait 10 seconds. (Basically clicking the X button.)
  - repo: teralove/healer-debuffs
    desc: Sends notifications to yourself or party when Hurricane and Contagion have been applied.
  - repo: teralove/hurricane-cooldown
    desc: Sends notifications to yourself on hurricane proc, cooldown time, and when it's ready again.
  - repo: teralove/lobby-command
    desc: Return to lobby (character select) via chat command.
  - repo: teralove/no-directional-skills
    desc: Removes directional input on some skills.
  - repo: Mister-Kay/no-more-command-typos
    desc: Prevents submitting accidental typos for other modules' "!" prefixed commands.
  - repo: Mister-Kay/no-more-crazy-capes
    desc: Removes exploding physics glitch from some back items.
  - repo: teralove/parcel-helper
    desc: Instantly accept all parcels and delete all read messages.
  - repo: teralove/party-death-markers
    desc: Shows rare item beacon on party member corpses.
  - repo: wuaw/relog
    desc: Switch character via chat command.
  - repo: teralove/remove-idles
    desc: Disable idle animations.
  - repo: eemj/skill-resets
    desc: Pops up a message whenever a skill resets.
  - repo: baldera-mods/skip-cutscenes
    author: meishuu
    desc: No more mashing Esc after killing a boss. Pretend cutscenes don't even exist.
  - repo: wuaw/timestamps
    desc: Shows timestamps in chat.
  - repo: soler91/AfkRewards
    desc: Accepts Allegiance event rewards automatically.
  - repo: soler91/NameChanger
    desc: Changes your name and title clientside.
- header: The Questionable Ones
  description: "Where the line starts getting blurred. If you use these and it gets noticed... Well, no promises."
  modules:
  - repo: pinkipi/auto-negotiate
    desc: Automatically accepts or declines broker negotiations. Configurable.
  - repo: TeraProxy/AutoNostrum
    desc: Automatically uses Everful Nostrum from Elite bar after a rez.
  - repo: wuaw/broker-anywhere
    desc: Open the broker. Anywhere.
  - repo: TeraProxy/Cosplayer
    desc: Wear anything anywhere (clientside).
  - repo: TeraProxy/Essentials
    desc: Automatically uses Elite Everful Nostrum and Complete Crystalbind.
  - repo: wuaw/hide-players
    desc: Hide players via chat command.
  - repo: TeraProxy/ManaPotter
    desc: Automatically uses a Prime Replenishment Potable when under 50% MP.
  - repo: TeraProxy/Teabagger
    desc: but rly tho?
  - repo: Bernkastel-0/costume-ex
    desc: Allows wearing anything client-sided through UI selection.
  - repo: Bernkastel-0/zfps-standard
    desc: Allows toggling off other players and abilities to improve FPS.
  - repo: Saegusae/loot
    desc: Automatically loots items in a radius upon pressing F on an item.
  - repo: Saegusae/fps-utils
    desc: A compilation of utilities to improve fps, includes disabling fireworks effects.
  - repo: Saegusae/fly-more
    desc: Ignores flying mount stamina for infinite flying.
  - repo: soler91/CustomMounts
    desc: Use any mount (Clientside).
---

Here is a directory with links to a number of GitHub projects and developers who work with tera-proxy or other TERA modding programs. That means **all projects directly linked here are free and open source**.

If you want to be added to this list, or you think a module has been miscategorized, [submit a PR](https://github.com/meishuu/tera-proxy/edit/gh-pages/_pages/modules.md).

{% for category in page.categories %}
{% assign names = "" | split: "" | where_exp: "item", "false" %}
{% for module in category.modules %}
{% assign repo = module.repo | split: "/" | last | downcase %}
{% assign names = names | push: repo %}
{% endfor %}
{% assign names = names | uniq | sort %}

## {{ category.header }}

{{ category.description }}

| Module | Description |
| --- | --- |{% for name in names %}{% for module in category.modules %}{% assign repo = module.repo | split: "/" %}{% assign test = repo | last | downcase %}{% if test != name %}{% continue %}{% endif %}{% assign user = module.author %}{% unless user %}{% assign user = repo[0] %}{% endunless %}
| [{% avatar user=user %}][@{{ user }}] [{{ repo[1] }}](https://github.com/{{ module.repo }}) | {{ module.desc }} |{% endfor %}{% endfor %}

{% endfor %}

## Module Developers

For any other kind of module, you may want to take a look at public repositories or websites. Below is a list of module developers on GitHub, along with links to other sources where you may find more information or modules not publicly posted.

* [{% avatar baldera-mods %} baldera-mods][@baldera-mods] &ndash; [{% avatar meishuu %} meishuu][@meishuu]'s mods
* [{% avatar Bernkastel-0 %} Bernkastel-0][@Bernkastel-0] &ndash; [tumblr](http://teraproxy.tumblr.com/)
* [{% avatar eemj %} eemj][@eemj]
* [{% avatar pinkipi %} pinkipi][@pinkipi] &ndash; [Discord](https://discord.gg/RR9zf85)
* [{% avatar Saegusae %} Saegusae][@Saegusae]
* [{% avatar soler91 %} soler91][@soler91]
* [{% avatar teralove %} teralove][@teralove]
* [{% avatar TeraProxy %} TeraProxy][@TeraProxy]
* [{% avatar wuaw %} wuaw][@wuaw]

## Related Projects

tera-proxy is just one of many projects aimed at modding and extending TERA functionality. These related projects are not modules; they are standalone programs that do their own thing with or without tera-proxy.

* [Alkahest](https://github.com/alexrp/alkahest) ([@alexrp]): An extensible .NET proxy server with additional tools for accessing game client data.
* [CasualMeter](https://github.com/lunyx/CasualMeter) ([@lunyx]): A TERA DPS meter.
* [ShinraMeter](https://github.com/neowutran/ShinraMeter) ([@neowutran], [@Gl0]): A TERA DPS meter.
* [Tera Custom Cooldowns](https://github.com/Foglio1024/Tera-custom-cooldowns) ([@Foglio1024]): Replaces some TERA UI elements with sleek and responsive designs.



[//]: # (GitHub @mention link references go below.)

[@alexrp]: <https://github.com/alexrp> "Alex Rønne Petersen"
[@baldera-mods]: <https://github.com/baldera-mods> "Meishu's Baldera Mods"
[@Bernkastel-0]: <https://github.com/Bernkastel-0> "Bernkastel"
[@eemj]: <https://github.com/eemj> "Jamie"
[@Foglio1024]: <https://github.com/Foglio1024> "Foglio"
[@Gl0]: <https://github.com/Gl0> "Gl0"
[@lunyx]: <https://github.com/lunyx> "Daniel"
[@meishuu]: <https://github.com/meishuu> "Meishu"
[@Mister-Kay]: <https://github.com/mister-kay>
[@neowutran]: <https://github.com/neowutran> "Yukikoo"
[@pinkipi]: <https://github.com/pinkipi> "Pinkie Pie"
[@Saegusae]: <http://github.com/saegusae> "Seagoose"
[@soler91]: <http://github.com/soler91> "Fruit"
[@teralove]: <https://github.com/teralove>
[@TeraProxy]: <https://github.com/TeraProxy>
[@wuaw]: <https://github.com/wuaw>
