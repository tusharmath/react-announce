/**
 * Created by tushar.mathur on 23/12/15.
 */

'use strict'

export const addEventListener = (component, event, listener) => {
  const defaultListener = component.prototype[event]
  component.prototype[event] = function (...args) {
    if (defaultListener) {
      defaultListener.apply(this, args)
    }
    listener.apply(this, args)
  }
  return component
}
