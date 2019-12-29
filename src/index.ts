import { Application } from 'probot' // eslint-disable-line no-unused-vars
import { CommentParser, LinkEntry } from './CommentParser' // eslint-disable-line no-unused-vars
import { SnippetResolver } from './SnippetResolver'
import { execSync } from 'child_process'

export = (app: Application) => {
  const parser = new CommentParser()
  const resolver = new SnippetResolver()

  const makeResponse = async (links: LinkEntry[]): Promise<string> => {
    const resolvedSnippets = await Promise.all(
      links.map(
        entry =>
          resolver.resolve(entry.snippet)
            .then(
              result => {
                return { ...result, link: entry.link }
              }
            )
      )
    )

    return `I found these snippets:
${resolvedSnippets.map(snippet => {
  const snippetCode = `<summary>${snippet.link}</summary>

\`\`\`php
${snippet.text}
\`\`\`
`
  let snippetOutput = ''
  if (snippet.internalError !== null) {
    snippetOutput = `\`\`\`
Psalm encountered an internal error:

${snippet.internalError.message}
\`\`\``
  } else if (snippet.results !== null) {
    snippetOutput = `\`\`\`
Psalm output (using commit ${snippet.results.version.split('@')[1].substr(0, 7)}):

${snippet.results.results.length ? snippet.results.results.map(issue => `${issue.severity.toUpperCase()}: ${issue.type} - ${issue.line_from}:${issue.column_from} - ${issue.message}`).join('\n\n') : 'No issues!'}
\`\`\``
  }
  return `<details>
${snippetCode}
${snippetOutput}
</details>`
}).join('\n')} `
  }

  const makeGreeting = (login: string): string => `Hey @${login}, can you reproduce the issue on https://psalm.dev ?`

  const responses: Map<number, number> = new Map()

  const delay = async (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

  app.on('issues.opened', async (context) => {
    if (!context.isBot) {
      const issue = context.payload.issue
      const links = parser.parseComment(issue.body)

      if (links.length) {
        const issueComment = context.issue({ body: await makeResponse(links) })
        await delay(1000)
        const result = await context.github.issues.createComment(issueComment)

        responses.set(issue.id, result.data.id)
      } else if (!/psalm\.dev/.test(issue.body)) {
        const issueComment = context.issue({ body: makeGreeting(issue.user.login) })
        await delay(1000)
        const result = await context.github.issues.createComment(issueComment)
        responses.set(issue.id, result.data.id)
      }
    }
  })

  app.on('issue_comment.created', async (context) => {
    if (!context.isBot) {
      const comment = context.payload.comment

      const links = parser.parseComment(comment.body)
      if (links.length) {
        const issueComment = context.issue({ body: await makeResponse(links) })
        await delay(1000)
        const result = await context.github.issues.createComment(issueComment)

        responses.set(comment.id, result.data.id)
      }
    }
  })

  app.on('issues.edited', async (context) => {
    const issue = context.payload.issue

    if (responses.has(issue.id)) {
      const links = parser.parseComment(issue.body)
      const existingResponseId = responses.get(issue.id) as number

      if (links.length) {
        const issueComment = context.issue({ comment_id: existingResponseId, body: await makeResponse(links) })
        context.github.issues.updateComment(issueComment)
      } else {
        context.github.issues.deleteComment(context.issue({ comment_id: existingResponseId }))
        responses.delete(issue.id)
      }
    }
  })

  app.on('issue_comment.edited', async (context) => {
    const comment = context.payload.comment

    if (responses.has(comment.id)) {
      const existingResponseId = responses.get(comment.id) as number
      const links = parser.parseComment(comment.body)

      if (links.length) {
        const issueComment = context.issue({ comment_id: existingResponseId, body: await makeResponse(links) })
        context.github.issues.updateComment(issueComment)
      } else {
        context.github.issues.deleteComment(context.issue({ comment_id: existingResponseId }))
        responses.delete(comment.id)
      }
    }
  })

  app.on('issue_comment.deleted', async (context) => {
    const comment = context.payload.comment

    if (responses.has(comment.id)) {
      const existingResponseId = responses.get(comment.id) as number
      context.github.issues.deleteComment(context.issue({ comment_id: existingResponseId }))
      responses.delete(comment.id)
    }
  })

  if (process.env.DEPLOYMENTS_ENABLED) {
    app.on('release.published', async (context) => {
      if (context.payload.repository.full_name !== process.env.DEPLOYMENTS_REPO) {
        return
      }
      if (context.payload.release.prerelease && (process.env.DEPLOYMENTS_ENABLED !== 'all')) {
        return
      }
      const release = context.payload.release

      const commands = [
        'git fetch origin',
        `git checkout "${release.tag_name}"`,
        `git reset --hard "${release.tag_name}"`,
        'npm install',
        'npm run-script build',
        'command -v refresh >/dev/null 2>&1 && refresh || true'
      ]

      context.log.info(`Updating to release ${release.tag_name}`)

      for (const cmd of commands) {
        context.log.debug(
          `Running command: ${cmd}`,
          execSync(cmd).toString()
        )
      }

      context.log.info(`Updated to release ${release.tag_name}`)
    })
  }
}
