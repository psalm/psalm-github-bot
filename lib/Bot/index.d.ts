import { Context, Probot } from "probot";
import { CommentParser } from '../CommentParser';
import { Responder } from "../Responder";
import { SnippetResolver } from "../SnippetResolver";
export declare class Bot {
    parser: CommentParser;
    resolver: SnippetResolver;
    responder: Responder;
    responses: Map<number, number>;
    constructor(parser: CommentParser, resolver: SnippetResolver, responder: Responder);
    onIssueOpened(context: Context<'issues.opened'>): Promise<void>;
    onIssueCommentCreated(context: Context<'issue_comment.created'>): Promise<void>;
    onIssueEdited(context: Context<'issues.edited'>): Promise<void>;
    onIssueCommentEdited(context: Context<'issue_comment.edited'>): Promise<void>;
    onIssueCommentDeleted(context: Context<'issue_comment.deleted'>): Promise<void>;
    onPullRequestOpened(context: Context<'pull_request.opened'>): Promise<void>;
    onPullRequestEdited(context: Context<'pull_request.edited'>): Promise<void>;
    private greet;
    private respond;
    private updateResponse;
    private deleteResponse;
    private makeResponse;
}
export declare class BotFactory {
    static make(app: Probot): Bot;
}
