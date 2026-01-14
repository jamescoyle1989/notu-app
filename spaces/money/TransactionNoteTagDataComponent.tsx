import { NotuDateTimePicker } from "@/components/NotuDateTimePicker";
import { NumberInput } from "@/components/NumberInput";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { Check } from "@tamagui/lucide-icons";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Checkbox, CheckedState, Input, Label, XStack, YStack } from "tamagui";
import { TransactionData } from "./TransactionNoteTagData";

export default class TransactionNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        const data = new TransactionData(noteTag);
        let description = data.description;
        if (description.length > 32)
            description = description.substring(0, 30) + '...';
        return (<NotuText color={textColor} small>{data.baseCurrencyAmount}{description.length > 0 ? description : ''}<Check /></NotuText>)
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} refreshCallback={refreshCallback} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }
}


function EditorComponent({ noteTag, refreshCallback }: NoteTagDataComponentProps) {
    const data = new TransactionData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;

    function onCurrencyAmountChange(value: number) {
        data.accountCurrencyAmount = value;
        refreshCallback();
    }

    function onBaseAmountChange(value: number) {
        data.baseCurrencyAmount = value;
        refreshCallback();
    }

    function onDescriptionChange(value: string) {
        data.description = value;
        refreshCallback();
    }

    function onEffectiveStartChange(value: Date) {
        data.effectiveStart = value;
        manualRefresh();
    }

    function onEffectiveEndChange(value: Date) {
        data.effectiveEnd = value;
        manualRefresh();
    }

    function onConfirmedChange(checkState: CheckedState) {
        data.confirmed = checkState.valueOf() == true;
        refreshCallback();
    }
    
    return (
        <YStack>
            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Currency Amount</Label>
                <NumberInput numberValue={data.accountCurrencyAmount}
                             onNumberChange={onCurrencyAmountChange} />
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Base Amount</Label>
                <NumberInput numberValue={data.baseCurrencyAmount}
                             disabled
                             onNumberChange={onBaseAmountChange} />
            </XStack>

            <Label>Description</Label>
            <Input value={data.description}
                   onChangeText={onDescriptionChange} />

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Effective Start</Label>
                <NotuDateTimePicker hideTime value={data.effectiveStart}
                                    onChange={onEffectiveStartChange} />
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Effective End</Label>
                <NotuDateTimePicker hideTime value={data.effectiveEnd}
                                    onChange={onEffectiveEndChange} />
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Confirmed</Label>
                <Checkbox checked={data.confirmed} onCheckedChange={onConfirmedChange}>
                    <Checkbox.Indicator>
                        <Check />
                    </Checkbox.Indicator>
                </Checkbox>
            </XStack>
        </YStack>
    );
}