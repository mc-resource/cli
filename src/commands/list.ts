import { Command } from "commander";
import { CommandDefinition } from "../types";
import { concreteConfig } from "../main";

export function listExecute() {
    concreteConfig.loadConcreteFile();
    const installed = concreteConfig.manifest?.dependencies || [];
    console.log(`Found ${installed.length} installed resources:`);
    installed.forEach((res) => {
        console.log(`- ${res.name}@${res.version?.name}`);
    });
}

export const ListCommand: CommandDefinition = {
  name: 'list',
  description: 'List all Installed Resources',
  aliases: ['ls', 'l'],
  configure: (command: Command) => {
    return command
        .action(listExecute);
  },
};
