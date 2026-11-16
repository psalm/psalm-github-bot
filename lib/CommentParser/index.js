"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentParser = void 0;
var CommentParser = /** @class */ (function () {
    function CommentParser() {
    }
    CommentParser.prototype.parseComment = function (comment) {
        var matches;
        var snippets = [];
        var regexp = /psalm\.dev\/r\/(\w+)(\?(php=\d+\.\d+))?/g;
        var seen = new Set;
        while ((matches = regexp.exec(comment)) !== null) {
            if (seen.has(matches[0])) {
                continue;
            }
            snippets.push({
                link: 'https://' + matches[0],
                snippet: matches[1],
                params: matches[3] || ''
            });
            seen.add(matches[0]);
        }
        return snippets;
    };
    return CommentParser;
}());
exports.CommentParser = CommentParser;
//# sourceMappingURL=index.js.map