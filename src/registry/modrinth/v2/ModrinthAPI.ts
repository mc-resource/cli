import { generateUserAgent, UserAgentData } from './utils';
import { searchProjects } from './routes/projects/searchProjects';
import { getProject } from './routes/projects/getProject';
import { getProjectVersions } from './routes/versions/getProjectVersions';

export interface ModrinthAPIOptions {
    apiURL?: string;
    userAgent: UserAgentData | string;
}

export class ModrinthAPI {
    baseURL: string;
    userAgent: string;

    constructor(options: ModrinthAPIOptions) {
        this.baseURL = options?.apiURL || 'https://api.modrinth.com/v2/';

        if (typeof options.userAgent === 'string') {
            this.userAgent = options.userAgent;
        } else {
            this.userAgent = generateUserAgent(options.userAgent);
        }
    }

    async _request<T extends Record<string, any>>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        endpoint: string,
        opts?: {
            query?: URLSearchParams;
            base?: string;
            body?: any;
        },
    ) {
        const queryStr = opts?.query ? '?' + opts.query.toString() : '';
        const url = new URL(endpoint + queryStr, opts?.base || this.baseURL);

        try {
            const res = await fetch(url.toString(), {
                method,
                body: opts?.body,
                headers: {
                    'User-Agent': this.userAgent,
                    Accept: 'application/json',
                },
            });

            if (!res.ok) {
                throw new Error(
                    `Modrinth API Error: ${res.status} ${res.statusText}`.red,
                );
            }

            const data: T = await res.json();
            return data;
        } catch (err: any) {
            console.error(`Failed to fetch ${url.toString()}`.red);
            if (err.code === 'UND_ERR_CONNECT_TIMEOUT') {
                console.error(
                    'Connection timed out while accessing Modrinth API.'.red,
                );
            } else if (err.code === 'EAI_AGAIN') {
                console.error(
                    'DNS lookup failed (EAI_AGAIN). Are you online? DNS may be misconfigured.'
                        .red,
                );
            }
            throw err;
        }
    }

    public searchProjects = searchProjects;
    public getProject = getProject;
    public getProjectVersions = getProjectVersions;
}
