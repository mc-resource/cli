import { ProjectVersion } from '../../types/ProjectVersion';
import { Project } from '../../types/Project';
import { generateUserAgent } from '../../utils';
import * as pkg from '../../../../../../package.json';
import { ModrinthAPI } from '../../ModrinthAPI';

export interface ProjectVersionOptions {
    project: Project;
    version: string;
}

export async function getProjectVersion(
    options: ProjectVersionOptions,
): Promise<ProjectVersion[]> {
    const userAgent = generateUserAgent({
        projectName: pkg.name,
        projectVersion: pkg.version,
    });
    const modrinthClient = new ModrinthAPI({ userAgent: userAgent });

    return await modrinthClient._request<ProjectVersion[]>(
        'GET',
        `project/${options.project.id}/version/${options.version}`,
    );
}
