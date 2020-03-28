import Logger from 'bunyan'
import fetch from 'node-fetch'
import {performance, PerformanceObserver} from 'perf_hooks'

export class SnippetResolver {
  log: Logger;

  constructor(log: Logger) {
    this.log = log;
  }

  async resolve(snippetId: string): Promise<ResolvedSnippet> {
    const url = `https://psalm.dev/r/${snippetId}`

    const obs = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => this.log.info('%s: %dms', entry.name, entry.duration))
    })

    obs.observe({entryTypes: ['measure'], buffered: true})

    performance.mark('start resolving')

    const text = await fetch(`${url}/raw`)
      .then(async(response) => await response.text());

    performance.mark('snippet received')

    const results = await fetch(`${url}/results`)
      .then(async(response) => await response.json());

    performance.mark('results received')

    performance.measure(`Fetching snippet ${snippetId}`, 'start resolving', 'snippet received')
    performance.measure(`Fetching results for ${snippetId}`, 'snippet received', 'results received')
    performance.measure(`Total for ${snippetId}`, 'start resolving', 'results received')

    performance.clearMarks()
    obs.disconnect()

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
