import { Text, View, styled } from '@tamagui/core';
import { Button, Input } from 'tamagui';

export const NotuText = styled(Text, {
    name: 'NotuText',
    color: '$color',

    variants: {
        bold: {
            true: {
                fontWeight: 'bold'
            }
        },
        italic: {
            true: {
                fontStyle: 'italic'
            }
        },
        danger: {
            true: {
                color: '#F04438'
            }
        },
        pressable: {
            true: {
                color: '#4286F4',
                textDecorationLine: 'underline'
            }
        },
        underline: {
            true: {
                textDecorationLine: 'underline'
            }
        },
        strikethrough: {
            true: {
                textDecorationLine: 'line-through'
            }
        },
        big: {
            true: {
                fontSize: 18
            }
        },
        small: {
            true: {
                fontSize: 11
            }
        }
    } as const
});


export const NotuButton = styled(Button, {
    name: 'NotuButton',

    variants: {
        joinedLeft: {
            true: {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderWidth: 0
            }
        },
        joinedRight: {
            true: {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderWidth: 0
            }
        }
    }
});


export const NotuInput = styled(Input, {
    name: 'NotuInput',

    variants: {
        joinedLeft: {
            true: {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderWidth: 0
            }
        },
        joinedRight: {
            true: {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderWidth: 0
            }
        },
        danger: {
            true: {
                color: '#F04438'
            }
        }
    }
});


export const NotuView = styled(View, {
    name: 'NotuView',

    variants: {
        borderRadius: {
            ':number': (value) => {
                return {
                    borderTopLeftRadius: value,
                    borderTopRightRadius: value,
                    borderBottomLeftRadius: value,
                    borderBottomRightRadius: value
                }
            }
        },
        padding: {
            ':number': (value) => {
                return {
                    paddingBlock: value,
                    paddingInline: value
                }
            }
        },
        box: {
            true: {
                bg: "$backgroundPress"
            }
        }
    }
})