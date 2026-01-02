import React, { useEffect } from "react";
import { Input, InputProps } from "tamagui";

interface NumberInputProps {
    numberValue: number,
    onNumberChange: (value: number) => void,
    allowNull?: boolean
}


export const NumberInput = (props: NumberInputProps & Omit<InputProps, 'value'>) => {

    const [dirtyText, setDirtyText] = React.useState((props.numberValue == null) ? '' : props.numberValue.toString());
    const [isInError, setIsInError] = React.useState(false);

    useEffect(() => {
        setDirtyText((props.numberValue == null) ? '' : props.numberValue.toString());
        setIsInError(false);
    }, [props.numberValue]);

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
        if (text == '' && props.allowNull) {
            setIsInError(false);
            setDirtyText(text);
            props.onNumberChange(null);
        }
        else if (isNaN(num) || text == '' || text.endsWith('.')) {
            setIsInError(true);
            setDirtyText(text);
        }
        else {
            setIsInError(false);
            setDirtyText(num.toString());
            props.onNumberChange(num);
        }
    }

    return (
        <Input {...props as any}
               keyboardType="numeric"
               value={dirtyText}
               onChangeText={onValueChange} />
    );
}