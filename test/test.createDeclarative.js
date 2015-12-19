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
