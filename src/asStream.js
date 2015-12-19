/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

import {filter, partial, each, isFunction, get} from 'lodash'
import {BehaviorSubject} from 'rx'

const isDisposable = i => isFunction(get(i, 'dispose'))
const addListener = (component, event, listener) => {
  const defaultListener = component.prototype[event]
  component.prototype[event] = function (...args) {
    listener.apply(this, args)
    if (defaultListener) {
      defaultListener()
    }
  }
}
export const asStream = (component) => {
  const prototype = component.prototype
  const listen = partial(addListener, component)
  const stream = prototype.lifeCycleStream = new BehaviorSubject({context: null, event: null, args: null})
  prototype.disposables = new WeakMap()
  prototype.addDisposable = function (...disposables) {
    filter(disposables, isDisposable).forEach(x => prototype.disposables.get(this).push(x))
  }
  listen('componentWillMount', function (...args) {
    prototype.disposables.set(this, [])
    stream.onNext({context: this, event: 'WILL_MOUNT', args})
    this.getComponentStream(stream.filter(x => x.context === this))
  })
  listen('componentDidMount', function (...args) {
    stream.onNext({context: this, event: 'DID_MOUNT', args})
  })
  listen('componentWillReceiveProps', function (...args) {
    stream.onNext({context: this, event: 'WILL_RECEIVE_PROPS', args})
  })
  listen('componentWillUpdate', function (...args) {
    stream.onNext({context: this, event: 'WILL_UPDATE', args})
  })
  listen('componentDidUpdate', function (...args) {
    stream.onNext({context: this, event: 'DID_UPDATE', args})
  })
  listen('componentWillUnmount', function (...args) {
    stream.onNext({context: this, event: 'WILL_UNMOUNT', args})
    each(prototype.disposables.get(this), x => x.dispose())
    prototype.disposables.delete(this)
  })

  return component
}
