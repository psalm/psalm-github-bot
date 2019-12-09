export class CommentParser {
  parseComment(comment: string): LinkEntry[] {
    let matches;
    let snippets = [];
    const regexp = /psalm\.dev\/r\/(\w+)/g;

    const seen: Set<string> = new Set;

    while ((matches = regexp.exec(comment)) !== null) {
      if (seen.has(matches[1])) {
        continue;
      }

      snippets.push({
        link: 'https://' + matches[0], 
        snippet: matches[1]
      });

      seen.add(matches[1]);
    }

    return snippets;
  }
}

export interface LinkEntry {
  link: string;
  snippet: string;
}
