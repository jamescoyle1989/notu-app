import { Check } from '@tamagui/lucide-icons';
import React from 'react';
import { Adapt, ScrollView, Select, Sheet } from 'tamagui';

interface NotuCustomSelectProps {
    options: Array<{name: string, value: any}>,
    onValueChange: (value: any) => void,
    open: boolean,
    onOpenChange: (value) => void
}


export const NotuCustomSelect = ({
    options,
    onValueChange,
    open,
    onOpenChange
}: NotuCustomSelectProps) => {

    function handleValueChange(valueName: string) {
        const selectedValue = options.find(x => x.name == valueName)?.value;
        onValueChange(selectedValue);
    }

    //See this for buggy behaviour with the select component on android
    //https://github.com/tamagui/tamagui/issues/3436#issuecomment-3133812014
    return (
        <Select value={null} onValueChange={handleValueChange} disablePreventBodyScroll open={open} onOpenChange={onOpenChange}>
            <Adapt when="maxMd" platform="touch">
                <Sheet modal dismissOnSnapToBottom animation='100ms'>
                    <Sheet.Frame>
                        <ScrollView>
                            <Adapt.Contents />
                        </ScrollView>
                    </Sheet.Frame>
                    <Sheet.Overlay bg="rgba(0,0,0,0.5)"
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