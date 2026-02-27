import { NoteViewer } from "@/components/NoteViewer";
import { useManualRefresh } from "@/helpers/Hooks";
import { PreviousScreenAction, ShowNoteListAction, UIAction } from "@/helpers/NoteAction";
import { NotuRenderTools } from "@/helpers/NotuRenderTools";
import { NotuButton } from "@/helpers/NotuStyles";
import { Check } from "@tamagui/lucide-icons";
import { Note } from "notu";
import { Checkbox, View, XStack } from "tamagui";
import { generateShoppingList, GenerateShoppingListProcessContext } from "./GenerateShoppingListProcess";

export async function showSelectMealsScreen(
    context: GenerateShoppingListProcessContext
): Promise<UIAction> {

    const allAvailableMeals = await context.getScheduledMeals();
    let selectedMeals = [...allAvailableMeals];

    const action = new ShowNoteListAction(
        allAvailableMeals,
        `Select meals to shop for`,
        (
            note: Note,
            notuRenderTools: NotuRenderTools,
            onUIAction: (action: UIAction) => void
        ) => {
            const manualRefresh = useManualRefresh();

            function handleCheckChange() {
                if (!!selectedMeals.find(x => x.id == note.id))
                    selectedMeals = selectedMeals.filter(x => x.id != note.id);
                else
                    selectedMeals.push(note);
                manualRefresh();
            }

            return (
                <XStack>
                    <Checkbox checked={!!selectedMeals.find(x => x.id == note.id)}
                              onCheckedChange={handleCheckChange}>
                        <Checkbox.Indicator>
                            <Check />
                        </Checkbox.Indicator>
                    </Checkbox>

                    <View flex={1}>
                        <NoteViewer note={note}
                                    notuRenderTools={notuRenderTools}
                                    onUIAction={onUIAction} />
                    </View>
                </XStack>
            );
        }
    );
    action.footer = (onUIAction: (action: UIAction) => void) => (
        <NotuButton theme="highlight" onPress={() => doGenerate(selectedMeals, context, onUIAction)}>Generate</NotuButton>
    );
    return action;
}

async function doGenerate(
    selectedMeals: Array<Note>,
    context: GenerateShoppingListProcessContext,
    onUIAction: (action: UIAction) => void
) {
    const shoppingList = generateShoppingList(selectedMeals, context);
    await context.save(shoppingList);
    onUIAction(new PreviousScreenAction());
}