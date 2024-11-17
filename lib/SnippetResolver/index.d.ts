import type { Logger } from 'pino';
import { PerformanceObserver } from 'perf_hooks';
import { LinkEntry } from '../CommentParser';
export declare class SnippetResolver {
    log: Logger;
    obs: PerformanceObserver;
    constructor(log: Logger);
    resolve(link: LinkEntry): Promise<ResolvedSnippet>;
}
export interface ResolvedSnippet {
    link: string;
    text: string;
    results: SnippetResults | null;
    internalError: SnippetInternalError | null;
}
export interface SnippetResults {
    results: SnippetIssue[];
    version: string;
    fixed_contents?: string;
    hash: string;
}
export interface SnippetInternalError {
    message: string;
}
export interface SnippetIssue {
    severity: string;
    line_from: number;
    line_to: number;
    type: string;
    message: string;
    file_name: string;
    file_path: string;
    snippet: string;
    selected_text: string;
    from: number;
    to: number;
    snippet_from: number;
    snippet_to: number;
    column_from: number;
    column_to: number;
}
