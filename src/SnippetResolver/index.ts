import Logger from 'bunyan';
import fetch from 'node-fetch';
import {performance, PerformanceObserver} from 'perf_hooks';
import util from 'util';

export class SnippetResolver {
  log: Logger;
  obs: PerformanceObserver;

  constructor(log: Logger) {
    this.log = log;
    this.obs = new PerformanceObserver(list => {
      this.log.debug('Logging the performance marks: %s', JSON.stringify(list))
      list.getEntries().forEach(entry => this.log.info('%s: %dms', entry.name, entry.duration))
    })
    this.obs.observe({entryTypes: ['measure'], buffered: true})
  }

  async resolve(snippetId: string): Promise<ResolvedSnippet> {
    this.log.debug('Resolving snippet: %s', snippetId)
    const url = `https://psalm.dev/r/${snippetId}`

    const startMark = util.format('start resolving %s', snippetId)
    const snippetReceivedMark = util.format('snippet received %s', snippetId)
    const resultsReceivedMark = util.format('results received %s', snippetId)

    performance.mark(startMark)

    const text = await fetch(`${url}/raw`)
      .then(async(response) => await response.text())

    performance.mark(snippetReceivedMark)

    const response = await fetch(`${url}/results`)
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
      util.format('Fetching snippet %s', snippetId),
      startMark,
      snippetReceivedMark
    )
    performance.measure(
      util.format('Fetching results for %s', snippetId),
      snippetReceivedMark,
      resultsReceivedMark
    )
    performance.measure(
      util.format('Total for %s', snippetId),
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
