/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

import {filter, isFunction, initial, flow, curry, last} from 'lodash'
import {asStream} from './asStream'

export const createDeclarative = (func, ...declaratives) => curry((...args) => {
  declaratives = filter(declaratives, isFunction)
  declaratives.push(asStream)
  const params = initial(args)
  const component = flow(...declaratives)(last(args))
  component.prototype.getComponentStream = function (stream, dispose) {
    func.call(this, stream, dispose, ...params)
  }
  return component
}, func.length - 1)

