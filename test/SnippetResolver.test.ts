import { SnippetResolver } from '../src/SnippetResolver'
import nock from 'nock'
import Logger from 'bunyan'

jest.mock('bunyan')
const bunyan: jest.Mock<Logger> = Logger as any

describe('SnippetResolver', () => {
  let resolver: SnippetResolver

  beforeAll((done: Function) => {
    resolver = new SnippetResolver(new Logger({ name: 'probot' }))
    done()
  })

  beforeEach(() => {
    bunyan.mockClear()
    nock.disableNetConnect()
  })

  test('fetches snippet text from psalm.dev', async () => {
    const expectedRequest = nock('https://psalm.dev')
      .get('/r/whatever/raw')
      .reply(200, '<?php whatever();')

    nock('https://psalm.dev')
      .get('/r/whatever/results')
      .reply(200, {})

    await resolver.resolve('whatever')
    expect(expectedRequest.isDone()).toBeTruthy()
  })

  test('fetches results from psalm.dev', async () => {
    nock('https://psalm.dev')
      .get('/r/whatever/raw')
      .reply(200, '<?php whatever();')

    const expectedRequest = nock('https://psalm.dev')
      .get('/r/whatever/results')
      .reply(200, {
        results: [],
        version: 'dev-master@6236a30bf51ad7a0b9baeef380ca3923aa3e6726',
        fixed_contents: null,
        hash: '37a9c929671770c6aba45e9af8072f19'
      })

    await resolver.resolve('whatever')
    expect(expectedRequest.isDone()).toBeTruthy()
  })

  test('returns text content of the snippet', async () => {
    nock('https://psalm.dev')
      .get('/r/whatever/raw')
      .reply(200, '<?php whatever();')

    nock('https://psalm.dev')
      .get('/r/whatever/results')
      .reply(200, {
        results: [],
        version: 'dev-master@6236a30bf51ad7a0b9baeef380ca3923aa3e6726',
        fixed_contents: null,
        hash: '37a9c929671770c6aba45e9af8072f19'
      })

    const resolved = await resolver.resolve('whatever')

    expect(resolved).toMatchObject({ text: '<?php whatever();' })
  })

  test('returns check results of the snippet', async () => {
    nock('https://psalm.dev')
      .get('/r/whatever/raw')
      .reply(200, '<?php whatever();')

    nock('https://psalm.dev')
      .get('/r/whatever/results')
      .reply(200, {
        results: [],
        version: 'dev-master@6236a30bf51ad7a0b9baeef380ca3923aa3e6726',
        fixed_contents: null,
        hash: '37a9c929671770c6aba45e9af8072f19'
      })

    const resolved = await resolver.resolve('whatever')
    expect(resolved).toMatchObject({
      results: {
        results: [],
        version: expect.stringMatching(/dev-master/),
        fixed_contents: null,
        hash: expect.stringMatching(/^[a-f0-9]+$/)
      },
      internalError: null
    })
  })

  test('returns check results of a snippet with an internal error', async () => {
    nock('https://psalm.dev')
      .get('/r/whateverfail/raw')
      .reply(200, '<?php whatever();')

    nock('https://psalm.dev')
      .get('/r/whateverfail/results')
      .reply(200, {
        error: {
          message: 'Fatal error whatever in Foo.php',
          line: 387,
          type: 'psalm_error'
        }
      })

    const resolved = await resolver.resolve('whateverfail')
    expect(resolved).toMatchObject({
      results: null,
      internalError: {
        message: 'Fatal error whatever in Foo.php'
      }
    })
  })

  test('returns failure message when Psalm crashes with a fatal error', async () => {
    nock('https://psalm.dev')
      .get('/r/whateverfail/raw')
      .reply(200, '<?php whatever();')

    const fatalError = `<br />
<b>Fatal error</b>:  Allowed memory size of 268435456 bytes exhausted (tried to allocate 134218352 bytes) in <b>/var/www/vhosts/psalm.dev/httpdocs/vendor/vimeo/psalm/src/Psalm/Internal/Analyzer/Statements/Expression/AssertionFinder.php</b> on line <b>144</b><br />`

    nock('https://psalm.dev')
      .get('/r/whateverfail/results')
      .reply(200, fatalError, { 'content-type': 'text/html; charset=UTF-8' })

    const resolved = await resolver.resolve('whateverfail')
    expect(resolved).toMatchObject({
      results: null,
      internalError: {
        message: `Failed to parse results: ${fatalError}`
      }
    })
  })

  test('returns failure message when Psalm returns no results', async () => {
    nock('https://psalm.dev')
      .get('/r/whateverfail/raw')
      .reply(200, '<?php whatever();')

    nock('https://psalm.dev')
      .get('/r/whateverfail/results')
      .reply(500, '')

    const resolved = await resolver.resolve('whateverfail')
    expect(resolved).toMatchObject({
      results: null,
      internalError: {
        message: 'Failed to parse results: (received no output)'
      }
    })
  })
})
