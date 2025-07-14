import fs from 'fs';
import { ConcreteFileNotFoundException } from './exceptions/concreteExceptions';
import { ProjectVersion } from './registry/modrinth/v2/types/ProjectVersion';
import { Project } from './registry/modrinth/v2/types/Project';

export interface ConcreteProject {
    type?: string | 'mod' | 'plugin' | 'resourcepack' | 'shaderpack';
    name?: string;
    id?: string;
    version?: ConcreteProjectVersion;
}

export interface ConcreteProjectVersion {
    version_number?: string;
    id?: string;
    date_published?: string;
    filename?: string;
}

export class ConcreteConfig {
    game_version?: string;
    loader?: string;
    isExists?: boolean = false;
    excludeProperties? = ['isExists', 'excludeProperties'];

    resources?: ConcreteProject[];

    constructor() {
        if (this.checkForConcreteFile()) {
            this.loadConcreteFile()
        }
    }

    // TODO: we need to get rid of modrinth classes and types here
    // and put them on its own registry folder
    addResource(project: Project, version: ProjectVersion, filename?: string) {
        this.loadConcreteFile();
        this.removeUnresolvedResourcesFiles();
        if (this.checkForResource(project)) {
            return this;
        }
        this.resources?.push({
            type: project.project_type,
            id: project.id,
            name: project.title,
            version: {
                filename: filename,
                id: version.id,
                date_published: version.date_published,
                version_number: version.version_number,
            },
        });
        this.save();
        return this;
    }

    checkForResource(project: Project | string) {
        this.loadConcreteFile();
        this.removeUnresolvedResourcesFiles();
        if (this.resources) {
            if (project instanceof Project) {
                for (const resource of this.resources) {
                    if (resource.id == project.id) {
                        return resource;
                    }
                }
            } else {
                for (const resource of this.resources) {
                    if (resource.id == project) {
                        return resource;
                    }
                }
            }
        }

        return false;
    }

    checkForResourceVersion(version: ProjectVersion | string) {
        this.loadConcreteFile();
        this.removeUnresolvedResourcesFiles();
        if (this.resources) {
            if (version instanceof ProjectVersion) {
                for (const resource of this.resources) {
                    if (resource.version?.id == version.id) {
                        return resource;
                    }
                }
            } else {
                for (const resource of this.resources) {
                    if (resource.version?.id == version) {
                        return resource;
                    }
                }
            }
        }
    }

    removeUnresolvedResourcesFiles() {
        if (this.resources) {
            for (const resource of this.resources) {
                if (
                    !fs.existsSync(
                        `${process.cwd()}/${resource.type}s/${resource.version?.filename}`,
                    )
                ) {
                    this.removeResource(resource.id || resource);
                }
            }
        }
    }

    removeResource(project: Project | string) {
        this.loadConcreteFile();
        const concrete = this.loadConcreteFile();
        if (project instanceof Project) {
            concrete.resources = concrete.resources?.filter(
                function (resource) {
                    return resource.id !== project.id;
                },
            );
        } else {
            concrete.resources = concrete.resources?.filter(
                function (resource) {
                    return resource.id !== project;
                },
            );
        }
        this.save();
        this.removeUnresolvedResourcesFiles();
        return this;
    }

    save() {
        this.checkForConcreteFile();
        const concrete = this.getDefaultConfig();
        this.writeToConcreteFile(concrete);
    }

    getDefaultConfig() {
        const concrete: Record<string, any> = this;
        if (concrete.excludeProperties) {
            concrete.excludeProperties.forEach(
                (key: string) => delete concrete[key],
            );
        }
        return concrete;
    }

    checkForConcreteFile() {
        if (fs.existsSync(`${process.cwd()}/concrete.json`)) {
            return true;
        }
        this.isExists = false;
        return false;
    }

    writeToConcreteFile(config: Record<any, any>) {
        this.checkForConcreteFile();
        fs.writeFileSync(
            `${process.cwd()}/concrete.json`,
            JSON.stringify(config, null, 2),
        );
    }

    loadConcreteFile() {
        if (this.checkForConcreteFile()) {
            this.isExists = true;
        }
        Object.assign(
            this,
            JSON.parse(
                fs.readFileSync(`${process.cwd()}/concrete.json`, 'utf8'),
            ),
        );
        return this;
    }
}
