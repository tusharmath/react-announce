# react-announce [![Build Status](https://travis-ci.org/tusharmath/react-announce.svg)](https://travis-ci.org/tusharmath/react-announce)
a declarative approach to creating react components.

## Purpose
Reuse **component behaviors** or [cross cutting concerns](https://en.wikipedia.org/wiki/Cross-cutting_concern) via a declarative approach.

## Installation

```
npm i react-announce --save
```

## API

### @asStream()
Exposes component [life cycle](https://facebook.github.io/react/docs/component-specs.html#lifecycle-methods) events as a stream.

```javascript
@asStream()
class MyComponent extends Component {
  getComponentStream (stream) {
    stream.subscribe(x => console.log(x)
  }
  render () {
    return (<div>Hello World!</div>)
  }
}

/*
OUTPUT: With each event three params are being sent — 
1. event: the type of lifecyle event
2. args: the arguments with with the event was dispatched
3. component: access to the originial component.

{event: 'WILL_MOUNT', args: [], component: MyComponent {}}
{event: 'DID_MOUNT', args: [], component: MyComponent {}}

*/

```

### getComponentStream(stream: Observable, dispose: function)
Exposes the component's lifecycle events as a stream. Events are available in the `event` property of the stream observable. Events include — `WILL_MOUNT`, `DID_MOUNT`, `WILL_RECEIVE_PROPS`, `WILL_UPDATE`, `DID_UPDATE`, `WILL_UNMOUNT`. This method is always called with context to the current instance of the component.

One can attach any custom logic by filtering on any of the events such as —

```javascript
getComponentStream (stream) {
  stream.filter(x => x.event === 'WILL_MOUNT').subscribe(x => this.setState({status: 'mounted'}))
}
```

Its often necessary to dispose of your subscriptions as soon as your component unmounts. This can be done easily by using the second param of the `getComponentStream()` — `dispose`.


```javascript
const time = Observable.interval(100).map(() => new Date().toString())

class MyComponent extends Component {
  getComponentStream (stream, dispose) {
    dispose(
      stream.filter(x => x.event === 'WILL_MOUNT')
      .combineLatest(time, (a, b) => b)
      .subscribe(time => this.setState({time}))
    )
  }
  render () {
    return (<div>Hello World!</div>)
  }
}
```
In this example, we wouldn't want the `time` stream to be updating the state of the component once the component has been unmounted, so we use `dispose` function which can take in multiple params of stream type and dispose them one by one once the component is unmounted.

### createDeclaration
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

## Available Declaratives

* [react-announce-connect](https://github.com/tusharmath/react-announce-connect): Attaches multiple source observables and applies the changes to a component's state.
* [react-announce-collapse](https://github.com/tusharmath/react-announce-collapse): (WIP) A declarative that will help in auto hiding dropdowns and popups, when clicked outside of them or when **ESC** key is pressed.
* [Need more?](https://github.com/tusharmath/react-announce/issues/new)
