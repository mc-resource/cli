import * as pkg from '../../../../package.json';
import * as rl from 'readline-sync';
import { generateUserAgent } from './utils';
import { ModrinthAPI } from './ModrinthAPI';
import { ConcreteFileNotFoundException } from '../../../exceptions/concreteExceptions';
import { downloadAndSaveFromURL } from '../../../utils/downloader';
import { generateDirectory } from '../../../utils/directoryManager';
import { ProjectVersion } from './types/ProjectVersion';
import { Project } from './types/Project';
import { concreteConfig } from '../../../main';
import ResourceType from './enums/resourceType';
import DownloadResourceResult from './enums/downloadResourceResult';
import { ConcreteProject } from '../../../types';

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
        let project: ConcreteProject;
        let modrinthProject: Project;
        try {
            modrinthProject = await modrinthClient.getProject(options.resource);
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
                    console.log(
                        `Page ${Math.floor(offset / 7) + 1} out of ${Math.ceil(searchResult.total_hits / 7)}`,
                    );
                    const index = rl.keyInSelect(
                        [...projectSlugs, 'PREVIOUS', 'NEXT'],
                        'Select a Project: ',
                    );
                    if (index !== -1 && index <= 6) {
                        options.resource = projectSlugs[index];
                        modrinthProject = await modrinthClient.getProject(
                            options.resource,
                        );
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
                    // Resource not found
                    return DownloadResourceResult.FAIL_RESOURCE_NOT_FOUND;
                }
                // Operation cancelled
                return DownloadResourceResult.FAIL_OPERATION_CANCELLED;
            }
        }
        const resourceType = modrinthProject.project_type;
        let param = {
            project: modrinthProject,
            game_versions: options.game_versions?.toString(),
        };
        if (
            resourceType === ResourceType.MOD ||
            resourceType === ResourceType.PLUGIN
        ) {
            param = Object.assign(param, {
                loaders: options.loaders?.toString(),
            });
        }

        const versions = await modrinthClient.getProjectVersions(param);
        if (!versions || versions.length === 0) {
            // Cannot find a compatible version
            return DownloadResourceResult.FAIL_NO_COMPATIBLE_VERSION;
        }
        const version = Object.assign(new ProjectVersion(), versions[0]);

        let projectCheck: ConcreteProject | undefined;
        if (modrinthProject.id) {
            projectCheck = concreteConfig.checkForResource(modrinthProject.id);
        }
        if (version.name) {
            if (concreteConfig.checkForResourceVersion(version.name)) {
                // Version already installed
                return DownloadResourceResult.FAIL_VERSION_ALREADY_INSTALLED;
            }
            if (projectCheck) {
                if (
                    version.date_published &&
                    projectCheck.version?.date_published
                ) {
                    // TODO: this section needs work
                    if (
                        new Date(version.date_published).getTime <
                        new Date(projectCheck.version?.date_published).getTime
                    ) {
                        if (
                            !rl.keyInYN(
                                `a newer version of ${modrinthProject.title?.bold}@${projectCheck.version.name} is already installed. are you sure you want to replace the new one with this version?`
                                    .yellow,
                            )
                        ) {
                            return DownloadResourceResult.FAIL_OPERATION_CANCELLED;
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
                    customName: `${modrinthProject.title} (${version.version_number} - ${file.filename})`,
                    printResult: options.printResult ?? true,
                },
            );
        }
        if (projectCheck) {
            project = {
                name: modrinthProject.slug,
                type: modrinthProject.project_type,
                version: {
                    id: projectCheck.version?.id,
                    name: projectCheck.version?.name,
                    title: projectCheck.version?.title,
                    date_published: projectCheck.version?.date_published,
                    filename: projectCheck.version?.filename,
                },
            }
            concreteConfig.removeResource(project);
        } else {
            project = {
                name: modrinthProject.slug,
                type: modrinthProject.project_type,
                version: {
                    id: version.id,
                    name: version.version_number,
                    title: version.name,
                    date_published: version.date_published,
                    filename: file?.filename,
                },
            }
        }
        concreteConfig.addResource(project, version, file?.filename);
        return DownloadResourceResult.SUCCESS;
    } catch (e) {
        if (e instanceof ConcreteFileNotFoundException) {
            console.error(e.message.red);
        }
        console.error(e);
        return DownloadResourceResult.FAIL_UNKNOWN;
    }
};
