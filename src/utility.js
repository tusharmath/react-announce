/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

import _ from 'lodash'

export const callIfExists = (orig, ctx, args) => orig ? orig.apply(ctx, args) : undefined

export const extendFunction = (...methods) => function () {
  return _.map(methods, x => callIfExists(x, this, arguments))
}

export const extendMethod = (src, overrides) => {
  _.each(overrides, (v, k) => {
    src[k] = extendFunction(src[k], v)
  })
  return src
}

export const decorate = _.curry((options, component) => {
  var {prototype} = _.isEmpty(options.flow) ? component : _.spread(_.flow)(options.flow)(component)
  _.defaults(prototype, options.defaults)
  extendMethod(prototype, options.overrides)
  return component
})

export const isDisposable = i => _.isFunction(_.get(i, 'dispose'))
