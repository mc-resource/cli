import {ProjectVersionFile} from "./ProjectVersionFile";

export class ProjectVersion {
    name?: string;
    version_number?: string;
    changelog?: string;
    dependencies?: {}[];
    game_versions?: string[];
    version_type?: string;
    loaders?: string[];
    featured?: boolean;
    status?: string;
    requested_status?: string;
    id?: string;
    project_id?: string;
    author_id?: string;
    date_published?: string;
    downloads?: number;
    files?: ProjectVersionFile[];

    getPrimaryFile(): ProjectVersionFile | undefined {
        if (this.files) {
            for (const file of this.files) {
                if (file.primary) {
                    return file;
                }
            }
            if (this.files.length > 0) {
                return this.files[0];
            }
        } else return undefined;
    }
}