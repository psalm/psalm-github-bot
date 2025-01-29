import { createNodeMiddleware, createProbot } from 'probot'
import app from './app'
import * as functions from '@google-cloud/functions-framework'

const middleware = createNodeMiddleware(app, { probot: createProbot() })
functions.http(
  'probotApp',
  async (req, res) => {
    // @ts-ignore TS1345 - it actually returns bool, despite the wrong type specified by Probot
    if (!await middleware(req, res)) {
      res.status(404).send('Not found')
    }
  }
)
