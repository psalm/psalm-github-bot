import {Context, Probot} from "probot";
import {CommentParser, LinkEntry} from '../CommentParser';
import {Responder} from "../Responder";
import {SnippetResolver} from "../SnippetResolver";
import {delay} from '../Utils';

export class Bot {

  parser: CommentParser;
  resolver: SnippetResolver;
  responder: Responder;
  responses: Map<number, number>;

  constructor(parser: CommentParser, resolver: SnippetResolver, responder: Responder) {
    this.parser = parser
    this.resolver = resolver
    this.responder = responder
    this.responses = new Map()
  }

  async onIssueOpened(context: Context<'issues.opened'>) {
    const responded = await this.respond(context)
    if (false === responded) {
      await this.greet(context)
    }
  }

  async onIssueCommentCreated(context: Context<'issue_comment.created'>) {
    await this.respond(context)
  }

  async onIssueEdited(context: Context<'issues.edited'>) {
    await this.updateResponse(context)
  }

  async onIssueCommentEdited(context: Context<'issue_comment.edited'>) {
    await this.updateResponse(context)
  }

  async onIssueCommentDeleted(context: Context<'issue_comment.deleted'>) {
    await this.deleteResponse(context);
  }

  async onPullRequestOpened(context: Context<'pull_request.opened'>) {
    await this.respond(context)
  }

  async onPullRequestEdited(context: Context<'pull_request.edited'>) {
    await this.updateResponse(context)
  }


  private async greet(context: Context<'issues'>) {
    const issue = context.payload.issue
    if (this.responder.shouldGreet(issue.body ?? '', context.payload.repository.full_name)) {
      const issueComment = context.issue({
        body: this.responder.greet(issue.user.login)
      })
      await delay(1000)
      const result = await context.octokit.issues.createComment(issueComment)
      this.responses.set(issue.id, result.data.id)
    }
  }

  private async respond(
    context: Context<'issues' | 'issue_comment' | 'pull_request'>
  ): Promise<boolean | null> {
    if (context.isBot) {
      return null
    }

    let respondingTo;
    if ('comment' in context.payload) {
      respondingTo = context.payload.comment
    } else if('pull_request' in context.payload) {
      respondingTo = context.payload.pull_request
    } else {
      respondingTo = context.payload.issue
    }

    const links = this.parser.parseComment(respondingTo.body ?? '')
    if (links.length) {
      const issueComment = context.issue({
        body: await this.makeResponse(links)
      })
      await delay(1000)
      const result = await context.octokit.issues.createComment(issueComment)

      this.responses.set(respondingTo.id, result.data.id)
    }
    return false
  }


  private async updateResponse(context: Context<'issues' | 'issue_comment' | 'pull_request'>) {
    let respondingTo;
    if ('comment' in context.payload) {
      respondingTo = context.payload.comment
    } else if ('pull_request' in context.payload) {
      respondingTo = context.payload.pull_request
    } else {
      respondingTo = context.payload.issue
    }

    if (this.responses.has(respondingTo.id)) {
      const existingResponseId = this.responses.get(respondingTo.id) as number
      const links = this.parser.parseComment(respondingTo.body ?? '')

      if (links.length) {
        const issueComment = context.issue({
          comment_id: existingResponseId,
          body: await this.makeResponse(links)
        })
        await context.octokit.issues.updateComment(issueComment)
      } else {
        await context.octokit.issues.deleteComment(context.issue({
          comment_id: existingResponseId
        }))
        this.responses.delete(respondingTo.id)
      }
    }
  }


  private async deleteResponse(context: Context<'issue_comment'>) {
    const comment = context.payload.comment;
    if (this.responses.has(comment.id)) {
      const existingResponseId = this.responses.get(comment.id) as number;
      await context.octokit.issues.deleteComment(context.issue({
        comment_id: existingResponseId
      }));
      this.responses.delete(comment.id);
    }
  }

  private async makeResponse(links: LinkEntry[]): Promise<string> {
    const resolvedSnippets = await Promise.all(
      links.map(entry => this.resolver.resolve(entry))
    )
    return this.responder.snippetResponse(resolvedSnippets)
  }
}

export class BotFactory {
  static make(app: Probot): Bot {
    return new Bot(
      new CommentParser(),
      new SnippetResolver(app.log),
      new Responder()
    )
  }
}
