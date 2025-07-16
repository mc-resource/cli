import { InitCommand } from './init';
import { InstallCommand } from './install';
import { CommandDefinition } from '../types';
import { ListCommand } from './list';

export const commands: CommandDefinition[] = [
    InitCommand,
    InstallCommand,
    ListCommand,
];
