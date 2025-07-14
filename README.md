# Resource Manager for Minecraft (MCR) 📦

**Resource Manager for Minecraft (MCR)** is an advanced CLI tool for setup and manage Minecraft Instances and Servers and publishing your Resources. Possibilities of
this tool is much higher than managing big and complex Modpacks and Servers.

## Introduction

> ![WARNING]
> MCR is now at the very beginning (EXPERIMENTAL) stage.
> experimental versions are available on npm to be installed.
> consider to specify the version when installing mcr.
> we ask Developers to help the project. Pull Requests are welcome.

Some of the Features are:

- Advanced CLI Intercations
- Version Control
- ...

## Installing 

mcr requires [Node.js](https://nodejs.org/) and `npm` to be installed on your system, to install mcr you can get the cli package with:
```bash
npm i -g @mc-resource/cli
```

### Loader Support

Currently, mcr Support for Loaders is defined as below:

<table>
    <thead>
    <tr>
        <th>Loaders</th>
        <th>Resources</th>
        <th>Registry/Method</th>
        <th>Supported</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td rowspan="2">Vanilla (Base)</td>
        <td>Resource Packs and Shader Packs</td>
        <td><a href="https://modrinth.com">Modrinth</a></td>
        <td>✅ (Experimental)</td>
    </tr>
    <tr>
        <td>Worlds, Versions, Data Packs, etc.</td>
        <td>-</td>
        <td>🚧 (Planned)</td>
    </tr>
    <tr>
        <td rowspan="3">Server Modifier Loaders (Spigot, Bukkit, Paper, etc.)</td>
        <td>Plugins</td>
        <td><a href="https://modrinth.com">Modrinth</a></td>
        <td>✅ (Experimental)</td>
    </tr>
    <tr>
        <td>Plugin Dependencies</td>
        <td><a href="https://modrinth.com">Modrinth</a></td>
        <td>🚧 (Planned)</td>
    </tr>
    <tr>
        <td>Resource Config, Server JAR, etc.</td>
        <td>-</td>
        <td>🚧 (Planned)</td>
    </tr>
    <tr>
        <td rowspan="3">Mod Loaders (Forge, Fabric, Neoforge, Quilt, etc.)</td>
        <td>Mods</td>
        <td><a href="https://modrinth.com">Modrinth</a></td>
        <td>✅ (Experimental)</td>
    </tr>
    <tr>
        <td>Mod Dependencies</td>
        <td><a href="https://modrinth.com">Modrinth</a></td>
        <td>🚧 (Planned)</td>
    </tr>
    <tr>
        <td>Modpacks</td>
        <td>-</td>
        <td>❌ (Planned for Long-term)</td>
    </tr>
    </tbody>
</table>

## Usage

mcpm Command-Line Interface (CLI) is accessible using Terminal to interact with resources in the Path.
the Shortcut is `mcr`.

## Quickstart

- ### Initialization

    Like other package managers, mcr should be initialized with a manifest file named `concrete.json` for every project. to initialize, run: `mcr init`
    <br>terminal asks you for **Game Version** and **Loader** you want to use.
    <br>these can be set on the first command using these options:
    - `--game-version`: Specifies Minecraft Version. example: `mcr init --game-version 1.20.1`
    - `--loader`: Specifies Minecraft Loader. example: `mcr init --loader fabric`

- ### Resource Installing

    `mcr install <resources...> ...`
    <br>Arguments:
    - `resources`: resources to install. accepts multiple entries. for <a href="https://modrinth.com">Modrinth Registry</a>, this should be ID or slug of resource.
      <br>Example: `mcr install fabric-api sodium`

    Options:
    - `--game-version`: specifies Minecraft version for install. default value is specified on `concrete.json` file.
    - `--loader`: specifies Minecraft loader for install. default value is specified on `concrete.json` file.
    - `--registry`: specifies the regitry to get the resource (for now only Modrinth is supported.)

_More Content Soon..._