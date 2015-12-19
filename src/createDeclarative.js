/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'
import {curry, filter, isFunction, initial, last} from 'lodash'

import {asStream} from './asStream'
import {decorate} from './utility'

export const createDeclarative = (func, ...flow) => {
  flow = filter(flow, isFunction)
  return curry((...args) => {
    const params = initial(args)
    const component = last(args)
    return decorate({
      flow: [asStream, ...flow],
      overrides: {
        getComponentStream: function (stream) {
          this.addDisposable(func.call(this, stream, ...params))
        }
      }
    }, component)
  }, func.length)
}
