import * as pkg from '../../../../package.json';
import * as rl from 'readline-sync';
import { generateUserAgent } from './utils';
import { ModrinthAPI } from './ModrinthAPI';
import { ConcreteConfig, ConcreteProject } from '../../../concrete';
import { ConcreteFileNotFoundException } from '../../../exceptions/concreteExceptions';
import { downloadAndSaveFromURL } from '../../../utils/downloader';
import { generateDirectory } from '../../../utils/directoryManager';
import { ProjectVersion } from './types/ProjectVersion';
import { Project } from './types/Project';
import { concreteConfig } from '../../../main';
import ResourceType from './enums/resourceType';

interface downloadResourceOptions {
    resource: string;
    game_versions?: string[];
    loaders?: string[];
    printResult?: boolean;
}

const userAgent = generateUserAgent({
    projectName: pkg.name,
    projectVersion: pkg.version,
});
export const modrinthClient = new ModrinthAPI({ userAgent: userAgent });

export const downloadResource = async ({
    ...options
}: downloadResourceOptions) => {
    try {
        let project: Project;
        try {
            project = await modrinthClient.getProject(options.resource);
        } catch (err) {
            let offset = 0;
            while (true) {
                const searchResult = await modrinthClient.searchProjects({
                    query: options.resource,
                    limit: 7,
                    offset: offset,
                });
                if (searchResult.hits && searchResult.hits.length > 0) {
                    const projectSlugs = searchResult.hits
                        .map((hit) => hit.slug)
                        .filter((slug): slug is string => slug !== undefined);
                        console.log(`Page ${Math.floor(offset / 7) + 1} out of ${Math.ceil(searchResult.total_hits / 7)}`);
                    const index = rl.keyInSelect(
                        [ ...projectSlugs, 'PREVIOUS', 'NEXT' ],
                        'Select a Project: ',
                    );
                    if (index !== -1 && index <= 6) {
                        options.resource = projectSlugs[index];
                        project = await modrinthClient.getProject(options.resource);
                        break;
                    }
                    if (index === 8) {
                        offset += 8;
                        continue;
                    }
                    if (index === 7) {
                        offset -= 7;
                        if (offset < 0) offset = 0;
                        continue;
                    }
                } else {
                    throw new Error(
                        `Resource "${options.resource}" not found on Modrinth Registry.`.red,
                    );
                }
                console.log('Operation cancelled.'.yellow);
                return;
            }
        }
        const resourceType = project.project_type;
        let param = {
            project: project,
            game_versions: options.game_versions?.toString(),
        };
        if (resourceType === 'mod') {
            param = Object.assign(param, {
                loaders: options.loaders?.toString(),
            });
        }
        const version = Object.assign(
            new ProjectVersion(),
            (await modrinthClient.getProjectVersions(param))[0],
        );
        let projectCheck: boolean | ConcreteProject = false;
        if (project.id) {
            projectCheck = concreteConfig.checkForResource(project.id);
        }
        if (version.id) {
            if (concreteConfig.checkForResourceVersion(version.id)) {
                if (options.printResult) {
                    console.log(
                        `Resource ${project.title?.bold}@${version.version_number?.bold} is already installed.`
                            .yellow,
                    );
                }
                return;
            }
            if (projectCheck) {
                if (
                    version.date_published &&
                    projectCheck.version?.date_published
                ) {
                    if (
                        new Date(version.date_published).getTime <
                        new Date(projectCheck.version?.date_published).getTime
                    ) {
                        if (
                            !rl.keyInYN(
                                `a newer version of ${project.title?.bold}@${projectCheck.version.version_number} is already installed. are you sure you want to replace the new one with this version?`
                                    .yellow,
                            )
                        ) {
                            return;
                        }
                    }
                }
            }
        }
        const file = version.getPrimaryFile();
        if (file?.url) {
            const resourceFolder =
                resourceType === ResourceType.MOD
                    ? 'mods'
                    : resourceType === ResourceType.PLUGIN
                      ? 'plugins'
                      : resourceType === ResourceType.RESOURCE_PACK
                        ? 'resourcepacks'
                        : resourceType === ResourceType.SHADER_PACK
                          ? 'shaderpacks'
                          : 'mcr';
            generateDirectory(`${process.cwd()}/${resourceFolder}/`);
            await downloadAndSaveFromURL(
                file.url,
                `${process.cwd()}/${resourceFolder}/${file.filename}`,
                {
                    customName: `${project.title} (${version.version_number} - ${file.filename})`,
                    printResult: options.printResult ?? true,
                },
            );
        }
        if (projectCheck) {
            concreteConfig.removeResource(project);
        }
        concreteConfig.addResource(project, version, file?.filename);
    } catch (e) {
        if (e instanceof ConcreteFileNotFoundException) {
            console.error(e.message.red);
        }
        console.error(e);
    }
    // }
};
