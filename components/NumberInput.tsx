import React, { useEffect } from "react";
import { StyleProp, TextStyle } from "react-native";
import { Input } from "tamagui";

interface NumberInputProps {
    value: number,
    onChange: (value: number) => void,
    style?: StyleProp<TextStyle>,
    allowNull?: boolean,
    disabled?: boolean,
    onFocus?: () => void,
    onBlur?: () => void
}


export const NumberInput = ({
    value,
    onChange,
    style = {},
    allowNull = false,
    onFocus,
    onBlur
}: NumberInputProps) => {

    const [dirtyText, setDirtyText] = React.useState((value == null) ? '' : value.toString());
    const [isInError, setIsInError] = React.useState(false);

    useEffect(() => {
        setDirtyText((value == null) ? '' : value.toString());
        setIsInError(false);
    }, [value]);

    function onValueChange(newValue: string) {
        const text = (newValue ?? '').trim();

        //Run some validation to make sure the text is in the basic structure of a number
        try {
            let numberEncountered = false;
            for (let i = 0; i < text.length; i++) {
                const c = text[i];
                if (c == '-') {
                    if (i != 0)
                        throw new Error();
                }
                else if (c == '.') {
                    if (!numberEncountered)
                        throw new Error();
                }
                else {
                    const charcode = c.charCodeAt(0);
                    if (charcode < 48 || charcode > 57)
                        throw new Error();
                    else
                        numberEncountered = true;
                }
            }
        }
        catch (err) {
            setIsInError(true);
            setDirtyText(text);
            return;
        }

        //If the text value parses to a number, raise the change event
        const num = Number(text);
        if (text == '' && allowNull) {
            setIsInError(false);
            setDirtyText(text);
            onChange(null);
        }
        else if (isNaN(num) || text == '' || text.endsWith('.')) {
            setIsInError(true);
            setDirtyText(text);
        }
        else {
            setIsInError(false);
            setDirtyText(num.toString());
            onChange(num);
        }
    }

    return (
        <Input keyboardType="numeric"
               value={dirtyText}
               style={style}
               onChangeText={onValueChange}
               onFocus={() => { if (!!onFocus) onFocus() }}
               onBlur={() => { if (!!onBlur) onBlur() }} />
    );
}