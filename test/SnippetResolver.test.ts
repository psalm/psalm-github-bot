import { SnippetResolver } from '../src/SnippetResolver'
import nock from 'nock'

describe('SnippetResolver', () => {
  let resolver: SnippetResolver;

  beforeAll((done: Function) => {
    resolver = new SnippetResolver;
    done();
  });

  beforeEach(() => {
    nock.disableNetConnect()
  });

  test('fetches snippet text from psalm.dev', async() => {
    const expectedRequest = nock('https://psalm.dev')
      .get('/r/whatever/raw')
      .reply(200, '<?php whatever();');

    nock('https://psalm.dev')
      .get('/r/whatever/results')
      .reply(200, {});

    await resolver.resolve('whatever');
    expect(expectedRequest.isDone()).toBeTruthy();
  });

  test('fetches results from psalm.dev', async() => {
    nock('https://psalm.dev')
      .get('/r/whatever/raw')
      .reply(200, '<?php whatever();');

    const expectedRequest = nock('https://psalm.dev')
      .get('/r/whatever/results')
      .reply(200, {
        results: [], 
        version: 'dev-master@6236a30bf51ad7a0b9baeef380ca3923aa3e6726',
        fixed_contents: null,
        hash: '37a9c929671770c6aba45e9af8072f19'
      });

    await resolver.resolve('whatever');
    expect(expectedRequest.isDone()).toBeTruthy();
  });

  test('returns text content of the snippet', async() => {
    nock('https://psalm.dev')
      .get('/r/whatever/raw')
      .reply(200, '<?php whatever();');

    nock('https://psalm.dev')
      .get('/r/whatever/results')
      .reply(200, {
        results: [], 
        version: 'dev-master@6236a30bf51ad7a0b9baeef380ca3923aa3e6726',
        fixed_contents: null,
        hash: '37a9c929671770c6aba45e9af8072f19'
      });

    const resolved = await resolver.resolve('whatever');

    expect(resolved).toMatchObject({text: '<?php whatever();'});
  });

  test('returns check results of the snippet', async() => {
    nock('https://psalm.dev')
      .get('/r/whatever/raw')
      .reply(200, '<?php whatever();');

    nock('https://psalm.dev')
      .get('/r/whatever/results')
      .reply(200, {
        results: [], 
        version: 'dev-master@6236a30bf51ad7a0b9baeef380ca3923aa3e6726',
        fixed_contents: null,
        hash: '37a9c929671770c6aba45e9af8072f19'
      });

    const resolved = await resolver.resolve('whatever');
    expect(resolved).toMatchObject({
      results: {
        results: [],
        version: expect.stringMatching(/dev-master/),
        fixed_contents: null,
        hash: expect.stringMatching(/^[a-f0-9]+$/)
      }
    });
  });
});
