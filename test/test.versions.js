/**
 * Created by tushar.mathur on 29/12/15.
 */

'use strict'

import test from 'ava'
const moduleName = '../src/createComponentStream'
const createComponentStream1 = require(moduleName)
delete require.cache[require.resolve(moduleName)]
const createComponentStream2 = require(moduleName)

test('works with multiple versions', t => {
  const eventsFirst = []

  const Temp = createComponentStream2(createComponentStream1(
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
    }))

  const tmp = new Temp('first', eventsFirst)

  tmp.componentWillMount()
  tmp.componentWillUnmount()
  t.same(eventsFirst, [
    {event: 'WILL_MOUNT', instance: 'first'},
    {event: 'WILL_UNMOUNT', instance: 'first'}
  ])
})
