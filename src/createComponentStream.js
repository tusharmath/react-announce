/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'
const BehaviorSubject = require('rx').BehaviorSubject
const addEventListener = require('./addEventListener')
const getInstanceStream = () => void 0
const STREAM_KEY = '__componentStream__'
const DISPOSABLE_KEY = '__disposables__'
const LIFECYCLE_EVENTS = {
  'componentWillMount': 'WILL_MOUNT',
  'componentDidMount': 'DID_MOUNT',
  'componentWillReceiveProps': 'WILL_RECEIVE_PROPS',
  'componentWillUpdate': 'WILL_UPDATE',
  'componentDidUpdate': 'DID_UPDATE',
  'componentWillUnmount': 'WILL_UNMOUNT'
}

module.exports = component => {
  /**
   * Do not apply the createComponentStream decorator if applied already
   */
  if (component[STREAM_KEY]) {
    return component
  }
  const dispatch = function (event) {
    const args = [].slice.call(arguments, 1)
    stream.onNext({component: this, event, args})
  }

  const defaultProto = {getInstanceStream, dispatch}

  Object
    .keys(defaultProto)
    .filter(x => !component.prototype[x])
    .forEach(x => component.prototype[x] = defaultProto[x])

  const listen = function () {
    const args = [].slice.call(arguments, 0)
    return addEventListener.apply(this, [component, ...args])
  }
  const stream = component[STREAM_KEY] = new BehaviorSubject({component: null, event: null, args: null})

  const addDisposable = function () {
    const args = [].slice.call(arguments, 0)
    args.forEach(x => this[DISPOSABLE_KEY].push(x))
  }

  Object.keys(LIFECYCLE_EVENTS).forEach(x => {
    const event = LIFECYCLE_EVENTS[x]
    listen(x, function () {
      const args = [].slice.call(arguments, 0)
      stream.onNext({component: this, event, args})
    })
  })

  listen('componentWillMount', function () {
    this[DISPOSABLE_KEY] = []
    this.getInstanceStream(stream.filter(x => x.component === this), addDisposable.bind(this))
  })
  listen('componentWillUnmount', function () {
    this[DISPOSABLE_KEY].forEach(x => x.dispose())
  })

  return component
}
