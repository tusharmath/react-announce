/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

import {filter, isFunction, initial, flow, curry, last} from 'lodash'
import {asStream} from './asStream'
import {addEventListener} from './addEventListener'

export const createDeclarative = (func, ...declaratives) => {
  declaratives = filter(declaratives, isFunction)
  declaratives.push(asStream)
  return curry((...args) => {
    const params = initial(args)
    const component = flow(...declaratives)(last(args))
    addEventListener(component, 'getComponentStream', function (stream, dispose) {
      func.call(this, stream, dispose, ...params)
    })
    return component
  }, func.length - 1)
}

