import { NotuDateTimePicker } from "@/components/NotuDateTimePicker";
import { NotuSelect } from "@/components/NotuSelect";
import { NumberInput } from "@/components/NumberInput";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { dateToText } from "@/helpers/RenderHelpers";
import { Check } from "@tamagui/lucide-icons";
import { sum } from "es-toolkit";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode, useEffect, useState } from "react";
import { Checkbox, CheckedState, Input, Label, Slider, XStack, YStack } from "tamagui";
import { TransactionCategoryData } from "./TransactionCategoryData";
import { TransactionData } from "./TransactionNoteTagData";

export default class TransactionNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        const data = new TransactionData(noteTag);
        let description = data.description;
        if (description.length > 32)
            description = description.substring(0, 30) + '...';
        return (<NotuText color={textColor} small>{dateToText(data.effectiveStart)} | <NotuText bold>{data.baseCurrencyAmount}</NotuText>{description.length > 0 ? ` | ${description}` : ''}{data.confirmed ? ' ✔' : ''}</NotuText>)
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} note={note} notu={notu} refreshCallback={refreshCallback} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }
}


function EditorComponent({ noteTag, note, notu, refreshCallback }: NoteTagDataComponentProps) {
    const data = new TransactionData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;
    const [categories, setCategories] = useState<Array<Tag>>([]);
    const [showCategoryValueSliders, setShowCategoryValueSliders] = useState(false);

    const addedCategories = categories.filter(x => !!note.getTag(x));

    useEffect(() => {
        async function fetch() {
            setCategories((await notu.getNotes(`#[Money.Budget Category] AND name IS NOT NULL`)).map(x => x.ownTag));
        }
        fetch();
    }, []);

    function onCurrencyAmountChange(value: number) {
        data.accountCurrencyAmount = value;
        data.baseCurrencyAmount = value;
        realignCategoryValues([], addedCategories.map(x => TransactionCategoryData.new(note.getTag(x))));
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

    function getAvailableCategories(): Array<Tag> {
        return categories.filter(x => !note.getTag(x));
    }

    function onCategorySelected(categoryId: number) {
        const category = categories.find(x => x.id == categoryId);
        if (!!category) {
            const categoryData = TransactionCategoryData.addTag(note, category);
            categoryData.value = data.baseCurrencyAmount;
            realignCategoryValues([], [categoryData, ...addedCategories.map(x => TransactionCategoryData.new(note.getTag(x)))]);
            refreshCallback();
        }
    }

    function floorToPenny(value: number) {
        return Math.floor(value * 100) / 100;
    }

    function realignCategoryValues(
        unchangingCategories: Array<TransactionCategoryData>,
        changingCategories: Array<TransactionCategoryData>
    ): void {
        const baseCurrencyAmount = Math.abs(data.baseCurrencyAmount);
        let unchangingCategoryValueSum = sum(unchangingCategories.map(x => Math.abs(x.value)));
        let changingCategoryValueSum = sum(changingCategories.map(x => Math.abs(x.value)));
        const overshoot = changingCategoryValueSum + unchangingCategoryValueSum - baseCurrencyAmount;
        if (overshoot > 0) {
            const changingValueMultiplier = (changingCategoryValueSum - overshoot) / changingCategoryValueSum;
            for (const cat of changingCategories)
                cat.value = floorToPenny(Math.abs(cat.value) * changingValueMultiplier);
            //We've been rounding down in our calculations, this will make sure we don't have any leftover pennies
            changingCategoryValueSum = sum(changingCategories.map(x => Math.abs(x.value)));
            const remainingPennies = Math.round((changingCategoryValueSum + unchangingCategoryValueSum - baseCurrencyAmount) * 100);
            for (let i = 0; i < remainingPennies; i++)
                changingCategories[i].value += 0.01;
        }
        //We've been working with everything in positive values, make sure to flip things back to negative if necessary
        const negativeMultiplier = data.baseCurrencyAmount < 0 ? -1 : 1;
        for (const cat of unchangingCategories)
            cat.value = Math.abs(cat.value) * negativeMultiplier;
        for (const cat of changingCategories)
            cat.value = Math.abs(cat.value) * negativeMultiplier;
    }

    function onCategoryValueChange(category: Tag, newValue: number) {
        const baseCurrencyAmount = Math.abs(data.baseCurrencyAmount);
        const categoryData = TransactionCategoryData.new(note.getTag(category));
        categoryData.value = floorToPenny(Math.max(0, Math.min(baseCurrencyAmount, Math.abs(newValue))));
        const otherCategoryData = addedCategories
            .filter(x => x.id != category.id)
            .map(x => TransactionCategoryData.new(note.getTag(x)));
        realignCategoryValues([categoryData], otherCategoryData);
        refreshCallback();
    }

    function toggleShowCategoryValueSliders() {
        setShowCategoryValueSliders(!showCategoryValueSliders);
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
                <Label marginInlineEnd={10}>Categories</Label>
                {addedCategories.length > 0 && (
                    <NotuText pressable onPress={toggleShowCategoryValueSliders}>
                        {showCategoryValueSliders ? 'Show Number Inputs' : 'Show Percentage Sliders'}
                    </NotuText>
                )}
            </XStack>
            <NotuSelect value={null}
                        options={getAvailableCategories().map(x => ({ name: x.name, value: x.id }))}
                        onValueChange={onCategorySelected} />

            {addedCategories.map((category, index) => {
                const categoryData = TransactionCategoryData.new(note.getTag(category));
                return (
                    <XStack key={index} style={{alignItems: 'center'}}>
                        <Label width={labelWidth}>{category.name}</Label>
                        {showCategoryValueSliders && (
                            <Slider size="$6" width={200}
                                    value={[Math.round((categoryData.value / data.baseCurrencyAmount) * 100)]}
                                    onValueChange={values => onCategoryValueChange(category, (values[0] / 100) * data.baseCurrencyAmount)}
                                    min={0} max={100} step={1}>
                                <Slider.Track>
                                    <Slider.TrackActive />
                                </Slider.Track>
                                <Slider.Thumb circular size="$2" index={0} />
                            </Slider>
                        )}
                        {!showCategoryValueSliders && (
                            <NumberInput numberValue={categoryData.value}
                                         onNumberChange={value => onCategoryValueChange(category, value)} />
                        )}
                    </XStack>
                )
            })}

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