import { Responder } from '../src/Responder'
import { ResolvedSnippet } from '../src/SnippetResolver' // eslint-disable-line no-unused-vars

describe('Responder', () => {
  let responder: Responder
  let noIssuesSnippet: ResolvedSnippet
  let issuesSnippet: ResolvedSnippet
  let erroredSnippet: ResolvedSnippet

  beforeAll((done: Function) => {
    responder = new Responder()
    noIssuesSnippet = {
      link: 'https://psalm.dev/whatever',
      text: '<?php whatever();',
      results: {
        version: '123@abcdef123123',
        hash: 'abcdef',
        results: []
      },
      internalError: null
    }

    erroredSnippet = {
      link: 'https://psalm.dev/whatever',
      text: '<?php whatever();',
      results: null,
      internalError: {
        message: 'Internal error is internal'
      }
    }

    issuesSnippet = {
      link: 'https://psalm.dev/whatever',
      text: '<?php whatever();',
      results: {
        version: '123@abcdef123123',
        hash: 'abcdef',
        results: [{
          severity: 'ERROR',
          line_from: 1,
          line_to: 1,
          type: 'CircularDependency',
          message: 'Deps go in circles',
          file_name: 'filename.php',
          file_path: '/tmp/filename.php',
          snippet: 'whatever()',
          selected_text: 'whatever',
          from: 1,
          to: 1,
          snippet_from: 1,
          snippet_to: 1,
          column_from: 1,
          column_to: 1
        }]
      },
      internalError: null
    }

    done()
  })

  describe('Actual greeting', () => {
    test('Greeting text', () => {
      expect(responder.greet('aUser'))
        .toEqual('Hey @aUser, can you reproduce the issue on https://psalm.dev ?')
    })
  })

  describe('Greeting conditions', () => {
    test('Should greet when no links are provided', () => {
      expect(responder.shouldGreet('no links here')).toBe(true)
    })

    test('Should greet when issue shortcode is provided', () => {
      expect(responder.shouldGreet("I've got psalm.dev/053, ain't I'm lucky?")).toBe(true)
    })

    test('Should not greet when some other link to psalm.dev is provided', () => {
      expect(responder.shouldGreet("I can't reproduce on psalm.dev")).toBe(false)
    })

    test('Should not greet when non-issue and issue links are provided', () => {
      expect(responder.shouldGreet("I've got psalm.dev/053, but psalm.dev is wrong")).toBe(false)
    })
  })

  describe('Snippet responses', () => {
    test('Responds to single snippet with no issues', () => {
      expect(responder.snippetResponse([noIssuesSnippet]))
        .toEqual(`I found these snippets:
<details>
<summary>https://psalm.dev/whatever</summary>

\`\`\`php
<?php whatever();
\`\`\`

\`\`\`
Psalm output (using commit abcdef1):

No issues!
\`\`\`
</details>
`)
    })

    test('Responds to multiple snippets with no issues', () => {
      expect(responder.snippetResponse([noIssuesSnippet, noIssuesSnippet]))
        .toEqual(`I found these snippets:
<details>
<summary>https://psalm.dev/whatever</summary>

\`\`\`php
<?php whatever();
\`\`\`

\`\`\`
Psalm output (using commit abcdef1):

No issues!
\`\`\`
</details>

<details>
<summary>https://psalm.dev/whatever</summary>

\`\`\`php
<?php whatever();
\`\`\`

\`\`\`
Psalm output (using commit abcdef1):

No issues!
\`\`\`
</details>
`)
    })

    test('Responds to single snippet with issues', () => {
      expect(responder.snippetResponse([issuesSnippet]))
        .toEqual(`I found these snippets:
<details>
<summary>https://psalm.dev/whatever</summary>

\`\`\`php
<?php whatever();
\`\`\`

\`\`\`
Psalm output (using commit abcdef1):

ERROR: CircularDependency - 1:1 - Deps go in circles
\`\`\`
</details>
`)
    })

    test('Responds to single snippet with internal error', () => {
      expect(responder.snippetResponse([erroredSnippet]))
        .toEqual(`I found these snippets:
<details>
<summary>https://psalm.dev/whatever</summary>

\`\`\`php
<?php whatever();
\`\`\`

\`\`\`
Psalm encountered an internal error:

Internal error is internal
\`\`\`
</details>
`)
    })
  })
})
