var helper = require('./helper');

var React = require('react-native');
var {
    StyleSheet,
    PropTypes,
    View,
    Animated
    } = React;

var Circle = React.createClass({
    propTypes: {
        color: PropTypes.string,
        fill: PropTypes.bool,
        border: PropTypes.bool,
        x: PropTypes.number,
        y: PropTypes.number,
        r: React.PropTypes.shape({
            inner: React.PropTypes.number.isRequired,
            outer: React.PropTypes.number.isRequired
        })
    },
    render: function() {
        var {color, border, fill, x, y, r} = this.props;
        var innerRadius = r.inner
        var outerRadius = r.outer

        return (
            <View style={[styles.outer,
                        {left: x - outerRadius, top: y - outerRadius, width: 2 * outerRadius, height: 2 * outerRadius, borderRadius: outerRadius},
                        border && {borderColor: color}, border && {borderWidth: 1}]}>

                {fill && <Animated.View style={{width: innerRadius, height: innerRadius, borderRadius: innerRadius / 2, backgroundColor: color, ...this.props.style}} />}
            </View>
        )
    }
});

var styles = StyleSheet.create({
    outer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

module.exports = Circle;
