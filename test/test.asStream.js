/**
 * Created by tushar.mathur on 04/02/16.
 */

'use strict'

import {Subject} from 'rx'
import test from 'ava'
import asStream from '../src/asStream'
import {asStream as eAsStream} from '../src/index'

test('exports', t => {
  t.is(eAsStream, asStream)
})

test(t => {
  const out = []
  class Mock {
  }
  const fakeStore = new Subject()
  const MockH = asStream(fakeStore)(Mock)
  const m = new MockH()
  fakeStore.subscribe(x => out.push(x.event))
  m.componentWillMount()
  m.componentWillUnmount()
  t.same(out, ['WILL_MOUNT', 'WILL_UNMOUNT'])
})

test('dispose', t => {
  const out = []
  class Mock {
  }
  const fakeStore = new Subject()
  const MockH = asStream(fakeStore)(Mock)
  const m = new MockH()
  fakeStore.subscribe(x => out.push(x.event))
  m.componentWillMount()
  m.componentWillUnmount()
  m.componentWillReceiveProps()
  m.componentWillUnmount()
  m.componentWillMount()
  m.componentWillReceiveProps()
  m.componentWillUnmount()

  t.same(out, ['WILL_MOUNT', 'WILL_UNMOUNT', 'WILL_MOUNT', 'WILL_RECEIVE_PROPS', 'WILL_UNMOUNT'])
})

test('multiple:observers', t => {
  const out0 = []
  const out1 = []
  class Mock {
  }
  const fakeStore0 = new Subject()
  const fakeStore1 = new Subject()

  const MockH = asStream(fakeStore0, fakeStore1)(Mock)
  const m = new MockH()
  fakeStore0.subscribe(x => out0.push(x.event))
  fakeStore1.subscribe(x => out1.push(x.event))

  m.componentWillMount()
  m.componentWillUnmount()
  t.same(out0, ['WILL_MOUNT', 'WILL_UNMOUNT'])
  t.same(out1, ['WILL_MOUNT', 'WILL_UNMOUNT'])
})

test('multiple:instance', t => {
  const out = []
  class Mock {
    constructor (i) {
      this.instance = i
    }
  }
  const fakeStore = new Subject()
  const MockH = asStream(fakeStore)(Mock)
  const m0 = new MockH(0)
  const m1 = new MockH(1)
  fakeStore.subscribe(x => out.push({i: x.component.instance, e: x.event}))
  m0.componentWillMount()
  m1.componentWillMount()
  m0.componentWillUnmount()
  m1.componentWillUnmount()

  t.same(out, [
    {i: 0, e: 'WILL_MOUNT'},
    {i: 1, e: 'WILL_MOUNT'},
    {i: 0, e: 'WILL_UNMOUNT'},
    {i: 1, e: 'WILL_UNMOUNT'}
  ])
})

test('empty', t => {
  const out = []
  class Mock {
    getInstanceStream (stream, dispose) {
      stream.subscribe(x => out.push(x.event))
    }
  }
  const MockH = asStream()(Mock)
  const m0 = new MockH()

  m0.componentWillMount()
  m0.componentWillUnmount()
  t.same(out, [
    'WILL_MOUNT',
    'WILL_UNMOUNT'
  ])
})
