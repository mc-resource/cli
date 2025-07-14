import { CommandDefinition } from '../types';
import { Command, Option } from 'commander';
import { combineWithUnknownOptions } from '../utils/unknownOptions';
import { Registries } from '../enums/registries';
import { downloadResource } from '../registry/modrinth/v2';
import {
    retrieveGameVersion,
    retrieveLoader,
    retrieveResourceName,
} from '../utils/resourceRetrieve';
import { concreteConfig } from '../main';
import { initExecute } from './init';

interface InstallOptions {
    registry?: string;
    [x: string]: any;
}

export async function installExecute(
    resources: string[],
    options: InstallOptions,
    ...args: Command[]
) {
    options = combineWithUnknownOptions(args[0], options);

    if (
        options.registry === Registries.MODRINTH ||
        options.registry === Registries.MODRINTH_V2
    ) {
        resources.forEach(async (resource) => {
            const game_version =
                retrieveGameVersion(resource) ||
                options.game_version ||
                concreteConfig.game_version ||
                undefined;

            const loader =
                retrieveLoader(resource) ||
                options.loader ||
                concreteConfig.loader ||
                undefined;

            const resourceName = retrieveResourceName(resource);

            if (!concreteConfig.checkForConcreteFile()) {
                await initExecute()
            }

            await downloadResource({
                resource: resourceName,
                game_versions: game_version,
                loaders: loader,
                printResult: resources.length === 1 ? true : false,
            });
        });
    }
}

export const InstallCommand: CommandDefinition = {
    name: 'install',
    description: 'Installs specified Resource(s)',
    aliases: ['i'],
    configure: (command: Command) => {
        return command
            .argument('<RESOURCES...>', 'Name of the resource(s).')
            .addOption(
                new Option(
                    '--registry -r [registry]',
                    `registry for getting the resource(s).`,
                ).default('modrinth'),
            )
            .addOption(
                new Option(
                    '--game-version <game_version>',
                    'Minecraft version to install the resource for.',
                ),
            )
            .addOption(
                new Option(
                    '--loader <loader>',
                    'Loader to install the resource for.',
                ),
            )
            .allowUnknownOption(true)
            .action(installExecute);
    },
};
