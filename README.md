<img height="40" alt="MCR" src="./assets/mcr-logo.png" />


# Resource Manager for Minecraft (MCR) 📦

<img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmc-resource%2Fcli%2F23663d67f3ce63757b5e7812f329fdac908fba09%2Fpackage.json&query=%24.version&label=Latest" /> <img src="https://img.shields.io/npm/v/@mc-resource/cli/experimental?label=Experimental" />

**Resource Manager for Minecraft (MCR)** is an advanced CLI tool for setting up and managing Minecraft Instances and Servers and publishing your Resources. Possibilities of
This tool is much higher than managing big and complex Modpacks and Servers.

## Introduction

> **⚠️ WARNING**
> MCR is now at the very beginning (EXPERIMENTAL) stage.
> experimental versions are available on npm to be installed.
Consider specifying the version when installing MCR.
> we ask Developers to help the project. Pull Requests are welcome.

Some of the Features are:

- Advanced CLI Interactions
- Version Control
- ...

## Installation

mcr requires [Node.js](https://nodejs.org/) and `npm` (installed with Node.js by default) to be installed on your system. To install mcr, you can get the CLI package with:

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
        <td>Worlds, Versions, Data Packs, etc.. </td>
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
        <td>Resource Config, Server JAR, etc.. </td>
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

mcr Command-Line Interface (CLI) is accessible using Terminal to interact with resources in the Path.
The shortcut is `mcr`.

## Quickstart

- ### Initialization

    Like other package managers, mcr should be initialized with a manifest file named `concrete.json` for every project. To initialize, run: `mcr init`
    <br>terminal asks you for **Game Version** and **Loader** you want to use.
    <br> These can be set on the first command using these options:
    - `--game-version`: Specifies Minecraft Version. example: `mcr init --game-version 1.20.1`
    - `--loader`: Specifies Minecraft Loader. example: `mcr init --loader fabric`

- ### Resource Installing

    `mcr install <resources...> ...`
    <br>Arguments:
    - `resources`: resources to install. Accepts multiple entries. for <a href="https://modrinth.com">Modrinth Registry</a>, this should be ID or slug of resource.
      <br>Example: `mcr install fabric-api sodium`

    Options:
    - `--game-version`: specifies Minecraft version for installation. The default value is defined in the `concrete.json` file.
    - `--loader`: specifies Minecraft loader for installation. The default value is defined in the `concrete.json` file.
    - `--registry`: specifies the registry to get the resource (for now, only Modrinth is supported.)

_More Content Soon..._