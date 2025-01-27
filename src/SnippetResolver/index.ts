import type {Logger} from 'pino';
import {performance, PerformanceObserver} from 'perf_hooks';
import util from 'util';
import {LinkEntry} from '../CommentParser';

export class SnippetResolver {
  log: Logger;
  obs: PerformanceObserver;

  constructor(log: Logger) {
    this.log = log;
    this.obs = new PerformanceObserver(list => {
      this.log.debug('Logging the performance marks: %s', JSON.stringify(list))
      list.getEntries().forEach(entry => this.log.info('%s: %dms', entry.name, entry.duration))
    })
    this.obs.observe({entryTypes: ['measure']})
  }

  async resolve(link: LinkEntry): Promise<ResolvedSnippet> {
    this.log.debug('Resolving snippet: %s', link.snippet)
    const url = `https://psalm.dev/r/${link.snippet}`;

    const startMark = util.format('start resolving %s', link.snippet)
    const snippetReceivedMark = util.format('snippet received %s', link.snippet)
    const resultsReceivedMark = util.format('results received %s', link.snippet)

    performance.mark(startMark)

    const text = await fetch(`${url}/raw`)
      .then(async(response) => await response.text())

    performance.mark(snippetReceivedMark)

    const response = await fetch(`${url}/results` + (link.params.length ? ('?' + link.params) : ''))
    let results = { error: { message: 'Bot failed to fetch results' } } as any
    const body = await response.text()
    if (body.length) {
      try {
        results = JSON.parse(body)
      } catch (ex) {
        results = { error: { message: 'Failed to parse results: ' + body } } as any
      }
    } else {
      results = { error: { message: 'Failed to parse results: (received no output)' } } as any
    }

    performance.mark(resultsReceivedMark)

    performance.measure(
      util.format('Fetching snippet %s', link.snippet),
      startMark,
      snippetReceivedMark
    )
    performance.measure(
      util.format('Fetching results for %s', link.snippet),
      snippetReceivedMark,
      resultsReceivedMark
    )
    performance.measure(
      util.format('Total for %s', link.snippet),
      startMark,
      resultsReceivedMark
    )

    return {
      link: url,
      text: text,
      results: results.error === undefined ? results : null,
      internalError: results.error === undefined ? null : results.error
    }
  }
}

export interface ResolvedSnippet {
  link: string;
  text: string;
  results: SnippetResults|null;
  internalError: SnippetInternalError|null;
}

export interface SnippetResults {
  results: SnippetIssue[];
  version: string;
  fixed_contents?: string;
  hash: string;
}

export interface SnippetInternalError {
  message: string
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
