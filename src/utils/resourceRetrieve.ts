export const retrieveGameVersion = (resource: string) => {
    if (resource.includes(':')) {
        const opts = resource.split(':')[1];
        const version = opts?.split('-')[0];
        if (version && version.includes('.')) {
            return version;
        }
    }
    return undefined;
};

export const retrieveLoader = (resource: string) => {
    if (resource.includes(':')) {
        const opts = resource.split(':')[1];
        const loader = opts?.split('-')[1];
        if (loader && !loader.includes('*')) {
            return loader;
        }
    }
    return undefined;
};

export const retrieveResourceName = (resource: string) => {
    if (resource.includes(':')) {
        return resource.split(':')[0];
    }
    return resource;
};
