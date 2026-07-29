import { NotuSelect } from "@/components/NotuSelect";
import { NumberInput } from "@/components/NumberInput";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { Check } from "@tamagui/lucide-icons";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode, useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { LineChart } from 'react-native-chart-kit/v2';
import { Checkbox, CheckedState, Input, Label, Popover, XStack, YStack } from "tamagui";
import { BudgetData } from "./BudgetNoteTagData";
import { BudgetChartData, BuildBudgetChartData } from "./BuildBudgetChartData";
import { MoneySpace } from "./MoneySpace";
import { MoneySpaceSetup } from "./MoneySpaceSetup";

export default class BudgetNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return (<BadgeComponent noteTag={noteTag} note={note} notu={notu} />);
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} />)
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new BudgetData(noteTag);
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return tag.space.internalName == MoneySpaceSetup.internalName &&
            tag.name == MoneySpaceSetup.budget;
    }
}


function BadgeComponent({ noteTag, note, notu}: NoteTagDataComponentProps) {
    const data = new BudgetData(noteTag);
    const [isLoading, setIsLoading] = useState(false);
    const [chartData, setChartData] = useState<BudgetChartData>(null);
    const [error, setError] = useState<string>(null);
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        setIsLoading(true);
        let running = true;
        fetch();
        return () => { running = false; }

        async function fetch() {
            try {
                const moneySpace = new MoneySpace(notu);
                let query = `#${moneySpace.transaction.getFullName()}{.confirmed = 1}`;
                if (!!data.transactionQuery)
                    query += ` AND (${data.transactionQuery})`;
                const notes = await notu.getNotes(query);
                if (running) {
                    setIsLoading(false);
                    setChartData(BuildBudgetChartData(note, notes, moneySpace));
                }
            }
            catch (err) {
                setError('Failed to fetch transactions, please ensure that your query is correct');
            }
        }
    }, []);

    function getReferenceLines(): Array<any> {
        const output = [];
        if (data.minAmount != null)
            output.push({ y: data.minAmount, strokeDasharay: [5, 4], label: 'Min' });
        if (data.maxAmount != null)
            output.push({ y: data.maxAmount, strokeDasharay: [5, 4], label: 'Max' });
        if (data.targetAmount != null)
            output.push({ y: data.targetAmount, strokeDasharay: [5, 4], label: 'Target' });
        return output;
    }

    return (
        <Popover size="$5" allowFlip stayInFrame offset={15} resize placement="bottom">
            <Popover.Trigger asChild>
                <NotuText underline small>Chart</NotuText>
            </Popover.Trigger>
            <Popover.Content elevate>
                <Popover.Arrow />
                {!!chartData && data.movingAveragePeriods > 0 && (
                    <LineChart data={chartData.points.map(x => x.toObject())}
                               xKey="date"
                               series={[
                                    { yKey: "value", label: "Value" },
                                    { yKey: "movingAverage", label: "Moving Average", strokeDasharray: [6, 4], strokeOpacity: 0.72 }
                               ]}
                               referenceLines={getReferenceLines()}
                               legend={{ position: "bottom", wrap: true }}
                               width={screenWidth * 0.8} height={screenWidth * 0.8 * 0.7} />
                )}
                {!!chartData && data.movingAveragePeriods == 0 && (
                    <LineChart data={chartData.points.map(x => x.toObject())}
                               xKey="date"
                               yKey="value"
                               referenceLines={getReferenceLines()}
                               width={screenWidth * 0.8} height={screenWidth * 0.8 * 0.7} />
                )}
                {isLoading && (
                    <NotuText>Loading...</NotuText>
                )}
                {error && (
                    <NotuText danger>{error}</NotuText>
                )}
            </Popover.Content>
        </Popover>
    )
}


function EditorComponent({ noteTag }: NoteTagDataComponentProps) {
    const data = new BudgetData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 180;

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