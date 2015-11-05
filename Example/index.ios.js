const React = require('react-native');
const SceneRouter = require('./lib');

const {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Component
} = React;

const {
  Scene
} = SceneRouter;

function wait(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

class Home extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    console.log('Home is mounted');
  }

  sceneWillFocus() {
    console.log('Home will be focused');
  }

  sceneDidFocus() {
    console.log('Home did focuse');
  }

  sceneWillBlur() {
    console.log('Home will be Blured');
  }

  sceneDidBlur() {
    console.log('Home did Blur');
  }

  componentWillUnmount() {
    console.log('Home will be unmounted');
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'red' }}></View>
    );
  }
}

class About extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    console.log('About is mounted');
  }

  sceneWillFocus() {
    console.log('About will be focused');
  }

  sceneWillBlur() {
    console.log('About will be Blured');
  }

  sceneDidBlur() {
    console.log('About did Blur');
  }

  sceneDidFocus() {
    console.log('About did focuse');
  }

  componentWillUnmount() {
    console.log('About will be unmounted');
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'blue' }}></View>
    );
  }
}

class Example extends Component {
  constructor(props, context) {
    super(props, context)
  }

  async tests() {
    const sceneRef = this.refs.scene;

    await wait(2000);
    sceneRef.goto('/about', {}, { replace: false });
    await wait(2000);
    sceneRef.goback();
  }

  componentDidMount() {
    this.tests();
  }

  render() {
    return (
      <Scene ref="scene" initialPath="/home">
        <Scene path="home" component={Home}/>
        <Scene path="about" component={About}/>
      </Scene>
    );
  }
}

AppRegistry.registerComponent('Example', () => Example);
