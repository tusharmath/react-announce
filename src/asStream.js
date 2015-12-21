/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

import {filter, partial, each, isFunction, get} from 'lodash'
import {BehaviorSubject} from 'rx'

const isDisposable = i => isFunction(get(i, 'dispose'))
export const addEventListener = (component, event, listener) => {
  const defaultListener = component.prototype[event]
  component.prototype[event] = function (...args) {
    listener.apply(this, args)
    defaultListener.apply(this, args)
  }
  return component
}
export const asStream = (component) => {
  const prototype = component.prototype
  const listen = partial(addEventListener, component)
  const stream = new BehaviorSubject({component: null, event: null, args: null})
  const disposables = new WeakMap()
  const addDisposable = function (...args) {
    filter(args, isDisposable).forEach(x => disposables.get(this).push(x))
  }
  listen('componentWillMount', function (...args) {
    disposables.set(this, [])
    stream.onNext({component: this, event: 'WILL_MOUNT', args})
    this.getComponentStream(stream.filter(x => x.component === this), addDisposable.bind(this))
  })
  listen('componentDidMount', function (...args) {
    stream.onNext({component: this, event: 'DID_MOUNT', args})
  })
  listen('componentWillReceiveProps', function (...args) {
    stream.onNext({component: this, event: 'WILL_RECEIVE_PROPS', args})
  })
  listen('componentWillUpdate', function (...args) {
    stream.onNext({component: this, event: 'WILL_UPDATE', args})
  })
  listen('componentDidUpdate', function (...args) {
    stream.onNext({component: this, event: 'DID_UPDATE', args})
  })
  listen('componentWillUnmount', function (...args) {
    stream.onNext({component: this, event: 'WILL_UNMOUNT', args})
    each(disposables.get(this), x => x.dispose())
    disposables.delete(this)
  })

  return component
}

