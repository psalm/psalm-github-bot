// End-to-end test through the Cloud Function entry point (src/index.ts).
//
// It uses the real Probot, the real ProbotOctokit and the real
// functions-framework wiring, and only mocks the network (GitHub API and
// psalm.dev) with nock. That way breaking changes in Probot or Octokit
// (e.g. createNodeMiddleware becoming async, octokit.issues moving to
// octokit.rest.issues) show up as test failures instead of production errors.

import { AddressInfo } from 'net'
import { Server } from 'http'
import { createHmac } from 'crypto'
import { readFileSync } from 'fs'
import { join } from 'path'
import nock from 'nock'

const WEBHOOK_SECRET = 'test-secret'

// createProbot() in src/index.ts reads its configuration from the environment
// at import time, so this has to be set before the module is loaded.
process.env.APP_ID = '123'
process.env.PRIVATE_KEY = readFileSync(join(__dirname, 'fixtures/mock-cert.pem'), 'utf8')
process.env.WEBHOOK_SECRET = WEBHOOK_SECRET
process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? 'fatal'

describe('probotApp cloud function', () => {
  let server: Server
  let baseUrl: string

  beforeAll(async () => {
    require('../src/index')
    const { getTestServer } = require('@google-cloud/functions-framework/testing')
    server = getTestServer('probotApp')
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  })

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve))
  })

  beforeEach(() => {
    nock.disableNetConnect()
    nock.enableNetConnect('127.0.0.1')
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  function sendWebhook (name: string, payload: object): Promise<Response> {
    const body = JSON.stringify(payload)
    const signature = 'sha256=' + createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex')
    return fetch(baseUrl + '/', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-github-event': name,
        'x-github-delivery': 'test-delivery-id',
        'x-hub-signature-256': signature
      },
      body
    })
  }

  test('replies to a comment containing a psalm.dev link', async () => {
    nock('https://psalm.dev')
      .get('/r/abc123/raw')
      .reply(200, '<?php echo 1;')
      .get('/r/abc123/results')
      .reply(200, { results: [], version: '123@abcdef123123', hash: 'abcdef' })

    nock('https://api.github.com')
      .post('/app/installations/42/access_tokens')
      .reply(200, { token: 'test-token', permissions: { issues: 'write' } })

    let postedBody: any
    const commentPosted = nock('https://api.github.com')
      .post('/repos/psalm/psalm-github-bot/issues/7/comments', (body: any) => {
        postedBody = body
        return true
      })
      .reply(201, { id: 1001 })

    const response = await sendWebhook('issue_comment', {
      action: 'created',
      installation: { id: 42 },
      repository: {
        name: 'psalm-github-bot',
        full_name: 'psalm/psalm-github-bot',
        owner: { login: 'psalm' }
      },
      issue: { number: 7, id: 700, body: 'issue body', user: { login: 'someone' } },
      comment: { id: 701, body: 'See https://psalm.dev/r/abc123', user: { login: 'someone', type: 'User' } },
      sender: { login: 'someone', type: 'User' }
    })

    // Probot answers 500 if a handler throws, so this catches runtime errors
    // in the bot itself, not only a missing comment.
    expect(response.status).toBe(200)
    expect(commentPosted.isDone()).toBe(true)
    expect(postedBody.body).toContain('https://psalm.dev/r/abc123')
  })

  test('responds 404 to unknown paths', async () => {
    const response = await fetch(baseUrl + '/not-a-webhook')
    expect(response.status).toBe(404)
  })
})
