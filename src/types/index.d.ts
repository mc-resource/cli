import { Command } from 'commander';

export interface CommandDefinition {
    name: string;
    description: string;
    aliases?: string[];
    configure: (command: Command) => Command;
}

export interface ConcreteProject {
    type?: string | 'mod' | 'plugin' | 'resourcepack' | 'shaderpack';
    name?: string;
    version?: ConcreteProjectVersion;
}

export interface ConcreteProjectVersion {
    name?: string;
    id?: string;
    title?: string;
    date_published?: string;
    filename?: string;
}
