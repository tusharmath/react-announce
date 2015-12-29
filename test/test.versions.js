/**
 * Created by tushar.mathur on 29/12/15.
 */

'use strict'

import test from 'ava'
const moduleName = '../src/index'
const asStream1 = require(moduleName).asStream
delete require.cache[require.resolve('../src/asStream')]
delete require.cache[require.resolve(moduleName)]
const asStream2 = require(moduleName).asStream

test('works with multiple versions', t => {
  const eventsFirst = []

  const Temp = asStream2(asStream1(
    class Temp {
      constructor (instance, eventsContainer) {
        this.instance = instance
        this.eventsContainer = eventsContainer
      }

      getComponentStream (stateStream, dispose) {
        dispose(stateStream.subscribe(x => {
          this.eventsContainer.push({event: x.event, instance: this.instance})
        }))
      }
    }))

  const tmp = new Temp('first', eventsFirst)

  tmp.componentWillMount()
  tmp.componentWillUnmount()
  t.same(eventsFirst, [
    {event: 'WILL_MOUNT', instance: 'first'},
    {event: 'WILL_UNMOUNT', instance: 'first'}
  ])
})
