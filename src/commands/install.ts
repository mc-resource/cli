import { CommandDefinition } from '../types';
import { Command, Option } from 'commander';
import { combineWithUnknownOptions } from '../utils/unknownOptions';
import { Registries } from '../enums/registries';
import { downloadResource } from '../registry/modrinth/v2';
import parseIdentifier from '../utils/parseIdentifier';
import { concreteConfig } from '../main';
import { initExecute } from './init';

interface InstallOptions {
    registry?: string;
    [x: string]: any;
}

export async function installExecute(
    resources: string[] | undefined,
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

        concreteConfig.removeUnresolvedResourcesFiles();

        const concreteResources = concreteConfig.manifest?.dependencies || [];
        if (concreteResources && concreteResources.length > 0) {
            for (const concreteResource of concreteResources) {
                const resourceVersion = concreteResource.version?.name;
                const resourceName = concreteResource.name || '';

                if (
                    resourceName &&
                    concreteConfig.checkForResource(resourceName)
                ) {
                    result.skipped += 1;
                    continue;
                }

                const downloadResult = await downloadResource({
                    resource: resourceName,
                    version: resourceVersion,
                    printResult: concreteResources.length === 1 ? true : false,
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
        }

        if (resources && resources.length > 0) {
            const existingNames = new Set(
                (concreteConfig.manifest?.dependencies || []).map(
                    (r) => r.name,
                ),
            );

            resources = resources.filter((resource) => {
                const parsed = parseIdentifier(resource);
                return parsed.name && !existingNames.has(parsed.name);
            });
            for (const resource of resources) {
                const parsedIdentifier = parseIdentifier(resource);

                let game_version: string[] | undefined;
                let loader: string[] | undefined;
                let version: string | undefined;

                if (!parsedIdentifier.version) {
                    game_version =
                        parsedIdentifier.game_version ||
                        options.game_version ||
                        concreteConfig.manifest?.game_version ||
                        undefined;

                    loader =
                        parsedIdentifier.loader ||
                        options.loader ||
                        concreteConfig.manifest?.loader ||
                        undefined;
                } else {
                    version = parsedIdentifier.version;
                }

                const resourceName = parsedIdentifier.name || '';

                const downloadResult = await downloadResource({
                    resource: resourceName,
                    version: version,
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
            .argument('[RESOURCES...]', 'Name of the resource(s).')
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
