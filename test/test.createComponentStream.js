/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

import test from 'ava'
import createComponentStream from '../src/createComponentStream'

test('disposes via addDisposable()', t => {
  const events = []
  const Temp = createComponentStream(
    class Temp {
      getInstanceStream (stateStream, dispose) {
        dispose(stateStream.subscribe(x => events.push(x.event)))
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
  const Temp = createComponentStream(
    class Temp {
      getInstanceStream (stateStream, dispose) {
        dispose(
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
  const Temp = createComponentStream(
    class Temp {
      getInstanceStream (stateStream, dispose) {
        dispose({dispose: () => events.push(i++)})
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
  const Temp = createComponentStream(
    class Temp {
      constructor (instance, eventsContainer) {
        this.instance = instance
        this.eventsContainer = eventsContainer
      }

      getInstanceStream (stateStream, dispose) {
        dispose(stateStream.subscribe(x => {
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

test('create separate lifecycle streams per decoration', t => {
  const eventsFirst = []
  const eventsSecond = []
  const A = createComponentStream(
    class A {
      constructor (instance, eventsContainer) {
        this.instance = instance
        this.eventsContainer = eventsContainer
      }

      getInstanceStream (stateStream, dispose) {
        dispose(stateStream.subscribe(x => {
          this.eventsContainer.push({event: x.event, instance: this.instance})
        }))
      }
    })
  const B = createComponentStream(
    class B {
      constructor (instance, eventsContainer) {
        this.instance = instance
        this.eventsContainer = eventsContainer
      }

      getInstanceStream (stateStream, dispose) {
        dispose(stateStream.subscribe(x => {
          this.eventsContainer.push({event: x.event, instance: this.instance})
        }))
      }
    })
  const t1 = new A('first', eventsFirst)
  const t2 = new B('second', eventsSecond)
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

test('dispatch custom events', t => {
  const events = []
  const Temp = createComponentStream(
    class Temp {
      getInstanceStream (stateStream, dispose) {
        dispose(stateStream.subscribe(x => events.push(x)))
      }
    })
  const tmp = new Temp()
  tmp.dispatch('ALPHA', '0', '0', '0')
  tmp.componentWillMount()
  tmp.dispatch('BRAVO', '1', '1', '1')
  tmp.dispatch('CHARLIE', '2', '2')
  tmp.componentWillUnmount()
  tmp.dispatch('DELTA', '3')
  t.same(events, [
    {component: tmp, event: 'WILL_MOUNT', args: []},
    {component: tmp, event: 'BRAVO', args: ['1', '1', '1']},
    {component: tmp, event: 'CHARLIE', args: ['2', '2']},
    {component: tmp, event: 'WILL_UNMOUNT', args: []}
  ])
})
