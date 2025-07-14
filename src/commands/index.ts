import { InitCommand } from './init';
import { InstallCommand } from './install';
import { CommandDefinition } from '../types';

export const commands: CommandDefinition[] = [InitCommand, InstallCommand];
