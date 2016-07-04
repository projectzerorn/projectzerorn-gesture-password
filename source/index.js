var helper = require('./helper');

import React, { PropTypes } from 'react'
import {
    StyleSheet,
    Dimensions,
    PanResponder,
    View,
    Text,
    Animated
} from 'react-native'

var Line = require('./line');
var Circle = require('./circle');

var Width = Dimensions.get('window').width;
var Height = Dimensions.get('window').height;
var Top = (Height - Width)/2.0 * 1.5;
var Radius = Width / 10;
var NUM_CIRCLES = 9
var DEFAULT_STYLES = {
    frame: {
        backgroundColor: '#292B38',
        flex: 1,
        alignSelf: 'stretch'
    },
    board: {
        position: 'absolute',
        left: 0,
        top: Top,
        width: Width,
        height: Height
    },
    message: {
        position: 'absolute',
        left: 0,
        top: Top / 2.2,
        width: Width,
        height: Top / 3,
        alignItems: 'center',
        justifyContent: 'center'
    },
    msgText: {
        fontSize: 14,
        textAlign: 'center'
    },
    line: {
    }
}

var GesturePassword = React.createClass({
    timer: null,
    lastIndex: -1,
    sequence: '',   // 手势结果
    isMoving: false,
    propTypes: {
        message: PropTypes.string,
        styles: PropTypes.object,
        baseColor: PropTypes.string,
        rightColor: PropTypes.string,
        wrongColor: PropTypes.string,
        status: PropTypes.oneOf(['right', 'wrong', 'normal']),
        onStart: PropTypes.func,
        onEnd: PropTypes.func,
        // whether to paint nucleus in intial state
        nucleus: PropTypes.bool,
        // whether to paint shell in initial state
        shell: PropTypes.bool,
        interval: PropTypes.number,
        allowCross: PropTypes.bool,
        radius: PropTypes.shape({
            outer: PropTypes.number.isRequired,
            inner: PropTypes.number.isRequired
        }),
        styles: PropTypes.shape({
            frame: PropTypes.object,
            msgText: PropTypes.object,
            line: PropTypes.object
        })
    },

    getDefaultProps: function() {
        return {
            message: '',
            baseColor: '#5FA8FC',
            rightColor: '#5FA8FC',
            wrongColor: '#D93609',
            status: 'normal',
            interval: 0,
            allowCross: false,
            shell: true,
            radius: {
                outer: Radius,
                inner: Radius / 2.5
            },
            styles: DEFAULT_STYLES
        }
    },
    getInitialState: function() {
        var circles = [];
        var Margin = Radius;
        for (let i=0; i < NUM_CIRCLES; i++) {
            let p = i % 3;
            let q = parseInt(i / 3);
            circles.push({
                isActive: false,
                scale: new Animated.Value(1),
                x: p * (Radius * 2 + Margin) + Margin + Radius,
                y: q * (Radius * 2 + Margin) + Margin + Radius
            });
        }

        return {
            circles: circles,
            lines: []
        }
    },
    componentWillMount: function() {
        this.styles = StyleSheet.create({...DEFAULT_STYLES, ...this.props.styles})
        if(this.props.styles != undefined && this.props.styles.board.top != undefined){
            Top = this.props.styles.board.top;
        }

        this._panResponder = PanResponder.create({
            // 要求成为响应者：
            onStartShouldSetPanResponder: (event, gestureState) => true,
            onStartShouldSetPanResponderCapture: (event, gestureState) => true,
            onMoveShouldSetPanResponder: (event, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (event, gestureState) => true,

            // 开始手势操作
            onPanResponderGrant: (event, gestureState) => {
                this.onStart(event, gestureState);
            },
            // 移动操作
            onPanResponderMove: (event, gestureState) => {
                this.onMove(event, gestureState);
            },
            // 释放手势
            onPanResponderRelease: (event, gestureState) => {
                this.onEnd(event, gestureState);
            }
        });
    },

    getColorForStatus: function (status) {
        return status === 'wrong' ? this.props.wrongColor :
            status === 'right' ? this.props.rightColor : this.props.baseColor
    },

    render: function() {
        var color = this.getColorForStatus(this.props.status)
        return (
            <View style={this.styles.frame}>
                <View style={this.styles.message}>
                    <Text style={[this.styles.msgText, {color: color}]}>
                        {this.state.message || this.props.message}
                    </Text>
                </View>
                <View style={[this.styles.board]} {...this._panResponder.panHandlers}>
                    {this.renderCircles()}
                    {this.renderLines()}
                    <Line ref='line' style={this.props.styles.line} />
                </View>

                {this.props.children}
            </View>
        )
    },
    renderCircles: function() {
        var array = [], color;
        var { nucleus, shell, status, radius } = this.props;
        var color = this.getColorForStatus(this.props.status)
        this.state.circles.forEach((c, i) => {
            var fill = nucleus || !shell || c.isActive;

            array.push(
                <Circle
                    key={'c_' + i}
                    fill={fill}
                    border={shell}
                    color={color}
                    x={c.x}
                    y={c.y}
                    r={radius}
                    style={{
                      transform: [
                        {scale: c.scale}
                      ]
                    }} />
            )
        });

        return array;
    },
    renderLines: function() {
        var array = [], color;
        var color = this.getColorForStatus(this.props.status)
        this.state.lines.forEach((l, i) => {
            array.push(
                <Line key={'l_' + i} start={l.start} end={l.end} style={this.props.styles.line} />
            )
        });

        return array;
    },
    setActive: function(index) {
        var circles = this.state.circles
        var regular = 1
        var fat = 1.5
        for (var i = 0; i < NUM_CIRCLES; i++) {
            var c = circles[i]
            var to
            if (i === index) {
                c.isActive = true
                to = fat
            } else {
                to = regular
            }

            Animated.timing(
                c.scale,
                {
                    duration: 200,
                    toValue: to
                }
            ).start()
        }

        this.setState(this.state);
    },
    resetActive: function() {
        this.state.lines = [];
        this.state.circles.forEach(c => {
            c.isActive = false
        })

        this.setActive(-1)
    },
    setLineProps: function (props) {
      this.refs.line.setNativeProps(props)
    },
    getTouchChar: function(touch) {
        var x = touch.x;
        var y = touch.y;

        for (let i=0; i < NUM_CIRCLES; i++) {
            if ( helper.isPointInCircle({x, y}, this.state.circles[i], Radius) ) {
                return String(i);
            }
        }

        return false;
    },
    getCrossChar: function(char) {
        var middles = '13457', last = String(this.lastIndex);

        if ( middles.indexOf(char) > -1 || middles.indexOf(last) > -1 ) return false;

        var point = helper.getMiddlePoint(this.state.circles[last], this.state.circles[char]);

        for (let i=0; i < middles.length; i++) {
            let index = middles[i];
            if ( helper.isEquals(point, this.state.circles[index]) ) {
                return String(index);
            }
        }

        return false;
    },
    onStart: function(e, g) {
        var x = e.nativeEvent.pageX;
        var y = e.nativeEvent.pageY - Top;

        var lastChar = this.getTouchChar({x, y});
        if ( lastChar ) {
            this.isMoving = true;
            this.lastIndex = Number(lastChar);
            this.sequence = lastChar;
            this.resetActive();
            this.setActive(this.lastIndex);

            var point = {
                x: this.state.circles[this.lastIndex].x,
                y: this.state.circles[this.lastIndex].y
            };

            this.setLineProps({start: point, end: point});

            this.props.onStart && this.props.onStart();

            if ( this.props.interval>0 ) {
                clearTimeout(this.timer);
            }
        }
    },
    onMove: function(e, g) {
        var x = e.nativeEvent.pageX;
        var y = e.nativeEvent.pageY - Top;

        if ( this.isMoving ) {
            this.setLineProps({end: {x, y}});

            var lastChar = null;

            if ( !helper.isPointInCircle({x, y}, this.state.circles[this.lastIndex], Radius) ) {
                lastChar = this.getTouchChar({x, y});
            }

            if ( lastChar ) {
                if ( !this.props.allowCross ) {
                    var crossChar = this.getCrossChar(lastChar);

                    if ( crossChar && this.sequence.indexOf(crossChar) === -1 ) {
                        this.sequence += crossChar;
                        this.setActive(Number(crossChar));
                    }
                }

                var lastIndex = this.lastIndex;
                var thisIndex = Number(lastChar);

                this.state.lines.push({
                    start: {
                        x: this.state.circles[lastIndex].x,
                        y: this.state.circles[lastIndex].y
                    },
                    end: {
                        x: this.state.circles[thisIndex].x,
                        y: this.state.circles[thisIndex].y
                    }
                });

                this.lastIndex = Number(lastChar);
                this.sequence += lastChar;

                this.setActive(this.lastIndex);

                var point = {
                    x: this.state.circles[this.lastIndex].x,
                    y: this.state.circles[this.lastIndex].y
                };

                this.setLineProps({start: point});
            }
        }

        // if ( this.sequence.length === NUM_CIRCLES ) this.onEnd();
    },
    onEnd: function(e, g) {
        if ( this.isMoving ) {
            var password = helper.getRealPassword(this.sequence);
            this.sequence = '';
            this.lastIndex = -1;
            this.isMoving = false;

            var origin = {x: 0, y: 0};
            this.setLineProps({start: origin, end: origin});

            this.props.onEnd && this.props.onEnd(password);

            if ( this.props.interval>0 ) {
                this.timer = setTimeout(() => this.resetActive(), this.props.interval);
            } else {
                this.resetActive()
            }
        }
    }
});

module.exports = GesturePassword;
