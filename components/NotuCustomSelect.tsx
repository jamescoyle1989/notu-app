import { Check } from '@tamagui/lucide-icons';
import React from 'react';
import { Adapt, ScrollView, Select, Sheet } from 'tamagui';

interface NotuCustomSelectProps {
    options: Array<{name: string, value: any}>,
    onValueChange: (value: any) => void,
    open: boolean
}


export const NotuCustomSelect = ({
    options,
    onValueChange,
    open
}: NotuCustomSelectProps) => {

    function handleValueChange(valueName: string) {
        const selectedValue = options.find(x => x.name == valueName)?.value;
        onValueChange(selectedValue);
    }

    //See this for buggy behaviour with the select component on android
    //https://github.com/tamagui/tamagui/issues/3436#issuecomment-3133812014
    return (
        <Select value={null} onValueChange={handleValueChange} disablePreventBodyScroll open={open}>
            <Adapt when="maxMd" platform="touch">
                <Sheet modal dismissOnSnapToBottom animation='100ms'>
                    <Sheet.Frame>
                        <ScrollView>
                            <Adapt.Contents />
                        </ScrollView>
                    </Sheet.Frame>
                    <Sheet.Overlay transparent={false}
                                   animation="lazy"
                                   enterStyle={{opacity: 0}}
                                   exitStyle={{opacity: 0}} />
                </Sheet>
            </Adapt>

            <Select.Content>
                <Select.Viewport>
                    <Select.Group>
                        {options.map((x, index) => (
                            <Select.Item index={index} key={x.name} value={x.name}>
                                <Select.ItemText>{x.name}</Select.ItemText>
                                <Select.ItemIndicator marginLeft="auto">
                                    <Check size={16} />
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Group>
                </Select.Viewport>
            </Select.Content>
        </Select>
    );
}