/**
 * Created by tushar.mathur on 04/02/16.
 */

'use strict'
const createDeclarative = require('./createDeclarative')

module.exports = function () {
  const stores = [].slice.call(arguments)
  return createDeclarative(function (stream, dispose, observers) {
    dispose.apply(null, observers.map(x => stream.subscribe(x)))
  })(stores)
}
