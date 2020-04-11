import { Application } from 'probot' // eslint-disable-line no-unused-vars
import { BotFactory } from './Bot'

export = (app: Application) => {
  const bot = BotFactory.make(app)

  app.on('issues.opened', bot.onIssueOpened)
  app.on('issue_comment.created', bot.onIssueCommentCreated)
  app.on('issues.edited', bot.onIssueEdited)
  app.on('issue_comment.edited', bot.onIssueCommentEdited)
  app.on('issue_comment.deleted', bot.onIssueCommentDeleted)
  app.on('pull_request.opened', bot.onPullRequestOpened)
  app.on('pull_request.edited', bot.onPullRequestEdited)
}
