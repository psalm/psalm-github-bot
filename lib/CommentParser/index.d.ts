export declare class CommentParser {
    parseComment(comment: string): LinkEntry[];
}
export interface LinkEntry {
    link: string;
    snippet: string;
    params: string;
}
