import { NotuSelect } from "@/components/NotuSelect";
import { NumberInput } from "@/components/NumberInput";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { Check } from "@tamagui/lucide-icons";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Checkbox, CheckedState, Input, Label, XStack, YStack } from "tamagui";
import { BudgetData } from "./BudgetNoteTagData";

export default class BudgetNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} />)
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }
}


function EditorComponent({ noteTag }: NoteTagDataComponentProps) {
    const data = new BudgetData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;

    function onTransactionQueryChange(value: string) {
        data.transactionQuery = value;
        manualRefresh();
    }

    function onTimeUnitChange(value: 'Days' | 'Weeks' | 'Months' | 'Years') {
        data.timeUnit = value;
        manualRefresh();
    }

    function onMovingAveragePeriodsChange(value: number) {
        data.movingAveragePeriods = value;
        manualRefresh();
    }

    function onFlipGraphDirection(checkState: CheckedState) {
        data.flipGraphDirection = checkState.valueOf() == true;
        manualRefresh();
    }

    function onMinAmountChange(value: number) {
        data.minAmount = value;
        manualRefresh();
    }

    function onTargetAmountChange(value: number) {
        data.targetAmount = value;
        manualRefresh();
    }

    function onMaxAmountChange(value: number) {
        data.maxAmount = value;
        manualRefresh();
    }

    return (
        <YStack>
            <Label>Transaction Query</Label>
            <Input value={data.transactionQuery} onChangeText={onTransactionQueryChange} />

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Time Unit</Label>
                <NotuSelect value={data.timeUnit}
                            options={['Days', 'Weeks', 'Months', 'Years'].map(x => ({value: x, name: x}))}
                            onValueChange={onTimeUnitChange} />
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Moving Average Periods</Label>
                <NumberInput numberValue={data.movingAveragePeriods}
                             allowNull={true}
                             onNumberChange={onMovingAveragePeriodsChange} />
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Min Amount</Label>
                <NumberInput numberValue={data.minAmount}
                             allowNull={true}
                             onNumberChange={onMinAmountChange} />
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Target Amount</Label>
                <NumberInput numberValue={data.targetAmount}
                             allowNull={true}
                             onNumberChange={onTargetAmountChange} />
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Max Amount</Label>
                <NumberInput numberValue={data.maxAmount}
                             allowNull={true}
                             onNumberChange={onMaxAmountChange} />
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Flip Graph Direction</Label>
                <Checkbox checked={data.flipGraphDirection} onCheckedChange={onFlipGraphDirection}>
                    <Checkbox.Indicator>
                        <Check />
                    </Checkbox.Indicator>
                </Checkbox>
            </XStack>
        </YStack>
    );
}