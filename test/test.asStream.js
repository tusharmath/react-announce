/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

import test from 'ava'
import 'babel-core/register'
import {asStream} from '../src/index'

test('disposes via addDisposable()', t => {
  const events = []
  const Temp = asStream(
    class Temp {
      getComponentStream (stateStream) {
        this.addDisposable(stateStream.subscribe(x => events.push(x.event)))
      }
    })
  const tmp = new Temp()
  tmp.componentWillMount()
  tmp.componentWillReceiveProps()
  tmp.componentWillUpdate()
  tmp.componentDidUpdate()
  tmp.componentWillUnmount()
  tmp.componentWillReceiveProps()
  tmp.componentWillReceiveProps()
  t.same(events, [
    'WILL_MOUNT',
    'WILL_RECEIVE_PROPS',
    'WILL_UPDATE',
    'DID_UPDATE',
    'WILL_UNMOUNT'
  ])
})

test('addDisposable must support multiple args', t => {
  const events = []
  const Temp = asStream(
    class Temp {
      getComponentStream (stateStream) {
        this.addDisposable(
          stateStream.subscribe(x => events.push(x.event)),
          stateStream.subscribe(x => events.push(x.event + '-SECOND')),
          stateStream.subscribe(x => events.push(x.event + '-THIRD'))
        )
      }
    })
  const tmp = new Temp()
  tmp.componentWillMount()
  tmp.componentWillReceiveProps()
  tmp.componentWillUpdate()
  tmp.componentDidUpdate()
  tmp.componentWillUnmount()
  tmp.componentWillReceiveProps()
  tmp.componentWillReceiveProps()
  t.same(events, [
    'WILL_MOUNT',
    'WILL_MOUNT-SECOND',
    'WILL_MOUNT-THIRD',
    'WILL_RECEIVE_PROPS',
    'WILL_RECEIVE_PROPS-SECOND',
    'WILL_RECEIVE_PROPS-THIRD',
    'WILL_UPDATE',
    'WILL_UPDATE-SECOND',
    'WILL_UPDATE-THIRD',
    'DID_UPDATE',
    'DID_UPDATE-SECOND',
    'DID_UPDATE-THIRD',
    'WILL_UNMOUNT',
    'WILL_UNMOUNT-SECOND',
    'WILL_UNMOUNT-THIRD'
  ])
})
test('disposes only once', t => {
  const events = []
  var i = 0
  const Temp = asStream(
    class Temp {
      getComponentStream (stateStream) {
        this.addDisposable({dispose: () => events.push(i++)})
      }
    })
  const t1 = new Temp()
  const t2 = new Temp()
  t1.componentWillMount()
  t1.componentWillUnmount()
  t2.componentWillMount()
  t2.componentWillUnmount()

  t.same(events, [0, 1])
})

test('create separate lifecycle streams per instance', t => {
  const eventsFirst = []
  const eventsSecond = []
  const Temp = asStream(
    class Temp {
      constructor (instance, eventsContainer) {
        this.instance = instance
        this.eventsContainer = eventsContainer
      }

      getComponentStream (stateStream) {
        this.addDisposable(stateStream.subscribe(x => {
          this.eventsContainer.push({event: x.event, instance: this.instance})
        }))
      }
    })
  const t1 = new Temp('first', eventsFirst)
  const t2 = new Temp('second', eventsSecond)
  t1.componentWillMount()
  t2.componentWillMount()
  t1.componentWillUnmount()
  t2.componentWillUnmount()
  t.same(eventsFirst, [
    {event: 'WILL_MOUNT', instance: 'first'},
    {event: 'WILL_UNMOUNT', instance: 'first'}
  ])

  t.same(eventsSecond, [
    {event: 'WILL_MOUNT', instance: 'second'},
    {event: 'WILL_UNMOUNT', instance: 'second'}
  ])
})

