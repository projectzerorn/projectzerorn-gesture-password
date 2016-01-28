var helper = require('./helper');

var React = require('react-native');
var {
    StyleSheet,
    PropTypes,
    View,
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
                        fill && {borderColor: color}, border && {borderWidth: 1}]}>

                {fill && <View style={{width: innerRadius, height: innerRadius, borderRadius: innerRadius / 2, backgroundColor: color}} />}
            </View>
        )
    }
});

var styles = StyleSheet.create({
    outer: {
        position: 'absolute',
        borderColor: '#8E91A8',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

module.exports = Circle;
