/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

import {filter, partial, each, isFunction, get, noop, defaults} from 'lodash'
import {BehaviorSubject} from 'rx'

const isDisposable = i => isFunction(get(i, 'dispose'))
const STREAM_SYMBOL = Symbol()
export const addEventListener = (component, event, listener) => {
  const defaultListener = component.prototype[event]
  component.prototype[event] = function (...args) {
    defaultListener.apply(this, args)
    listener.apply(this, args)
    if (defaultListener) {
      defaultListener.apply(this, args)
    }
  }
  return component
}
export const asStream = (component) => {
  /**
   * Do not apply the asStream decorator if applied already
   */
  if (component[STREAM_SYMBOL]) {
    return component
  }
  defaults(component.prototype, {getComponentStream: noop})
  const listen = partial(addEventListener, component)
  const stream = component[STREAM_SYMBOL] = new BehaviorSubject({component: null, event: null, args: null})
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

