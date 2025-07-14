export interface UserAgentData {
    projectName: string;
    projectVersion?: string | number | undefined;
    githubUsername?: string | undefined;
    contactInfo?: string | undefined;
}

export function generateUserAgent(ua: UserAgentData): string {
    let output = "";

    if (ua.githubUsername) output += `${ua.githubUsername}/`;
    output += ua.projectName;
    if (ua.projectVersion) output += `/${ua.projectVersion}`;
    if (ua.contactInfo) output += ` (${ua.contactInfo})`;

    return output;
}