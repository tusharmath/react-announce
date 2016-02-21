/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

const createComponentStream = require('./createComponentStream')
const addEventListener = require('./addEventListener')

module.exports = function (func) {
  const declaratives = [].slice
    .call(arguments, 1)
    .filter(x => typeof x === 'function')
  declaratives.push(createComponentStream)
  return function () {
    const params = [].slice.call(arguments)
    return function (component) {
      component = declaratives.reduce((c, d) => d(c), component)
      addEventListener(component, 'getInstanceStream', function (stream, dispose) {
        func.apply(this, [stream, dispose].concat(params))
      })
      return component
    }
  }
}
