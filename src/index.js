/**
 * Created by tushar.mathur on 19/12/15.
 */

'use strict'

import {asStream, addEventListener} from './asStream'
import {createDeclarative} from './createDeclarative'
import _ from 'lodash'

const createMockComponent = (_class) => {
  _.defaults(_class.prototype, {
    componentWillMount: _.noop,
    componentDidMount: _.noop,
    componentWillUpdate: _.noop,
    componentDidUpdate: _.noop,
    componentWillUnmount: _.noop,
    componentWillReceiveProps: _.noop
  })
  return _class
}

export default {
  asStream, createDeclarative, addEventListener, createMockComponent
}
