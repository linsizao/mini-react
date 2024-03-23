import React from '../core/React'
import { it, expect, describe } from 'vitest'

describe('createElement', () => {
  it('props is null', () => {
    const el = React.createElement('div', null, 'test')

    expect(el).toEqual({
      type: 'div',
      props: {
        children: [{
          type: 'TEXT_ELEMENT',
          props: {
            nodeValue: 'test',
            children: []
          }
        }]
      }
    })
  })

  it('should return vdom for element', () => {
    const el = React.createElement('div', {id: 'id'}, 'test')

    expect(el).toEqual({
      type: 'div',
      props: {
        id: 'id',
        children: [{
          type: 'TEXT_ELEMENT',
          props: {
            nodeValue: 'test',
            children: []
          }
        }]
      }
    })
  })
})
