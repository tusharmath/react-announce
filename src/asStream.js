/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

import {filter, partial, each} from 'lodash'
import {BehaviorSubject} from 'rx'

import {decorate, isDisposable} from './utility'

export const asStream = partial(decorate, {
  defaults: {
    addDisposable (...args) {
      filter(args, isDisposable).forEach(i => this.disposables.push(i))
    }
  },
  overrides: {
    componentWillMount (...args) {
      this.stream = new BehaviorSubject({event: 'WILL_MOUNT', args})
      this.disposables = []
      this.getComponentStream(this.stream)
    },
    componentWillUnmount (...args) {
      this.stream.onNext({event: 'WILL_UNMOUNT', args})
      each(this.disposables, x => x.dispose())
      this.stream.onCompleted()
    },
    componentDidMount (...args) {
      this.stream.onNext({event: 'DID_MOUNT', args})
    },
    componentWillReceiveProps (...args) {
      this.stream.onNext({event: 'WILL_RECEIVE_PROPS', args})
    },
    componentWillUpdate (...args) {
      this.stream.onNext({event: 'WILL_UPDATE', args})
    },
    componentDidUpdate (...args) {
      this.stream.onNext({event: 'DID_UPDATE', args})
    }
  }
})
