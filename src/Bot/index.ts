import Webhooks from '@octokit/webhooks';
import {Context, Application} from "probot";
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

  async onIssueOpened(context:Context<Webhooks.WebhookPayloadIssues>) {
    console.log(this)
    const responded = await this.respond(context)
    if (false === responded) {
      await this.greet(context)
    }
  }

  async onIssueCommentCreated(context: Context<Webhooks.WebhookPayloadIssueComment>) {
    await this.respond(context)
  }

  async onIssueEdited(context: Context<Webhooks.WebhookPayloadIssues>) {
    await this.updateResponse(context)
  }

  async onIssueCommentEdited(context: Context<Webhooks.WebhookPayloadIssueComment>) {
    await this.updateResponse(context)
  }

  async onIssueCommentDeleted(context: Context<Webhooks.WebhookPayloadIssueComment>) {
    await this.deleteResponse(context);
  }

  async onPullRequestOpened(context: Context<Webhooks.WebhookPayloadPullRequest>) {
    await this.respond(context)
  }

  async onPullRequestEdited(context: Context<Webhooks.WebhookPayloadPullRequest>) {
    await this.updateResponse(context)
  }


  private async greet(context: Context<Webhooks.WebhookPayloadIssues>) {
    const issue = context.payload.issue
    if (this.responder.shouldGreet(issue.body)) {
      const issueComment = context.issue({
        body: this.responder.greet(issue.user.login)
      })
      await delay(1000)
      const result = await context.github.issues.createComment(issueComment)
      this.responses.set(issue.id, result.data.id)
    }
  }

  private async respond(context: Context<Webhooks.WebhookPayloadIssues>|Context<Webhooks.WebhookPayloadIssueComment>|Context<Webhooks.WebhookPayloadPullRequest>): Promise<boolean | null> {
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

    const links = this.parser.parseComment(respondingTo.body)
    if (links.length) {
      const issueComment = context.issue({
        body: await this.makeResponse(links)
      })
      await delay(1000)
      const result = await context.github.issues.createComment(issueComment)

      this.responses.set(respondingTo.id, result.data.id)
    }
    return false
  }


  private async updateResponse(context: Context<Webhooks.WebhookPayloadIssues>|Context<Webhooks.WebhookPayloadIssueComment>|Context<Webhooks.WebhookPayloadPullRequest>) {
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
      const links = this.parser.parseComment(respondingTo.body)

      if (links.length) {
        const issueComment = context.issue({
          comment_id: existingResponseId,
          body: await this.makeResponse(links)
        })
        await context.github.issues.updateComment(issueComment)
      } else {
        await context.github.issues.deleteComment(context.issue({
          comment_id: existingResponseId
        }))
        this.responses.delete(respondingTo.id)
      }
    }
  }


  private async deleteResponse(context: Context<Webhooks.WebhookPayloadIssueComment>) {
    const comment = context.payload.comment;
    if (this.responses.has(comment.id)) {
      const existingResponseId = this.responses.get(comment.id) as number;
      await context.github.issues.deleteComment(context.issue({
        comment_id: existingResponseId
      }));
      this.responses.delete(comment.id);
    }
  }

  private async makeResponse(links: LinkEntry[]): Promise<string> {
    const resolvedSnippets = await Promise.all(
      links.map(entry => this.resolver.resolve(entry.snippet))
    )
    return this.responder.snippetResponse(resolvedSnippets)
  }
}

export class BotFactory {
  static make(app: Application): Bot {
    return new Bot(
      new CommentParser(),
      new SnippetResolver(app.log),
      new Responder()
    )
  }
}
