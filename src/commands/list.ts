import { Command } from "commander";
import { CommandDefinition } from "../types";
import { concreteConfig } from "../main";

export function listExecute() {
    try {
      concreteConfig.loadConcreteFile();
    const installed = concreteConfig.manifest?.dependencies || [];
    console.log(`Found ${installed.length} installed resources:`);
    installed.forEach((res) => {
        console.log(`- ${res.name}@${res.version?.name}`);
    });
    } catch (error) {
      console.error("Failed to load concrete file, are you sure you have the concrete.json file? ".red, error);
    }
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
