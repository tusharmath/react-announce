# react-announce
[![Build Status][2]][3]
[![npm][4]][6]
[![Coverage Status][coverage-svg]][coverage]

A declarative approach to writing react components. Enables reuse of **component behaviors**.

## Installation

```
npm i react-announce --save
```
## API

### @asStream
`@asStream()` decorator lets any observer subscribe to the [lifecycle events][1] *(and also custom events that we will see later)* of the component.

```javascript
const Rx = require('rx')
const observerA = Rx.Observer.create(x => console.log('A', x))
const observerB = Rx.Observer.create(x => console.log('B', x))

@asStream(observerA, observerB)
class MyComponent extends Component {
  render () {
    return (<div>Hello World!</div>)
  }
}

/*
OUTPUT:

A {event: 'WILL_MOUNT', args: [], component: MyComponent {}}
B {event: 'WILL_MOUNT', args: [], component: MyComponent {}}
A {event: 'DID_MOUNT', args: [], component: MyComponent {}}
B {event: 'DID_MOUNT', args: [], component: MyComponent {}}

*/

```
 Every subscriber gets all the notification from all the instances of the `MyComponent` class, of each of its lifecycle and custom events. Each notification on the stream is fired with three keys —

 ```js
{
  "event": "WILL_MOUNT", /*DID_MOUNT, WILL_RECEIVE_PROPS, WILL_UPDATE, DID_UPDATE, WILL_UNMOUNT*/

  "args": [], /*the arguments with which the event was dispatched*/,

  "component": {} /*instance of the component*/
}
 ```

 Too improve performance, the subscriptions are only created once the component mounts and are automatically removed (disposed) as soon as it unmounts.

### getInstanceStream(stream: Observable, dispose: function)
Exposes the component events of only the CURRENT instance, as a stream and is always called with context of that instance. It is called as soon as the component is mounted.

```javascript
@asStream()
class MyComponent extends Component {
  getInstanceStream (stream, dispose) {
    //{stream} exposes events of only the current instance of the component.
    dispose(stream.subscribe(x => console.log(x)))
  }
  render () {
    return (<div>Hello World!</div>)
  }
}
```

The second param is `dispose` which disposes the subscription as soon as the component unmounts. This frees up the allocated memory and improves performance.

### dispatch(string: event, ...args)
The component gets a special function named `dispatch()` which enables us to dispatch custom events. This is a very powerful feature, as it removes the need of passing loads of callbacks to the deepest level of components. For example —

```javascript
const bus = new Rx.Subject()

@asStream(bus)
class MyComponent extends Component {

  onClick (e) {
    /*
    * The first param is used as the name of the event
    * Rest of the params are passed as the `args` property to the component stream.
    **/
    this.dispatch('CLICKED', e)
  }

  render () {
    return (<div onClick={this.onClick.bind(this)}>Hello World!</div>)
  }
}

bus.subscribe(x => console.log(x))
```

Here the `bus` object can be accessed globally for any kind of internal event that is fired. There is no need of passing a callback to this component for the `onClick` event, instead I can directly subscribe to the `bus`.

**IMPORTANT** This functionality can soon become a problem if all the component's start exposing streams. Use this feature ONLY if a component has a lot of interactions built into it. For example — A form component which has multiple text boxes and dropdowns.

## Extensions

You can create multiple extensions which are based on this module using the `createDeclarative` method. The method essentially helps you define a custom `getInstanceStream` method without the verbosity.

For instance if I want to create a timer declarative, that sets the time elapsed since component was mounted to the state of that particular component, then I do as follows —

```javascript
const timer = createDeclarative(function (stream, dispose, interval, stateProperty) {
  const time = Observable.interval(interval).map(Date.now)
  dispose(
    stream.filter(x => x.event === 'WILL_MOUNT')
    .map(() => Date.now())
    .combineLatest(time, (t1, t2) => t2 - t1)
    .subscribe(x => this.setState({[stateProperty]: x}))
  )
})

/*
Usage
*/

@timer(100, 'elapsedTime')
class MyComponent extends Component {
  render () {
    return (<div>Time Elapsed: {this.state.elapsedTime}ms</div>)
  }
}
// Keeps printing the elapsed time which gets updated ever 100ms
```

`createDeclarative` uses `@asStream` declarative and sets its `getInstanceStream` method to your custom method.

## Lifecycle Events

- `WILL_MOUNT`
- `DID_MOUNT`
- `WILL_RECEIVE_PROPS`
- `WILL_UPDATE`
- `DID_UPDATE`
- `WILL_UNMOUNT`


## Release Channels

There are two release channels — **@stable** & **@latest**

```
npm i react-announce@stable --save
npm i react-announce@latest --save
```

## Available Declaratives [npm](https://www.npmjs.com/search?q=react-announce)

* [react-announce-connect](https://github.com/tusharmath/react-announce-connect): Attaches multiple source observables and applies the changes to a component's state.
* [react-announce-size](https://github.com/tusharmath/react-announce-size): Exposes a component's size as a stream.
* [react-announce-fetch](https://github.com/tusharmath/react-announce-fetch): Sync data store across multiple components over REST.
* [react-announce-draggable](https://github.com/tusharmath/react-announce-draggable): Exposes component's drag and drop events as a stream.
* [react-announce-collapse](https://github.com/tusharmath/react-announce-collapse): A reusable decorator for converting any component into a collapsable component.
* [Need more?](https://github.com/tusharmath/react-announce/issues/new)


[1]: https://facebook.github.io/react/docs/component-specs.html#lifecycle-methods
[2]: https://travis-ci.org/tusharmath/react-announce.svg
[3]: https://travis-ci.org/tusharmath/react-announce
[4]: https://img.shields.io/npm/v/react-announce.svg
[5]: https://en.wikipedia.org/wiki/Cross-cutting_concern
[6]: https://www.npmjs.com/package/react-announce
[coverage-svg]: https://coveralls.io/repos/github/tusharmath/react-announce/badge.svg?branch=master
[coverage]: https://coveralls.io/github/tusharmath/react-announce?branch=master
