import { Application } from 'probot' // eslint-disable-line no-unused-vars
import { CommentParser, LinkEntry } from './CommentParser' // eslint-disable-line no-unused-vars
import { SnippetResolver } from './SnippetResolver'
import { Responder } from './Responder'

export = (app: Application) => {
  const parser = new CommentParser()
  const resolver = new SnippetResolver(app.log)
  const responder: Responder = new Responder()

  const makeResponse = async (links: LinkEntry[]): Promise<string> => {
    const resolvedSnippets = await Promise.all(
      links.map(entry => resolver.resolve(entry.snippet))
    )
    return responder.snippetResponse(resolvedSnippets)
  }

  const responses: Map<number, number> = new Map()

  const delay = async (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

  app.on('issues.opened', async (context) => {
    if (!context.isBot) {
      const issue = context.payload.issue
      const links = parser.parseComment(issue.body)

      if (links.length) {
        const issueComment = context.issue({
          body: await makeResponse(links)
        })
        await delay(1000)
        const result = await context.github.issues.createComment(issueComment)

        responses.set(issue.id, result.data.id)
      } else {
        const links = issue.body.match(/psalm\.dev/g);
        const validLinks = links?.filter(
          link => !/psalm\.dev\/\d{3}/.test(link)
        )
        app.log.debug(links)
        app.log.debug(validLinks)

        if (!validLinks || !validLinks.length) {
          const issueComment = context.issue({
            body: responder.greet(issue.user.login)
          })
          await delay(1000)
          const result = await context.github.issues.createComment(issueComment)
          responses.set(issue.id, result.data.id)
        }
      }
    }
  })

  app.on('issue_comment.created', async (context) => {
    if (!context.isBot) {
      const comment = context.payload.comment

      const links = parser.parseComment(comment.body)
      if (links.length) {
        const issueComment = context.issue({
          body: await makeResponse(links)
        })
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
        const issueComment = context.issue({
          comment_id: existingResponseId,
          body: await makeResponse(links)
        })
        context.github.issues.updateComment(issueComment)
      } else {
        context.github.issues.deleteComment(context.issue({
          comment_id: existingResponseId
        }))
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
        const issueComment = context.issue({
          comment_id: existingResponseId,
          body: await makeResponse(links)
        })
        context.github.issues.updateComment(issueComment)
      } else {
        context.github.issues.deleteComment(context.issue({
          comment_id: existingResponseId
        }))
        responses.delete(comment.id)
      }
    }
  })

  app.on('issue_comment.deleted', async (context) => {
    const comment = context.payload.comment

    if (responses.has(comment.id)) {
      const existingResponseId = responses.get(comment.id) as number
      context.github.issues.deleteComment(context.issue({
        comment_id: existingResponseId
      }))
      responses.delete(comment.id)
    }
  })
}
