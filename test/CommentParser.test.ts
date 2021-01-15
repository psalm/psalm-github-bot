import { CommentParser } from '../src/CommentParser'

describe('CommentParser', () => {
  let parser: CommentParser
  beforeAll((done: Function) => {
    parser = new CommentParser()
    done()
  })

  test('returns empty array when there are no links', () => {
    expect(parser.parseComment('No links here')).toEqual([])
  })

  test('returns a link when there is one', () => {
    expect(
      parser.parseComment('One link: https://psalm.dev/r/0f9f06ebd6')
    ).toEqual([
      { link: 'https://psalm.dev/r/0f9f06ebd6', snippet: '0f9f06ebd6', params: '' }
    ])
  })

  test('returns all links when there are many', () => {
    expect(
      parser.parseComment('psalm.dev/r/0f9f06ebd6 and psalm.dev/r/whatever are not the same')
    ).toEqual([
      { link: 'https://psalm.dev/r/0f9f06ebd6', snippet: '0f9f06ebd6', params: '' },
      { link: 'https://psalm.dev/r/whatever', snippet: 'whatever', params: '' }
    ])
  })

  test('can parse multiline comments', () => {
    const comment = `Some comment
  with multiple line may contain a link like this [snippet](https://psalm.dev/r/0f9f06ebd6) 
    and maybe some more psalm.dev/r/whatever.
    `
    expect(
      parser.parseComment(comment)
    ).toEqual([
      { link: 'https://psalm.dev/r/0f9f06ebd6', snippet: '0f9f06ebd6', params: '' },
      { link: 'https://psalm.dev/r/whatever', snippet: 'whatever', params: '' }
    ])
  })

  test('returns unique links', () => {
    expect(
      parser.parseComment('https://psalm.dev/r/0f9f06ebd6 and https://psalm.dev/r/0f9f06ebd6 are the same link')
    ).toEqual([
      { link: 'https://psalm.dev/r/0f9f06ebd6', snippet: '0f9f06ebd6', params: '' }
    ])
  })

  test('returns links with query params', () => {
    expect(
      parser.parseComment('see psalm.dev/r/92da00ab3c?php=7.3 - it should be resolved')
    ).toEqual([
      {
        link: 'https://psalm.dev/r/92da00ab3c?php=7.3',
        snippet: '92da00ab3c',
        params: 'php=7.3'
      }
    ])
  })

  test('returns empty string as params for links without params', () => {
    expect(
      parser.parseComment('One link: https://psalm.dev/r/0f9f06ebd6')[0].params
    ).toEqual('')
  })
})
