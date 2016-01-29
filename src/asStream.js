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
const LIFECYCLE_EVENTS = [
  'componentWillMount',
  'componentDidMount',
  'componentWillReceiveProps',
  'componentWillUpdate',
  'componentDidUpdate',
  'componentWillUnmount'
]
const getEventName = x => _.chain(x.replace('component', '')).snakeCase().toUpper().value()

module.exports = component => {
  /**
   * Do not apply the asStream decorator if applied already
   */
  if (component[STREAM_KEY]) {
    return component
  }
  const dispatch = _.rest(function (event, args) {
    stream.onNext({component: this, event, args})
  })

  _.defaults(component.prototype, {getComponentStream: _.noop, dispatch})
  const listen = _.partial(addEventListener, component)
  const stream = component[STREAM_KEY] = new BehaviorSubject({component: null, event: null, args: null})

  const addDisposable = function () {
    const args = _.toArray(arguments)
    _.filter(args, isDisposable).forEach(x => this[DISPOSABLE_KEY].push(x))
  }

  _.each(LIFECYCLE_EVENTS, x => {
    var event = getEventName(x)
    listen(x, function () {
      const args = _.toArray(arguments)
      stream.onNext({component: this, event, args})
    })
  })

  listen('componentWillMount', function () {
    this[DISPOSABLE_KEY] = []
    this.getComponentStream(stream.filter(x => x.component === this), addDisposable.bind(this))
  })
  listen('componentWillUnmount', function () {
    _.each(this[DISPOSABLE_KEY], x => x.dispose())
  })

  return component
}

