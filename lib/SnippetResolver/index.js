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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnippetResolver = void 0;
var perf_hooks_1 = require("perf_hooks");
var util_1 = __importDefault(require("util"));
var SnippetResolver = /** @class */ (function () {
    function SnippetResolver(log) {
        var _this = this;
        this.log = log;
        this.obs = new perf_hooks_1.PerformanceObserver(function (list) {
            _this.log.debug('Logging the performance marks: %s', JSON.stringify(list));
            list.getEntries().forEach(function (entry) { return _this.log.info('%s: %dms', entry.name, entry.duration); });
        });
        this.obs.observe({ entryTypes: ['measure'] });
    }
    SnippetResolver.prototype.resolve = function (link) {
        return __awaiter(this, void 0, void 0, function () {
            var url, startMark, snippetReceivedMark, resultsReceivedMark, text, response, results, body;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log.debug('Resolving snippet: %s', link.snippet);
                        url = "https://psalm.dev/r/".concat(link.snippet);
                        startMark = util_1.default.format('start resolving %s', link.snippet);
                        snippetReceivedMark = util_1.default.format('snippet received %s', link.snippet);
                        resultsReceivedMark = util_1.default.format('results received %s', link.snippet);
                        perf_hooks_1.performance.mark(startMark);
                        return [4 /*yield*/, fetch("".concat(url, "/raw"))
                                .then(function (response) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, response.text()];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        text = _a.sent();
                        perf_hooks_1.performance.mark(snippetReceivedMark);
                        return [4 /*yield*/, fetch("".concat(url, "/results") + (link.params.length ? ('?' + link.params) : ''))];
                    case 2:
                        response = _a.sent();
                        results = { error: { message: 'Bot failed to fetch results' } };
                        return [4 /*yield*/, response.text()];
                    case 3:
                        body = _a.sent();
                        if (body.length) {
                            try {
                                results = JSON.parse(body);
                            }
                            catch (ex) {
                                results = { error: { message: 'Failed to parse results: ' + body } };
                            }
                        }
                        else {
                            results = { error: { message: 'Failed to parse results: (received no output)' } };
                        }
                        perf_hooks_1.performance.mark(resultsReceivedMark);
                        perf_hooks_1.performance.measure(util_1.default.format('Fetching snippet %s', link.snippet), startMark, snippetReceivedMark);
                        perf_hooks_1.performance.measure(util_1.default.format('Fetching results for %s', link.snippet), snippetReceivedMark, resultsReceivedMark);
                        perf_hooks_1.performance.measure(util_1.default.format('Total for %s', link.snippet), startMark, resultsReceivedMark);
                        return [2 /*return*/, {
                                link: url,
                                text: text,
                                results: results.error === undefined ? results : null,
                                internalError: results.error === undefined ? null : results.error
                            }];
                }
            });
        });
    };
    return SnippetResolver;
}());
exports.SnippetResolver = SnippetResolver;
//# sourceMappingURL=index.js.map