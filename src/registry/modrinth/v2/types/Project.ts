import {getProjectVersions} from "../routes/versions/getProjectVersions";
import {ProjectVersion} from "./ProjectVersion";
import {modrinthClient} from "../index";

export class Project {
    slug?: string;
    title?: string;
    description?: string;
    categories?: string[];
    client_side?: string;
    server_side?: string;
    body?: string;
    status?: string;
    requested_status?: string;
    additional_categories?: string[];
    issues_url?: string;
    source_url?: string;
    discord_url?: string;
    donation_urls?: {}[];
    project_type?: string;
    downloads?: number;
    icon_url?: string;
    thread_id?: string;
    monetization_status?: string;
    id?: string;
    team?: string;
    published?: string;
    updated?: string;
    approved?: string;
    queued?: string;
    followers?: number;
    license?: {};
    versions?: string[];
    game_versions?: string[];
    loaders?: string[];
    gallery?: {}[]

    // getVersions: ((this: Project) => Promise<ProjectVersion[]>) = getVersions
    // async getVersions(this: Project): Promise<ProjectVersion[]> {
    //     return await modrinthClient._request<ProjectVersion[]>("GET", `project/${this.id}/version`, {});
    // }

    // constructor(id: string) {
    //     const resp = modrinthClient._request<Project>("GET", `project/${id}`, {})
    //     Object.assign(this, resp);
    // }
}