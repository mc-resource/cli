import { Project } from '../../types/Project';
import { ModrinthAPI } from '../../ModrinthAPI';

export async function getProject(
    this: ModrinthAPI,
    id: string,
): Promise<Project> {
    return await this._request<Project>('GET', `project/${id}`, {});
}
