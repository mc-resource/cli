import concreteDefault from '../resources/concrete-default.json';
import * as rl from 'readline-sync';
import 'colorts/lib/string';
import { writeFileSync } from 'node:fs';
import { concreteConfig } from '../main';
import { Command, Option } from 'commander';
import { CommandDefinition } from '../types';
import { ConcreteFileAlreadyExistsException } from '../exceptions/concreteExceptions';

interface InitOptions {
    gameVersion?: string;
    loader?: string;
    force?: boolean;
}

export async function initExecute(options: InitOptions = {}) {
    if (concreteConfig.checkForConcreteFile()) {
        if (options.force) {
            console.log(
                'concrete.json file already exists in the current directory. overwriting it...'.yellow,
            );
        } else {
            throw new ConcreteFileAlreadyExistsException();
        }
    }

    let concreteJson = concreteDefault;

    concreteJson.game_version = options.gameVersion ?? rl.question('Enter Minecraft version: ');
    console.log(
        'Set Minecraft version: '.green + `${concreteJson.game_version}`.yellow,
    );

    concreteJson.loader = options.loader ?? rl.question('Enter Minecraft loader: ');
    console.log(
        'Set Minecraft loader: '.green + `${concreteJson.loader}`.yellow,
    );

    writeFileSync(
        process.cwd() + '/concrete.json',
        JSON.stringify(concreteJson, null, 2),
    );

    console.log(
        'Successfully Initialized mcr for directory:'.green +
            ' concrete.json'.yellow,
    );
}

export const InitCommand: CommandDefinition = {
    name: 'init',
    description: 'Initializes mcr for directory within concrete.json',
    aliases: ['initialize', 'setup'],
    configure: (command: Command) => {
        return command
            .addOption(
                new Option(
                    '--game-version [game_version]',
                    'Minecraft version of directory. this is based on what version your instance/server is using.',
                ),
            )
            .addOption(
                new Option(
                    '--loader [loader]',
                    'Minecraft Loader of directory (forge, fabric, paper, etc...)',
                ),
            )
            .addOption(
                new Option('--force', 'Force overwrite existing concrete.json file.'),
            )
            .action(initExecute);
    },
};
