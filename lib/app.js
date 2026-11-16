"use strict";
var Bot_1 = require("./Bot");
module.exports = function (app) {
    var bot = Bot_1.BotFactory.make(app);
    app.on('issues.opened', bot.onIssueOpened.bind(bot));
    app.on('issue_comment.created', bot.onIssueCommentCreated.bind(bot));
    app.on('issues.edited', bot.onIssueEdited.bind(bot));
    app.on('issue_comment.edited', bot.onIssueCommentEdited.bind(bot));
    app.on('issue_comment.deleted', bot.onIssueCommentDeleted.bind(bot));
    app.on('pull_request.opened', bot.onPullRequestOpened.bind(bot));
    app.on('pull_request.edited', bot.onPullRequestEdited.bind(bot));
};
//# sourceMappingURL=app.js.map