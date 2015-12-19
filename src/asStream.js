/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

import {filter, partial, each} from 'lodash'
import {BehaviorSubject} from 'rx'

import {decorate, isDisposable} from './utility'

export const asStream = component => {
  var disposables = []
  const stream = new BehaviorSubject()
  const onEvent = (event, ...args) => stream.onNext({event, args})
  const addDisposable = (...args) => filter(args, isDisposable).forEach(i => disposables.push(i))

  return decorate({
    defaults: {addDisposable},
    overrides: {
      componentWillMount: function () {
        onEvent('WILL_MOUNT')
        this.getComponentStream(stream)
      },
      componentWillUnmount (...args) {
        onEvent('WILL_UNMOUNT', ...args)
        each(disposables, x => x.dispose())
        disposables = []
      },
      componentDidMount: partial(onEvent, 'DID_MOUNT'),
      componentWillReceiveProps: partial(onEvent, 'WILL_RECEIVE_PROPS'),
      componentWillUpdate: partial(onEvent, 'WILL_UPDATE'),
      componentDidUpdate: partial(onEvent, 'DID_UPDATE')
    }
  }, component)
}
