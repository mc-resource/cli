import { ProjectVersion } from '../../types/ProjectVersion';
import { Project } from '../../types/Project';
import { generateUserAgent } from '../../utils';
import * as pkg from '../../../../../../package.json';
import { ModrinthAPI } from '../../ModrinthAPI';

// export async function getVersions(this: Project): Promise<ProjectVersion[]> {
//     return await modrinthClient._request<ProjectVersion[]>("GET", `project/${this.id}/version`, {});
// }
export interface ProjectVersionOptions {
    project: Project;
    loaders?: string[] | string;
    game_versions?: string[] | string;
    featured?: boolean;
}

export async function getProjectVersions(
    options: ProjectVersionOptions,
): Promise<ProjectVersion[]> {
    const userAgent = generateUserAgent({
        projectName: pkg.name,
        projectVersion: pkg.version,
    });
    const modrinthClient = new ModrinthAPI({ userAgent: userAgent });

    const params = new URLSearchParams();

    if (options.loaders) {
        options.loaders = Array.isArray(options.loaders)
            ? `["${options.loaders.join('","')}"]`
            : `["${options.loaders}"]`;
        options.loaders && params.set('loaders', options.loaders);
    }
    if (options.game_versions) {
        options.game_versions = Array.isArray(options.game_versions)
            ? `["${options.game_versions.join('","')}"]`
            : `["${options.game_versions}"]`;
        options.game_versions &&
            params.set('game_versions', options.game_versions);
    }
    options.featured && params.set('featured', options.toString());

    return await modrinthClient._request<ProjectVersion[]>(
        'GET',
        `project/${options.project.id}/version`,
        {
            query: params,
        },
    );
}
