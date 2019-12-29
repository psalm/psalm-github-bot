import fetch from 'node-fetch'

export class SnippetResolver {
  async resolve(snippetId: string): Promise<ResolvedSnippet> {
    const url = `https://psalm.dev/r/${snippetId}`;

    const text = await fetch(`${url}/raw`)
      .then(async(response) => await response.text());

    const results = await fetch(`${url}/results`)
      .then(async(response) => await response.json());

    if (results.error !== undefined) {
      return {
        text: text,
        results: null,
        internalError: results.error
      };
    }

    return {
      text: text,
      results: results,
      internalError: null
    };
  }
}

export interface ResolvedSnippet {
  text: string;
  results: SnippetResults|null;
  internalError: SnippetInternalError|null;
}

export interface SnippetResults {
  results: SnippetIssue[];
  version: string;
  fixed_contents?: string;
  hash: string;
}

export interface SnippetInternalError {
  message: string
}

export interface SnippetIssue {
  severity: string;
  line_from: number;
  line_to: number;
  type: string;
  message: string;
  file_name: string;
  file_path: string;
  snippet: string;
  selected_text: string;
  from: number;
  to: number;
  snippet_from: number;
  snippet_to: number;
  column_from: number;
  column_to: number;
}
