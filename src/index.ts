import { Probot } from 'probot' // eslint-disable-line no-unused-vars
import { BotFactory } from './Bot'

export = (app: Probot) => {
  const bot = BotFactory.make(app)

  app.on('issues.opened', bot.onIssueOpened.bind(bot))
  app.on('issue_comment.created', bot.onIssueCommentCreated.bind(bot))
  app.on('issues.edited', bot.onIssueEdited.bind(bot))
  app.on('issue_comment.edited', bot.onIssueCommentEdited.bind(bot))
  app.on('issue_comment.deleted', bot.onIssueCommentDeleted.bind(bot))
  app.on('pull_request.opened', bot.onPullRequestOpened.bind(bot))
  app.on('pull_request.edited', bot.onPullRequestEdited.bind(bot))
}
