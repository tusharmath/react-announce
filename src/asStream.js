/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'
const _ = require('lodash')
const BehaviorSubject = require('rx').BehaviorSubject
const addEventListener = require('./addEventListener')

const isDisposable = i => _.isFunction(_.get(i, 'dispose'))
const STREAM_KEY = '__componentStream__'
const DISPOSABLE_KEY = '__disposables__'

module.exports = component => {
  /**
   * Do not apply the asStream decorator if applied already
   */
  if (component[STREAM_KEY]) {
    return component
  }
  _.defaults(component.prototype, {getComponentStream: _.noop})
  const listen = _.partial(addEventListener, component)
  const stream = component[STREAM_KEY] = new BehaviorSubject({component: null, event: null, args: null})

  const addDisposable = function () {
    const args = _.toArray(arguments)
    _.filter(args, isDisposable).forEach(x => this[DISPOSABLE_KEY].push(x))
  }
  listen('componentWillMount', function () {
    const args = _.toArray(arguments)
    this[DISPOSABLE_KEY] = []

    stream.onNext({component: this, event: 'WILL_MOUNT', args})
    this.getComponentStream(stream.filter(x => x.component === this), addDisposable.bind(this))
  })
  listen('componentDidMount', function () {
    const args = _.toArray(arguments)
    stream.onNext({component: this, event: 'DID_MOUNT', args})
  })
  listen('componentWillReceiveProps', function () {
    const args = _.toArray(arguments)
    stream.onNext({component: this, event: 'WILL_RECEIVE_PROPS', args})
  })
  listen('componentWillUpdate', function () {
    const args = _.toArray(arguments)
    stream.onNext({component: this, event: 'WILL_UPDATE', args})
  })
  listen('componentDidUpdate', function () {
    const args = _.toArray(arguments)
    stream.onNext({component: this, event: 'DID_UPDATE', args})
  })
  listen('componentWillUnmount', function () {
    const args = _.toArray(arguments)
    stream.onNext({component: this, event: 'WILL_UNMOUNT', args})
    _.each(this[DISPOSABLE_KEY], x => x.dispose())
  })

  return component
}

