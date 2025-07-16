import { Command } from 'commander';

export const getUnknownOptions = (command: Command) => {
    const extras = command.args as string[];
    const unknown: Record<string, string | boolean> = {};
    for (let i = 0; i < extras.length; i++) {
        const arg = extras[i];
        if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const next = extras[i + 1];
            if (next && !next.startsWith('-')) {
                unknown[key] = next;
                i++;
            } else {
                unknown[key] = true;
            }
        }
    }
    return unknown;
};

export const combineWithUnknownOptions = (
    command: Command,
    options: Record<string, any>,
) => {
    return { ...options, ...getUnknownOptions(command) };
};
