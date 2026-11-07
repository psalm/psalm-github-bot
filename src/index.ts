import { createNodeMiddleware, createProbot } from 'probot'
import app from './app'
import * as functions from '@google-cloud/functions-framework'

const middleware = createNodeMiddleware(app, { probot: createProbot(), webhooksPath: '/' })
functions.http(
  'probotApp',
  async (req, res) => {
    const handleRequest = await middleware
    // @ts-ignore TS1345 - it actually returns bool, despite the wrong type specified by Probot
    if (!await handleRequest(req, res)) {
      res.status(404).send('Not found')
    }
  }
)
