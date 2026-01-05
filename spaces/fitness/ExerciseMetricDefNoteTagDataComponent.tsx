import { NotuSelect } from "@/components/NotuSelect";
import { NumberInput } from "@/components/NumberInput";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuInput } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode, useState } from "react";
import { Label, XStack, YStack } from "tamagui";
import { ExerciseMetricDefData } from "./ExerciseMetricDefNoteTagData";

export default class ExerciseMetricDefNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(
        noteTag: NoteTag,
        note: Note,
        notu: Notu,
        textColor: string
    ): ReactNode {
        return null;
    }

    getEditorComponent(
        noteTag: NoteTag,
        note: Note,
        notu: Notu,
        refreshCallback: () => void
    ): ReactNode {
        return (<EditorComponent noteTag={noteTag} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }
}



function EditorComponent({ noteTag }: NoteTagDataComponentProps) {
    const data = new ExerciseMetricDefData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;
    const [valuesString, setValuesString] = useState<string>();
    const [valuesStringContainsErrors, setValuesStringContainsErrors] = useState(false);

    function onModeChange(newValue: any) {
        data.mode = newValue;
        manualRefresh();
    }

    function onConstantValueChange(newValue: number) {
        data.value = newValue;
        manualRefresh();
    }

    function onRangeMinChange(newValue: number) {
        data.min = newValue;
        manualRefresh();
    }

    function onRangeMaxChange(newValue: number) {
        data.max = newValue;
        manualRefresh();
    }

    function onRangeIncrementChange(newValue: number) {
        data.increment = newValue;
        manualRefresh();
    }

    function onSetValuesChange(newValue: string) {
        const stringValues = newValue.split(',').map(x => x.trim());
        if (!stringValues.find(x => isNaN(Number(x)))) {
            data.values = stringValues.map(x => Number(x));
            setValuesStringContainsErrors(false);
        }
        else
            setValuesStringContainsErrors(true);
        setValuesString(newValue);
    }

    return (
        <YStack>
            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Mode</Label>
                <NotuSelect value={data.mode}
                            options={[
                                {name: 'Constant', value: 'Constant'},
                                {name: 'Range', value: 'Range'},
                                {name: 'Set', value: 'Set'}
                            ]}
                            onValueChange={onModeChange} />
            </XStack>

            {data.mode == 'Constant' && (
                <XStack style={{alignItems: 'center'}}>
                    <Label width={labelWidth}>Value</Label>
                    <NumberInput numberValue={data.value}
                                 onNumberChange={onConstantValueChange} />
                </XStack>
            )}

            {data.mode == 'Range' && (
                <YStack>
                    <XStack style={{alignItems: 'center'}}>
                        <Label width={labelWidth}>Min</Label>
                        <NumberInput numberValue={data.min}
                                    onNumberChange={(onRangeMinChange)} />
                    </XStack>

                    <XStack style={{alignItems: 'center'}}>
                        <Label width={labelWidth}>Max</Label>
                        <NumberInput numberValue={data.max}
                                    onNumberChange={(onRangeMaxChange)} />
                    </XStack>

                    <XStack style={{alignItems: 'center'}}>
                        <Label width={labelWidth}>Increment</Label>
                        <NumberInput numberValue={data.increment}
                                    onNumberChange={(onRangeIncrementChange)} />
                    </XStack>
                </YStack>
            )}

            {data.mode == 'Set' && (
                <XStack style={{alignItems: 'center'}}>
                    <Label width={labelWidth}>Values</Label>
                    <NotuInput value={valuesString}
                               danger={valuesStringContainsErrors}
                               onChangeText={onSetValuesChange} />
                </XStack>
            )}
        </YStack>
    )
}