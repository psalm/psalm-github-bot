const {createNodeMiddleware, createProbot} = require('probot')
const app = require('./lib/index.js')

exports.probotApp = createNodeMiddleware(app, { probot: createProbot() })
