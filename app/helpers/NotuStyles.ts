import { StyleSheet } from "react-native";

const margin = StyleSheet.create({

    h3: {
        marginLeft: 3,
        marginRight: 3
    },

    v3: {
        marginTop: 3,
        marginBottom: 3
    }
});

const text = StyleSheet.create({

    plain: {
        color: '#FFF'
    },

    bold: {
        fontWeight: 'bold'
    },

    italic: {
        fontStyle: 'italic'
    }
});

const touch = StyleSheet.create({
    button: {
        alignItems: 'center',
        backgroundColor: '#498BD1',
        padding: 7,
        borderRadius: 5
    },

    success: {
        backgroundColor: '#8AC44B'
    },

    danger: {
        backgroundColor: '#F04438'
    }
});

const view = StyleSheet.create({

    row: {
        flexDirection: 'row'
    },

    background: {
        backgroundColor: '#25292E',
        flex: 1
    }
});

export default {
    margin,
    text,
    touch,
    view
};