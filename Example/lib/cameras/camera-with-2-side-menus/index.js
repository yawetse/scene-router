const React = require('react-native');
const Camera = require('../base');
const TwoSideMenus = require('./two-side-menus');

const {
  Dimensions,
  StyleSheet,
  Component,
  View,
  PanResponder,
  Animated,
  TouchableWithoutFeedback
} = React;

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  menuWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: window.width,
    height: window.height,
    backgroundColor: 'transparent'
  }
});

const animationFunction = (prop, value) => {
  return Animated.timing(
    prop,
    {
      toValue: value,
      duration: 300
    }
  );
};

const animationStyle = (value) => {
  return {
    transform: [
      {
        translateX: value,
      }
    ],
  };
};

class CameraWith2SideMenus extends Camera {
  constructor(props, context) {
    super(props, context);

    //////////////////////////////
    // Menu
    this._responder = null;
    this._leftMenuOpacity = new Animated.Value(0);
    this._rightMenuOpacity = new Animated.Value(0);
    this._overlayOpacity = new Animated.Value(0);

    this._value = new Animated.Value(0);
    this._prevValue = 0;

    this._enabledLeftMenu = true;
    this._enabledRightMenu = true;

    this._isOpen = false;
  }

  _handleMoveShouldSetPanResponder(e, gesture) {
    const {
      userProps: {
        LeftMenu, RightMenu, toleranceX, toleranceY
      }
    } = this.props;

    const dx = gesture.dx;
    const dy = gesture.dy;

    //in these two conditions we are checking
    // - which side we are trying to show
    // - does the component for that menu available
    // - has some one disable the menu by calling enableMenu
    if (dx > 0 && (!LeftMenu || !this._enabledLeftMenu)) {
      //we are not letting slider over to left if left menu doesn't pass
      console.log(`${dx} > 0 && (!${LeftMenu} || !${this._enabledLeftMenu})`);
      return false;
    } else if (dx < 0 && (!RightMenu || !this._enabledRightMenu)) {
      //we are not letting slider over to right if right menu doesn't pass
      console.log('wow2');
      return false;
    }

    return (
      Math.round(Math.abs(dx)) > toleranceX &&
      Math.round(Math.abs(dy)) < toleranceY
    );
  }

  _handlePanResponderMove(e, gesture) {
    const {
      userProps: {
        openLeftMenuOffset,
        openRightMenuOffset
      }
    } = this.props;
    let value = this._prevValue + gesture.dx;

    if (value > 0) {
      value = value < openLeftMenuOffset? value : openLeftMenuOffset;
      this._showMenu('left');
    } else {
      value = value > openRightMenuOffset? value : openRightMenuOffset;
      this._showMenu('right');
    }

    this._value.setValue(value);
  }

  _handlePanResponderEnd(e, gesture) {
    const { userProps: { offsetUntilOpen } } = this.props;
    //i need to detect whether I need to open or close the menu on any sides.
    const dx = gesture.dx;
    const absDx = Math.abs(dx);

    if (absDx > offsetUntilOpen && !this._isOpen) {
      if (dx < 0) {
        this.openMenu('right');
      } else {
        this.openMenu('left');
      }
    } else {
      this.closeMenu();
    }
  }

  _wrappedMenuController(sceneAsChild) {
    const { userProps: { gestures } } = this.props;
    const panHandlers = gestures? this._responder.panHandlers : {};
    return (
      <Animated.View
        style={[styles.view, animationStyle(this._value)]}
        {...panHandlers}>
        {sceneAsChild}
      </Animated.View>
    );
  }

  _renderOverlay() {
    return (
      <Animated.View style={[styles.view, { opacity: this._overlayOpacity }]}>
        <TouchableWithoutFeedback onPress={() => { this.closeMenu() }}>
          <View style={{ flex: 1, backgroundColor: 'transparent' }}/>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }

  _showMenu(side) {
    let leftOpacityValue = 0,
        rightOpacityMenu = 0;

    if (side == 'left') {
      leftOpacityValue = 1;
      rightOpacityMenu = 0;
    } else if (side == 'right') {
      leftOpacityValue = 0;
      rightOpacityMenu = 1;
    }

    this._leftMenuOpacity.setValue(leftOpacityValue);
    this._rightMenuOpacity.setValue(rightOpacityMenu);
  }

  enableMenu(side, enable) {
    switch(side) {
      case 'left':
        this._enabledLeftMenu = !!enable;
        break;
      case 'right':
        this._enabledRightMenu = !!enable;
        break;
      default:
        //do nothing
    }
  }

  openMenu(side) {
    const {
      userProps: {
        openLeftMenuOffset,
        openRightMenuOffset
      }
    } = this.props;

    let toValue;
    if (side === 'left') {
      toValue = openLeftMenuOffset;
    } else {
      toValue = openRightMenuOffset;
    }

    this._showMenu(side);

    animationFunction(this._value, toValue).start(() => {
      this._prevValue = this._value.__getValue();
      //activate overaly
      this._overlayOpacity.setValue(1);

      this._isOpen = true;
    });
  }

  closeMenu() {
    animationFunction(this._value, 0).start(() => {
      this._prevValue = this._value.__getValue();
      //deactivate overlay
      this._overlayOpacity.setValue(0);
      //hide both menus
      this._showMenu();

      this._isOpen = false;
    });
  }

  renderBack() {
    const { userProps: { LeftMenu, RightMenu } } = this.props;

    return (
      <View style={styles.menuWrapper}>
        <LeftMenu key="leftMenu" ref="leftMenu"/>
        <RightMenu key="rightMenu" ref="rightMenu"/>
      </View>
    );
  }

  renderScenes(scenes) {
    const lastIndex = React.Children.count(scenes) - 1;
    return React.Children.map(scenes, (scene, index) => {
      if (index == lastIndex) {
        return this._wrappedMenuController(scene);
      }
      return scene;
    });
  }

  renderGlass() {
    return null;
  }

  componentWillMount() {
    this._responder = PanResponder.create({
      onStartShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder.bind(this),
      onPanResponderMove: this._handlePanResponderMove.bind(this),
      onPanResponderRelease: this._handlePanResponderEnd.bind(this),
    });
  }
}

module.exports = CameraWith2SideMenus;
