import { Command } from 'commander';

export interface CommandDefinition {
    name: string;
    description: string;
    aliases?: string[];
    configure: (command: Command) => Command;
}
