import { CommandDefinition } from '../types';
import { Command, Option } from 'commander';
import { combineWithUnknownOptions } from '../utils/unknownOptions';
import { Registries } from '../enums/registries';
import { downloadResource } from '../registry/modrinth/v2';
import parseIdentifier from '../utils/parseIdentifier'; '../utils/parseIdentifier';
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

    if (!concreteConfig.checkForConcreteFile()) {
        await initExecute();
    }

    if (
        options.registry === Registries.MODRINTH ||
        options.registry === Registries.MODRINTH_V2
    ) {
        let result = {
            success: 0,
            failed: 0,
            skipped: 0,
        };

        for (const resource of resources) {
            const parsedIdentifier = parseIdentifier(resource);

            const game_version =
                parsedIdentifier.game_version ||
                options.game_version ||
                concreteConfig.manifest?.game_version ||
                undefined;

            const loader =
                parsedIdentifier.loader ||
                options.loader ||
                concreteConfig.manifest?.loader ||
                undefined;

            const resourceName = parsedIdentifier.name || '';

            const downloadResult = await downloadResource({
                resource: resourceName,
                game_versions: game_version,
                loaders: loader,
                printResult: resources.length === 1 ? true : false,
            });

            switch (downloadResult) {
                case 0:
                    result.success += 1;
                    break;
                case 3:
                    result.skipped += 1;
                    break;
                case 4:
                    result.skipped += 1;
                    break;
                default:
                    result.failed += 1;
                    break;
            }
        }

        console.log(
            `\rInstalled ${result.success} resources, ${result.failed} failed and ${result.skipped} skipped.`,
        );

        return;
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
