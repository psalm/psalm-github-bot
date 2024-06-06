import { ResolvedSnippet } from "../SnippetResolver";
export declare class Responder {
    greet(login: string): string;
    shouldGreet(issue: string, repoName: string): boolean;
    snippetResponse(resolvedSnippets: ResolvedSnippet[]): string;
    private formatSnippet;
    private formatSnippetOutput;
    private formatInternalError;
    private formatSnippetResult;
    private formatSnippetIssue;
}
