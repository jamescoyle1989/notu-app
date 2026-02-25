import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText, NotuView } from "@/helpers/NotuStyles";
import { Check } from "@tamagui/lucide-icons";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Checkbox, XStack, YStack } from "tamagui";
import { MealData, MealGroupData, MealIngredientData, MealStepData } from "./MealNoteTagData";

export default class MealNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        const data = new MealData(noteTag);
        return (<NotuText bold small color={textColor}>{data.name}</NotuText>);
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} />)
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new MealData(noteTag);
    }
}


function EditorComponent({ noteTag }: NoteTagDataComponentProps) {
    const data = new MealData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;

    const ingredients = data.ingredients;
    const groups = data.groups;
    const steps = data.steps;

    function handleHideDoneItemsToggle() {
        data.hideDoneItems = !data.hideDoneItems;
        manualRefresh();
    }

    function renderIngredient(ingredient: MealIngredientData) {
        if (ingredient.done && data.hideDoneItems)
            return;
        
        const doubleTap = Gesture.Tap().numberOfTaps(2).onEnd(() => {
            ingredient.done = !ingredient.done;
            manualRefresh();
        }).runOnJS(true);
        return (
            <GestureDetector gesture={doubleTap} key={ingredient.id}>
                <NotuText strikethrough={ingredient.done}>{ingredient.quantity} {ingredient.name}</NotuText>
            </GestureDetector>
        );
    }

    function renderGroup(group: MealGroupData) {
        const groupIngredients = ingredients.filter(x => x.groupId == group.id);
        if (groupIngredients.filter(x => !x.done).length == 0 && data.hideDoneItems)
            return;

        return (
            <NotuView key={group.id} marginBlockStart={10}>
                <NotuText bold>{group.name}</NotuText>

                {groupIngredients.map(renderIngredient)}
            </NotuView>
        );
    }

    function renderStep(step: MealStepData, index: number) {
        if (step.done && data.hideDoneItems)
            return;

        const stepData = step.data;
        const doubleTap = Gesture.Tap().numberOfTaps(2).onEnd(() => {
            stepData.done = !stepData.done;
            manualRefresh();
        }).runOnJS(true);
        return (
            <GestureDetector gesture={doubleTap} key={index}>
                <NotuText strikethrough={step.done}>{step.text}</NotuText>
            </GestureDetector>
        );
    }

    return (
        <YStack>
            <XStack style={{alignItems: 'center'}}>
                <NotuText width={labelWidth}>Name</NotuText>
                <NotuText bold>{data.name}</NotuText>
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <NotuText width={labelWidth}>Servings</NotuText>
                <NotuText bold>{data.servings}</NotuText>
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <NotuText width={labelWidth}>Hide done items</NotuText>
                <Checkbox checked={data.hideDoneItems}
                          onCheckedChange={() => handleHideDoneItemsToggle()}>
                    <Checkbox.Indicator>
                        <Check />
                    </Checkbox.Indicator>
                </Checkbox>
            </XStack>

            <NotuText bold underline big marginBlockStart={10}>Ingredients</NotuText>

            {ingredients.filter(x => x.groupId == null).map(renderIngredient)}

            {groups.map(renderGroup)}

            <NotuText bold underline big marginBlockStart={10}>Steps</NotuText>

            {steps.map(renderStep)}
        </YStack>
    );
}