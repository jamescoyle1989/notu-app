import { ShowCustomPageAction, ShowEditorAction, UIAction } from "@/helpers/NoteAction";
import { NotuText, NotuView } from "@/helpers/NotuStyles";
import { Check } from "@tamagui/lucide-icons";
import { Note, Notu } from "notu";
import { useState } from "react";
import { Button, Checkbox, XStack, YStack } from "tamagui";
import { FoodSpace } from "./FoodSpace";
import { generateMeal, GenerateMealProcessContext } from "./GenerateMealProcess";
import { GenerateMealProcessData } from "./GenerateMealProcessNoteTagData";
import { RecipeData } from "./RecipeNoteTagData";

export function showCustomiseMealScreen(
    recipe: Note,
    notu: Notu,
    processData: GenerateMealProcessData
): UIAction {

    const foodSpace = new FoodSpace(notu);
    const recipeData = RecipeData.new(recipe.getTag(foodSpace.recipe));
    const processContext = new GenerateMealProcessContext(processData, notu);

    if (!recipeData) {
        return new ShowCustomPageAction(
            'Customise Meal',
            onUIAction => (
                <NotuView marginBlock={10} marginInline={10}>
                    {!recipeData && (
                        <NotuText>This process can only be run against a note that contains a recipe.</NotuText>
                    )}
                </NotuView>
            )
        );
    }

    const allIngredients = recipeData.ingredients;
    const optionalIngredients = allIngredients.filter(x => x.optional);
    const groupRequiredIngredients = allIngredients.filter(x => x.groupId != null && !x.optional);
    const groups = recipeData.groups.filter(x => x.optional || optionalIngredients.find(ing => ing.groupId == x.id));
    
    return new ShowCustomPageAction(
        'Customise Meal',
        onUIAction => {
            const [selectedItems, setSelectedItems] = useState<Array<number>>(new Array<number>());
            const selectedItemsMap = new Set<number>(selectedItems);

            function handleItemToggle(itemId: number) {
                if (selectedItemsMap.has(itemId))
                    setSelectedItems(selectedItems.filter(x => x != itemId));
                else
                    setSelectedItems([...selectedItems, itemId]);
            }

            const canConfirmMeal = (() => {
                //Make sure each selected/required group has at least one ingredient required/selected in it
                for (const group of groups) {
                    if (group.optional && !selectedItemsMap.has(group.id))
                        continue;
                    if (!!groupRequiredIngredients.find(x => x.groupId == group.id))
                        continue;
                    const optionals = optionalIngredients.filter(x => x.groupId == group.id);
                    if (!optionals.find(x => selectedItemsMap.has(x.id)))
                        return false;
                }
                return true;
            })();

            function confirmMeal() {
                const finalInclusions = [
                    ...selectedItems,
                    ...groupRequiredIngredients.filter(x => selectedItems.includes(x.groupId)).map(x => x.id)
                ];
                const meal = generateMeal(recipe, finalInclusions, processContext);
                onUIAction(new ShowEditorAction(meal));
            }
            
            return (
                <YStack marginBlock={10} marginInline={10}>
                    {optionalIngredients.filter(x => x.groupId == null).map(ing => (
                        <XStack style={{alignItems: 'center'}} marginBlockEnd={10} key={ing.id}>
                            <Checkbox checked={selectedItemsMap.has(ing.id)}
                                      onCheckedChange={() => handleItemToggle(ing.id)}>
                                <Checkbox.Indicator>
                                    <Check />
                                </Checkbox.Indicator>
                            </Checkbox>
                            <NotuText marginInlineStart={10}>{ing.quantity} {ing.name}</NotuText>
                        </XStack>
                    ))}

                    {groups.map(group => (
                        <YStack marginBlockStart={10} key={group.id}>
                            <XStack style={{alignItems: 'center'}} marginBlockEnd={10}>
                                {group.optional && (
                                    <Checkbox checked={selectedItemsMap.has(group.id)}
                                              onCheckedChange={() => handleItemToggle(group.id)}>
                                        <Checkbox.Indicator>
                                            <Check />
                                        </Checkbox.Indicator>
                                    </Checkbox>
                                )}
                                <NotuText bold underline marginInlineStart={10}>{group.name}</NotuText>
                            </XStack>
                            {(!group.optional || selectedItemsMap.has(group.id)) && optionalIngredients.filter(ing => ing.groupId == group.id).map(ing => (
                                <XStack style={{alignItems: 'center'}} marginBlockEnd={10} key={ing.id}>
                                    <Checkbox checked={selectedItemsMap.has(ing.id)}
                                              onCheckedChange={() => handleItemToggle(ing.id)}>
                                        <Checkbox.Indicator>
                                            <Check />
                                        </Checkbox.Indicator>
                                    </Checkbox>
                                    <NotuText marginInlineStart={10}>{ing.quantity} {ing.name}</NotuText>
                                </XStack>
                            ))}
                        </YStack>
                    ))}

                    <Button theme={canConfirmMeal ? 'highlight' : 'danger'}
                            marginBlockStart={10}
                            disabled={!canConfirmMeal}
                            onPress={confirmMeal}>
                        Generate
                    </Button>
                </YStack>
            );
        }
    );
}