import { StyleSheet } from "react-native";

const dropdown = StyleSheet.create({

    main: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8
    },

    focused: {
        borderColor: 'blue'
    },

    placeholder: {
        fontSize: 16
    },

    selected: {
        fontSize: 16
    }
});

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

    danger: {
        color: '#F04438'
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
    dropdown,
    margin,
    text,
    touch,
    view
};