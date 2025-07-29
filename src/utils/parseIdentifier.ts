type ParsedIdentifier = {
  name?: string;
  version?: string;
  game_version?: string;
  loader?: string;
  tag?: string;
};

function parseIdentifier(input: string): ParsedIdentifier {
  const result: ParsedIdentifier = {};

  const tagMatch = input.match(/#([^@:#]+)/);
  if (tagMatch) {
    result.tag = tagMatch[1];
    input = input.replace(`#${tagMatch[1]}`, '');
  }

  const gameVersionMatch = input.match(/:([^@:#]+)/);
  if (gameVersionMatch) {
    const gameVersionLoader = gameVersionMatch[1];
    input = input.replace(`:${gameVersionLoader}`, '');

    const dashIndex = gameVersionLoader.indexOf('-');
    if (dashIndex !== -1) {
      const version = gameVersionLoader.slice(0, dashIndex);
      const loader = gameVersionLoader.slice(dashIndex + 1);

      if (version !== '*') result.game_version = version;
      if (loader !== '*') result.loader = loader;
    } else {
      if (gameVersionLoader !== '*') result.game_version = gameVersionLoader;
    }
  }

  const versionMatch = input.match(/@([^@:#]+)/);
  if (versionMatch) {
    result.version = versionMatch[1];
    input = input.replace(`@${versionMatch[1]}`, '');
  }

  result.name = input || undefined;

  return result;
}

export default parseIdentifier;