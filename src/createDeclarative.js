/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

const _ = require('lodash')
const asStream = require('./asStream')
const addEventListener = require('./addEventListener')

module.exports = function (func) {
  const declaratives = _.filter(_.toArray(arguments).slice(1), _.isFunction)
  declaratives.push(asStream)
  var f = function () {
    const args = _.toArray(arguments)
    const params = _.initial(args)
    const component = _.spread(_.flow)(declaratives)(_.last(args))
    addEventListener(component, 'getInstanceStream', function (stream, dispose) {
      func.apply(this, [stream, dispose].concat(params))
    })
    return component
  }
  return _.curry(f, func.length - 1)
}
