import { Application } from 'probot' // eslint-disable-line no-unused-vars
import { CommentParser, LinkEntry } from './CommentParser'
import { SnippetResolver } from './SnippetResolver'

export = (app: Application) => {
  const parser = new CommentParser;
  const resolver = new SnippetResolver;

  const makeResponse = async (links: LinkEntry[]): Promise<string> => {
    const resolvedSnippets = await Promise.all(
      links.map(
        entry => 
          resolver.resolve(entry.snippet)
            .then(
              result => { 
                return {...result, link: entry.link}; 
              }
            )
      )
    );

    return `I found these snippets:
${resolvedSnippets.map(snippet => `
<details>
<summary>${snippet.link}</summary>

\`\`\`php
${snippet.text}
\`\`\`
\`\`\`
Psalm output (using commit ${snippet.results.version.split('@')[1].substr(0, 7)}):

${snippet.results.results.length ? snippet.results.results.map(issue => `${issue.severity.toUpperCase()}: ${issue.type} - ${issue.line_from}:${issue.column_from} - ${issue.message}`).join('\n\n') : 'No issues!'}
\`\`\`
</details>
`).join('\n')}
`;
  };

  let responses: Map<number, number> = new Map;

  app.on('issues.opened', async(context) => {
    if (!context.isBot) {
      const issue = context.payload.issue;

      const links = parser.parseComment(issue.body);
      if (links.length) {
        const issueComment = context.issue({body: await makeResponse(links)});
        const result = await context.github.issues.createComment(issueComment);
        responses.set(issue.id, result.data.id);
      }
    }
  });

  app.on('issue_comment.created', async(context) => {
    if (!context.isBot) {
      const comment = context.payload.comment;

      const links = parser.parseComment(comment.body);
      if (links.length) {
        const issueComment = context.issue({body: await makeResponse(links)});
        const result = await context.github.issues.createComment(issueComment);

        responses.set(comment.id, result.data.id);
      }
    }
  });

  app.on('issues.edited', async(context) => {
    const issue = context.payload.issue;

    if (responses.has(issue.id)) {
      const links = parser.parseComment(issue.body);
      const existingResponseId = responses.get(issue.id) as number;

      if (links.length) {
        const issueComment = context.issue({comment_id: existingResponseId, body: await makeResponse(links)});
        context.github.issues.updateComment(issueComment);
      } else {
        context.github.issues.deleteComment(context.issue({comment_id: existingResponseId}));
        responses.delete(issue.id);
      }
    }
  });

  app.on('issue_comment.edited', async(context) => {
    const comment = context.payload.comment;

    if (responses.has(comment.id)) {
      const existingResponseId = responses.get(comment.id) as number;
      const links = parser.parseComment(comment.body);

      if (links.length) {
        const issueComment = context.issue({comment_id: existingResponseId, body: await makeResponse(links)});
        context.github.issues.updateComment(issueComment);
      } else {
        context.github.issues.deleteComment(context.issue({comment_id: existingResponseId}));
        responses.delete(comment.id);
      }
    }
  });

  app.on('issue_comment.deleted', async(context) => {
    const comment = context.payload.comment;

    if (responses.has(comment.id)) {
      const existingResponseId = responses.get(comment.id) as number;
      context.github.issues.deleteComment(context.issue({comment_id: existingResponseId}));
      responses.delete(comment.id);
    }
  });
}
