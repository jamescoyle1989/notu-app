import { StyleSheet } from "react-native";

const border = StyleSheet.create({

    main: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8
    },

    joinedLeft: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0
    },

    joinedRight: {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0
    }
});

const dropdown = StyleSheet.create({

    main: {
        height: 50,
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
    },

    underline: {
        textDecorationLine: 'underline'
    },

    big: {
        fontSize: 18
    },

    link: {
        color: '#00F',
        textDecorationLine: 'underline'
    }
});

const touch = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#498BD1',
        padding: 7,
        borderRadius: 5
    },

    success: {
        backgroundColor: '#8AC44B'
    },

    danger: {
        backgroundColor: '#F04438'
    },

    inactive: {
        backgroundColor: '#666'
    }
});

const view = StyleSheet.create({

    row: {
        flexDirection: 'row'
    },

    background: {
        backgroundColor: '#25292E',
        flex: 1
    },

    autoSize: {
        flexBasis: 'auto'
    },

    grow1: {
        flexGrow: 1
    },

    grow2: {
        flexGrow: 2
    },

    grow3: {
        flexGrow: 3
    }
});

export default {
    border,
    dropdown,
    margin,
    text,
    touch,
    view
};