import { StyleSheet } from "react-native";

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
})

export default {
    text,
    touch,
    view
};