/**
 * Created by tushar.mathur on 23/12/15.
 */

'use strict'

module.exports = (component, event, listener) => {
  const defaultListener = component.prototype[event]
  component.prototype[event] = function () {
    const args = [].slice.call(arguments)
    if (defaultListener) {
      defaultListener.apply(this, args)
    }
    listener.apply(this, args)
  }
  return component
}
