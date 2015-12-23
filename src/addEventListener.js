/**
 * Created by tushar.mathur on 23/12/15.
 */

'use strict'
const _ = require('lodash')

module.exports = (component, event, listener) => {
  const defaultListener = component.prototype[event]
  component.prototype[event] = function () {
    const args = _.toArray(arguments)
    if (defaultListener) {
      defaultListener.apply(this, args)
    }
    listener.apply(this, args)
  }
  return component
}
