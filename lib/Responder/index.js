"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Responder = void 0;
var Responder = /** @class */ (function () {
    function Responder() {
    }
    Responder.prototype.greet = function (login) {
        return "Hey @".concat(login, ", can you reproduce the issue on https://psalm.dev? These will be used as phpunit tests when implementing the feature or fixing this bug.");
    };
    Responder.prototype.shouldGreet = function (issue, repoName) {
        var allowedRepos = [
            'vimeo/psalm',
            'weirdan/psalm-github-bot'
        ];
        if (!allowedRepos.includes(repoName)) {
            return false;
        }
        var links = issue.match(/psalm\.dev(\/\w*)?/g);
        if (!links) {
            return true;
        }
        var validLinks = links.filter(function (link) { return !/psalm\.dev\/\d/.test(link); });
        if (null === validLinks) {
            return true;
        }
        if (!validLinks.length) {
            return true;
        }
        return false;
    };
    Responder.prototype.snippetResponse = function (resolvedSnippets) {
        var snippets = resolvedSnippets.map(this.formatSnippet.bind(this)).join('\n');
        return "I found these snippets:\n".concat(snippets);
    };
    Responder.prototype.formatSnippet = function (snippet) {
        var snippetCode = "<summary>".concat(snippet.link, "</summary>\n\n```php\n").concat(snippet.text, "\n```\n");
        var snippetOutput = this.formatSnippetOutput(snippet);
        return "<details>\n".concat(snippetCode, "\n").concat(snippetOutput, "\n</details>\n");
    };
    Responder.prototype.formatSnippetOutput = function (snippet) {
        if (snippet.internalError !== null) {
            return this.formatInternalError(snippet);
        }
        else if (snippet.results !== null) {
            return this.formatSnippetResult(snippet);
        }
        return '';
    };
    Responder.prototype.formatInternalError = function (snippet) {
        if (null === snippet.internalError) {
            throw new Error('expected to receive errored snippet');
        }
        return "```\nPsalm encountered an internal error:\n\n".concat(snippet.internalError.message, "\n```");
    };
    Responder.prototype.formatSnippetResult = function (snippet) {
        if (null === snippet.results) {
            throw new Error('expected to receive successful snippet');
        }
        return "```\nPsalm output (using commit ".concat(snippet.results.version.split('@')[1].substr(0, 7), "):\n\n").concat(snippet.results.results.length ? snippet.results.results.map(this.formatSnippetIssue.bind(this)).join('\n\n') : 'No issues!', "\n```");
    };
    Responder.prototype.formatSnippetIssue = function (issue) {
        return "".concat(issue.severity.toUpperCase(), ": ").concat(issue.type, " - ").concat(issue.line_from, ":").concat(issue.column_from, " - ").concat(issue.message);
    };
    return Responder;
}());
exports.Responder = Responder;
//# sourceMappingURL=index.js.map