/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

const createComponentStream = require('./createComponentStream')
const addEventListener = require('./addEventListener')

module.exports = function (func) {
  return function () {
    const params = [].slice.call(arguments)
    return function (component) {
      component = createComponentStream(component)
      addEventListener(component, 'getInstanceStream', function (stream, dispose) {
        func.apply(this, [stream, dispose].concat(params))
      })
      return component
    }
  }
}
