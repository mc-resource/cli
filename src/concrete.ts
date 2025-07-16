import fs from 'fs';
import { ConcreteProject, ConcreteProjectVersion } from './types';

export class Concrete {
    manifest?: ConcreteConfig;

    constructor() {
        if (this.checkForConcreteFile()) {
            this.loadConcreteFile();
        }
        this.manifest = Object.assign(new ConcreteConfig(), this.manifest);
    }

    checkForConcreteFile() {
        if (fs.existsSync(`${process.cwd()}/concrete.json`)) {
            return true;
        }
        return false;
    }

    loadConcreteFile() {
        return (this.manifest = JSON.parse(
            fs.readFileSync(`${process.cwd()}/concrete.json`, 'utf8'),
        ));
    }

    // TODO: we need to get rid of modrinth classes and types here
    // and put them on its own registry folder
    addResource(
        project: ConcreteProject,
        version: ConcreteProjectVersion,
        filename?: string,
    ) {
        this.loadConcreteFile();
        this.removeUnresolvedResourcesFiles();
        if (this.checkForResource(project)) {
            return this;
        }
        this.manifest?.dependencies?.push(project);
        this.save();
        return this;
    }

    checkForResource(project: ConcreteProject | string) {
        this.loadConcreteFile();
        this.removeUnresolvedResourcesFiles();
        if (this.manifest?.dependencies) {
            if (typeof project === 'object' && 'name' in project) {
                for (const resource of this.manifest.dependencies) {
                    if (resource.name == project.name) {
                        return resource;
                    }
                }
            } else {
                for (const resource of this.manifest.dependencies) {
                    if (resource.name == project) {
                        return resource;
                    }
                }
            }
        }

        return undefined;
    }

    checkForResourceVersion(version: ConcreteProjectVersion | string) {
        this.loadConcreteFile();
        this.removeUnresolvedResourcesFiles();
        if (this.manifest?.dependencies) {
            if (typeof version === 'object' && 'name' in version) {
                for (const resource of this.manifest?.dependencies) {
                    if (resource.version?.name == version.name) {
                        return resource;
                    }
                }
            } else {
                for (const resource of this.manifest?.dependencies) {
                    if (resource.version?.name == version) {
                        return resource;
                    }
                }
            }
        }
    }

    removeUnresolvedResourcesFiles() {
        if (this.manifest?.dependencies) {
            for (const resource of this.manifest?.dependencies) {
                if (
                    !fs.existsSync(
                        `${process.cwd()}/${resource.type}s/${resource.version?.filename}`,
                    )
                ) {
                    this.removeResource(resource.name || resource);
                }
            }
        }
    }

    removeResource(project: ConcreteProject | string) {
        const concrete = this.loadConcreteFile();
        if (typeof project === 'object' && 'name' in project) {
            concrete.dependencies = concrete.dependencies?.filter(
                (resource: ConcreteProject) => {
                    return resource.name !== project.name;
                },
            );
        } else {
            concrete.dependencies = concrete.dependencies?.filter(
                (resource: ConcreteProject) => {
                    return resource.name !== project;
                },
            );
        }
        this.save();
        this.removeUnresolvedResourcesFiles();
        return this;
    }

    save() {
        this.checkForConcreteFile();
        const concrete = this.manifest;
        if (concrete && 'dependencies' in concrete)
            this.writeToConcreteFile(concrete);
    }

    writeToConcreteFile(config: ConcreteConfig | Record<any, any>) {
        this.checkForConcreteFile();
        fs.writeFileSync(
            `${process.cwd()}/concrete.json`,
            JSON.stringify(config, null, 2),
        );
    }
}

export class ConcreteConfig {
    game_version?: string;
    loader?: string;
    dependencies?: ConcreteProject[];
}
