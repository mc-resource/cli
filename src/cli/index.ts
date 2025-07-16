import { Command } from 'commander';
import * as pkg from '../../package.json';
import { commands } from '../commands/index';

export function run() {
    const program = new Command();

    program.name(pkg.name).description(pkg.description).version(pkg.version);

    for (const commandDef of commands) {
        const command = program
            .command(commandDef.name)
            .description(commandDef.description);

        if (commandDef.aliases && commandDef.aliases.length > 0) {
            commandDef.aliases.forEach((alias) => {
                command.alias(alias);
            });
        }

        commandDef.configure(command);
    }

    program.parse(process.argv);
}
