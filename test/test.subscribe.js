/**
 * Created by tushar.mathur on 04/02/16.
 */

'use strict'

import {Subject} from 'rx'
import test from 'ava'
import subscribe from '../src/subscribe'

test(t => {
  const out = []
  class Mock {
  }
  const fakeStore = new Subject()
  const MockH = subscribe(fakeStore)(Mock)
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
  const MockH = subscribe(fakeStore)(Mock)
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

test('multiple', t => {
  const out0 = []
  const out1 = []
  class Mock {
  }
  const fakeStore0 = new Subject()
  const fakeStore1 = new Subject()

  const MockH = subscribe(fakeStore0, fakeStore1)(Mock)
  const m = new MockH()
  fakeStore0.subscribe(x => out0.push(x.event))
  fakeStore1.subscribe(x => out1.push(x.event))

  m.componentWillMount()
  m.componentWillUnmount()
  t.same(out0, ['WILL_MOUNT', 'WILL_UNMOUNT'])
  t.same(out1, ['WILL_MOUNT', 'WILL_UNMOUNT'])
})

