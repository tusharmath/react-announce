/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

const _ = require('lodash')
const createComponentStream = require('./createComponentStream')
const addEventListener = require('./addEventListener')

module.exports = function (func) {
  const declaratives = _.filter(_.toArray(arguments).slice(1), _.isFunction)
  declaratives.push(createComponentStream)
  return function () {
    const params = _.toArray(arguments)
    return function (component) {
      component = _.spread(_.flow)(declaratives)(component)
      addEventListener(component, 'getInstanceStream', function (stream, dispose) {
        func.apply(this, [stream, dispose].concat(params))
      })
      return component
    }
  }
}
