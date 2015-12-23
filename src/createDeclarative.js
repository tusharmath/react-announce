/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

const _ = require('lodash')
const asStream = require('./asStream')
const addEventListener = require('./addEventListener')

module.exports = (func, ...declaratives) => {
  declaratives = _.filter(declaratives, _.isFunction)
  declaratives.push(asStream)
  return _.curry((...args) => {
    const params = _.initial(args)
    const component = _.flow(...declaratives)(_.last(args))
    addEventListener(component, 'getComponentStream', function (stream, dispose) {
      func.call(this, stream, dispose, ...params)
    })
    return component
  }, func.length - 1)
}

