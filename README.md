# react-announce [![Build Status][2]][3] [![npm][4]]()
a declarative approach to creating react components.

## Purpose
Reuse **component behaviors** or [cross cutting concerns][5] via a declarative approach.

## Installation

```
npm i react-announce --save
```

## API

### @subscribe
`@subscribe()` decorator lets any observer subscribe to the [lifecycle events][1] *(and also custom events that we will see later)* of the component.

```javascript
const Rx = require('rx')
const observerA = Rx.Observer.create(x => console.log('A', x))
const observerB = Rx.Observer.create(x => console.log('B', x))

@subscribe(observerA, observerB)
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
 Every subscriber get all the notification from all the instance of all the lifecycle events. Each notification on the stream is fired with three keys —
 ```js
{
  "event": "WILL_MOUNT", /*DID_MOUNT, WILL_RECEIVE_PROPS, WILL_UPDATE, DID_UPDATE, WILL_UNMOUNT*/

  "args": [], /*the arguments with which the event was dispatched*/,

  "component": {} /*instance of the component*/
}
 ```

### getComponentStream(stream: Observable, dispose: function)
Exposes the component events of only the CURRENT instance, as a stream and is always called with context of that instance.

```javascript
@subscribe()
class MyComponent extends Component {
  getComponentStream (stream) {
    //{stream} exposes events of only the current instance of the component.
    stream.subscribe(x => console.log(x))
  }
  render () {
    return (<div>Hello World!</div>)
  }
}
```

### Dispatching custom events
The component gets a special function named `dispatch()` which enables us to dispatch custom lifecycle events.

```javascript

@subscribe()
class MyComponent extends Component {
  onClick () {
    /*
    * The first param is used as the name of the event
    * Rest of the params are passed as the `args` property to the component stream.
    **/
    this.dispatch('CLICKED', this.state.count + 1)
  }
  getComponentStream (stream, dispose) {
    dispose(
      stream.filter(x => x.event === 'CLICKED')
      .map(x => x.args[0])
      .subscribe(count => this.setState({count}))
    )
  }
  render () {
    return (<div onClick={this.onClick.bind(this)}>Hello World! {this.state.count}</div>)
  }
}
```


## Extensions

You can create multiple extensions which are based on this module using the `createDeclarative` method. The method essentially helps you define a custom `getComponentStream` method without the verbosity.

### createDeclarative
This is a special utility method provided to write custom declaratives on top of react-announce. For instance if I want to create a timer declarative, that sets the time elapsed since component was mounted to the state of that particular component, then I can use it as follows —

```javascript

const timer = createDeclarative(function (stream, dispose, interval, stateProperty) {

  const time = Observable.interval(interval).map(Date.now)
  dispose(
    stream.filter(x => x.event === 'WILL_MOUNT')
    .map(() => Date.now())
    .combineLatest(time, (t1, t2) => t2 - t1)
    .subscribe(x => {[stateProperty]: x})
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

`createDeclarative` uses `@asStream` declarative and sets its `getComponentStream` method to your custom method.

## Lifecycle Events

- `WILL_MOUNT`
- `DID_MOUNT`
- `WILL_RECEIVE_PROPS`
- `WILL_UPDATE`
- `DID_UPDATE`
- `WILL_UNMOUNT`



## Available Declaratives [npm](https://www.npmjs.com/search?q=react-announce)

* [react-announce-connect](https://github.com/tusharmath/react-announce-connect): Attaches multiple source observables and applies the changes to a component's state.
* [react-announce-size](https://github.com/tusharmath/react-announce-size): Exposes a component's size as a stream.
* [react-announce-fetch](https://github.com/tusharmath/react-announce-fetch): Sync data store across multiple components over REST.
* [react-announce-hydrate](https://github.com/tusharmath/react-announce-hydrate): Applies component life cycle events to an observer.
* [react-announce-draggable](https://github.com/tusharmath/react-announce-draggable): Exposes component's drag and drop events as a stream.
* [Need more?](https://github.com/tusharmath/react-announce/issues/new)


[1]: https://facebook.github.io/react/docs/component-specs.html#lifecycle-methods
[2]: https://travis-ci.org/tusharmath/react-announce.svg
[3]: https://travis-ci.org/tusharmath/react-announce
[4]: https://img.shields.io/npm/v/react-announce.svg
[5]: https://en.wikipedia.org/wiki/Cross-cutting_concern
