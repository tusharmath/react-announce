/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

import test from 'ava'
import 'babel-core/register'
import {createDeclarative} from '../src/index'

test(t => {
  const out = []
  const declaration = createDeclarative(function (stream, dispose, param1, param2) {
    dispose(stream.subscribe(x => out.push({
      event: x.event,
      param1, param2
    })))
  })
  const Mock = declaration('A', 'B', () => null)
  const c = new Mock()
  c.componentWillMount()
  c.componentDidMount()
  t.same(out, [
    {event: 'WILL_MOUNT', param1: 'A', param2: 'B'},
    {event: 'DID_MOUNT', param1: 'A', param2: 'B'}
  ])
})

test('multiple decoration', t => {
  const out = []
  const declaration = createDeclarative(function (stream, dispose, param1, param2) {
    dispose(stream.subscribe(x => out.push({
      event: x.event,
      param1, param2
    })))
  })

  const Mock1 = declaration('A1', 'B1')(function Mock1 () {
  })
  const Mock2 = declaration('A2', 'B2', function Mock2 () {
  })

  const c1 = new Mock1()
  const c2 = new Mock2()
  c1.componentWillMount()
  c2.componentWillMount()
  c1.componentDidMount()
  c2.componentDidMount()
  t.same(out, [
    {event: 'WILL_MOUNT', param1: 'A1', param2: 'B1'},
    {event: 'WILL_MOUNT', param1: 'A2', param2: 'B2'},
    {event: 'DID_MOUNT', param1: 'A1', param2: 'B1'},
    {event: 'DID_MOUNT', param1: 'A2', param2: 'B2'}
  ])
})
