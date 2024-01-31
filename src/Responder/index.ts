import { ResolvedSnippet, SnippetIssue } from "../SnippetResolver"

export class Responder {

  greet(login: string) {
    return `Hey @${login}, can you reproduce the issue on https://psalm.dev? These will be used as phpunit tests when implementing the feature or fixing this bug.`
  }

  shouldGreet(issue: string, repoName: string) {
    const allowedRepos = [
      'vimeo/psalm',
      'weirdan/psalm-github-bot'
    ];

    if (!allowedRepos.includes(repoName)) {
      return false;
    }

    const links = issue.match(/psalm\.dev(\/\w*)?/g)
    if (!links) {
      return true
    }

    const validLinks = links.filter(
      link => !/psalm\.dev\/\d/.test(link)
    )

    if (null === validLinks) {
      return true
    }

    if (!validLinks.length) {
      return true
    }

    return false;
  }

  snippetResponse(resolvedSnippets: ResolvedSnippet[]): string {
    const snippets = resolvedSnippets.map(this.formatSnippet.bind(this)).join('\n')

    return `I found these snippets:
${snippets}`
  }

  private formatSnippet(snippet: ResolvedSnippet): string {
    const snippetCode = `<summary>${snippet.link}</summary>

\`\`\`php
${snippet.text}
\`\`\`
`
    const snippetOutput = this.formatSnippetOutput(snippet)
    return `<details>
${snippetCode}
${snippetOutput}
</details>
`
  }

  private formatSnippetOutput(snippet: ResolvedSnippet): string {
    if (snippet.internalError !== null) {
      return this.formatInternalError(snippet)
    } else if (snippet.results !== null) {
      return this.formatSnippetResult(snippet)
    }
    return '';
  }

  private formatInternalError(snippet: ResolvedSnippet): string {
    if (null === snippet.internalError) {
      throw new Error('expected to receive errored snippet')
    }
    return `\`\`\`
Psalm encountered an internal error:

${snippet.internalError.message}
\`\`\``
  }

  private formatSnippetResult(snippet: ResolvedSnippet): string {
    if (null === snippet.results) {
      throw new Error('expected to receive successful snippet')
    }
    return `\`\`\`
Psalm output (using commit ${snippet.results.version.split('@')[1].substr(0, 7)}):

${snippet.results.results.length ? snippet.results.results.map(this.formatSnippetIssue.bind(this)).join('\n\n') : 'No issues!'}
\`\`\``
  }

  private formatSnippetIssue(issue: SnippetIssue): string {
    return `${issue.severity.toUpperCase()}: ${issue.type} - ${issue.line_from}:${issue.column_from} - ${issue.message}`
  }
}
