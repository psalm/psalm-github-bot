"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotFactory = exports.Bot = void 0;
var CommentParser_1 = require("../CommentParser");
var Responder_1 = require("../Responder");
var SnippetResolver_1 = require("../SnippetResolver");
var Utils_1 = require("../Utils");
var Bot = /** @class */ (function () {
    function Bot(parser, resolver, responder) {
        this.parser = parser;
        this.resolver = resolver;
        this.responder = responder;
        this.responses = new Map();
    }
    Bot.prototype.onIssueOpened = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var responded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.respond(context)];
                    case 1:
                        responded = _a.sent();
                        if (!(false === responded)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.greet(context)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Bot.prototype.onIssueCommentCreated = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.respond(context)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Bot.prototype.onIssueEdited = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.updateResponse(context)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Bot.prototype.onIssueCommentEdited = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.updateResponse(context)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Bot.prototype.onIssueCommentDeleted = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.deleteResponse(context)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Bot.prototype.onPullRequestOpened = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.respond(context)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Bot.prototype.onPullRequestEdited = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.updateResponse(context)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Bot.prototype.greet = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var issue, issueComment, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        issue = context.payload.issue;
                        if (!this.responder.shouldGreet((_a = issue.body) !== null && _a !== void 0 ? _a : '', context.payload.repository.full_name)) return [3 /*break*/, 3];
                        issueComment = context.issue({
                            body: this.responder.greet(issue.user.login)
                        });
                        return [4 /*yield*/, (0, Utils_1.delay)(1000)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, context.octokit.issues.createComment(issueComment)];
                    case 2:
                        result = _b.sent();
                        this.responses.set(issue.id, result.data.id);
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Bot.prototype.respond = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var respondingTo, links, issueComment, _a, _b, result;
            var _c;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (context.isBot) {
                            return [2 /*return*/, null];
                        }
                        if ('comment' in context.payload) {
                            respondingTo = context.payload.comment;
                        }
                        else if ('pull_request' in context.payload) {
                            respondingTo = context.payload.pull_request;
                        }
                        else {
                            respondingTo = context.payload.issue;
                        }
                        links = this.parser.parseComment((_d = respondingTo.body) !== null && _d !== void 0 ? _d : '');
                        if (!links.length) return [3 /*break*/, 4];
                        _b = (_a = context).issue;
                        _c = {};
                        return [4 /*yield*/, this.makeResponse(links)];
                    case 1:
                        issueComment = _b.apply(_a, [(_c.body = _e.sent(),
                                _c)]);
                        return [4 /*yield*/, (0, Utils_1.delay)(1000)];
                    case 2:
                        _e.sent();
                        return [4 /*yield*/, context.octokit.issues.createComment(issueComment)];
                    case 3:
                        result = _e.sent();
                        this.responses.set(respondingTo.id, result.data.id);
                        _e.label = 4;
                    case 4: return [2 /*return*/, false];
                }
            });
        });
    };
    Bot.prototype.updateResponse = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var respondingTo, existingResponseId, links, issueComment, _a, _b;
            var _c;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if ('comment' in context.payload) {
                            respondingTo = context.payload.comment;
                        }
                        else if ('pull_request' in context.payload) {
                            respondingTo = context.payload.pull_request;
                        }
                        else {
                            respondingTo = context.payload.issue;
                        }
                        if (!this.responses.has(respondingTo.id)) return [3 /*break*/, 5];
                        existingResponseId = this.responses.get(respondingTo.id);
                        links = this.parser.parseComment((_d = respondingTo.body) !== null && _d !== void 0 ? _d : '');
                        if (!links.length) return [3 /*break*/, 3];
                        _b = (_a = context).issue;
                        _c = {
                            comment_id: existingResponseId
                        };
                        return [4 /*yield*/, this.makeResponse(links)];
                    case 1:
                        issueComment = _b.apply(_a, [(_c.body = _e.sent(),
                                _c)]);
                        return [4 /*yield*/, context.octokit.issues.updateComment(issueComment)];
                    case 2:
                        _e.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, context.octokit.issues.deleteComment(context.issue({
                            comment_id: existingResponseId
                        }))];
                    case 4:
                        _e.sent();
                        this.responses.delete(respondingTo.id);
                        _e.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Bot.prototype.deleteResponse = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var comment, existingResponseId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        comment = context.payload.comment;
                        if (!this.responses.has(comment.id)) return [3 /*break*/, 2];
                        existingResponseId = this.responses.get(comment.id);
                        return [4 /*yield*/, context.octokit.issues.deleteComment(context.issue({
                                comment_id: existingResponseId
                            }))];
                    case 1:
                        _a.sent();
                        this.responses.delete(comment.id);
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Bot.prototype.makeResponse = function (links) {
        return __awaiter(this, void 0, void 0, function () {
            var resolvedSnippets;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(links.map(function (entry) { return _this.resolver.resolve(entry); }))];
                    case 1:
                        resolvedSnippets = _a.sent();
                        return [2 /*return*/, this.responder.snippetResponse(resolvedSnippets)];
                }
            });
        });
    };
    return Bot;
}());
exports.Bot = Bot;
var BotFactory = /** @class */ (function () {
    function BotFactory() {
    }
    BotFactory.make = function (app) {
        return new Bot(new CommentParser_1.CommentParser(), new SnippetResolver_1.SnippetResolver(app.log), new Responder_1.Responder());
    };
    return BotFactory;
}());
exports.BotFactory = BotFactory;
//# sourceMappingURL=index.js.map