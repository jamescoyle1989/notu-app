import { NotuCustomSelect } from "@/components/NotuCustomSelect";
import { NumberInput } from "@/components/NumberInput";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText, NotuView } from "@/helpers/NotuStyles";
import { Check, X } from "@tamagui/lucide-icons";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode, useState } from "react";
import { Checkbox, Input, Label, XStack, YStack } from "tamagui";
import { RecipeData, RecipeGroupData, RecipeIngredientData, RecipeStepData } from "./RecipeNoteTagData";

export default class RecipeNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        const data = new RecipeData(noteTag);
        return (<NotuText bold small color={textColor}>{data.name}</NotuText>);
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} refreshCallback={refreshCallback} />)
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new RecipeData(noteTag);
    }
}


function EditorComponent({ noteTag, refreshCallback }: NoteTagDataComponentProps) {
    const data = new RecipeData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;
    const [selectedId, setSelectedId] = useState(0);
    const [selectedStepIndex, setSelectedStepIndex] = useState(-1);
    const [showStepConditionSelect, setShowStepConditionSelect] = useState(false);

    const ingredients = data.ingredients;
    const groups = data.groups;
    const steps = data.steps;

    function handleNameChange(value: string) {
        data.name = value;
        refreshCallback();
    }

    function handleServingsChange(value: number) {
        data.servings = value;
        refreshCallback();
    }

    function deselectAll() {
        setSelectedId(0);
        setSelectedStepIndex(-1);
    }

    function handleAddIngredient() {
        const ingredient = data.addIngredient(new RecipeIngredientData(noteTag));
        setSelectedId(ingredient.id);
        setSelectedStepIndex(-1);
    }

    function handleIngredientPress(ingredient: RecipeIngredientData) {
        setSelectedId(ingredient.id);
        setSelectedStepIndex(-1);
    }

    function handleIngredientNameChange(ingredient: RecipeIngredientData, value: string) {
        ingredient.name = value;
        manualRefresh();
    }

    function handleIngredientQuantityChange(ingredient: RecipeIngredientData, value: string) {
        ingredient.quantity = value;
        manualRefresh();
    }

    function onIngredientOptionalChange(ingredient: RecipeIngredientData) {
        ingredient.optional = !ingredient.optional;
        manualRefresh();
    }

    function handleIngredientAliasChange(ingredient: RecipeIngredientData, value: string) {
        ingredient.alias = value;
        manualRefresh();
    }

    function handleRemoveIngredient(ingredient: RecipeIngredientData) {
        data.removeIngredient(ingredient.id);
        deselectAll();
        manualRefresh();
    }

    function handleAddGroup() {
        const group = data.addGroup(new RecipeGroupData(noteTag));
        setSelectedId(group.id);
        setSelectedStepIndex(-1);
    }

    function handleGroupNameChange(group: RecipeGroupData, value: string) {
        group.name = value;
        manualRefresh();
    }

    function onGroupOptionalChange(group: RecipeGroupData) {
        group.optional = !group.optional;
        manualRefresh();
    }

    function handleAddGroupIngredient(group: RecipeGroupData) {
        const ingredient = data.addIngredient(new RecipeIngredientData(noteTag));
        ingredient.groupId = group.id;
        setSelectedId(ingredient.id);
        setSelectedStepIndex(-1);
    }

    function handleGroupPress(group: RecipeGroupData) {
        setSelectedId(group.id);
        setSelectedStepIndex(-1);
    }

    function handleRemoveGroup(group: RecipeGroupData) {
        data.removeGroup(group.id);
        deselectAll();
        manualRefresh();
    }

    function handleAddStep() {
        data.addStep(new RecipeStepData(noteTag));
        setSelectedId(0);
        setSelectedStepIndex(steps.length);
    }

    function handleStepTextChange(step: RecipeStepData, value: string) {
        step.text = value;
        manualRefresh();
    }

    function getAvailableConditions(step: RecipeStepData): Array<{name: string, value: any}> {
        const output = new Array<{name: string, value: any}>();
        if (!step)
            return output;
        for (const ingredient of ingredients.filter(x => x.optional))
            output.push({name: ingredient.name, value: ingredient.id});
        for (const group of groups.filter(x => x.optional))
            output.push({name: group.name, value: group.id});
        return output.filter(x => !step.condition.includes(x.value));
    }

    function getStepConditionText(conditionId: number) {
        if (conditionId < 0) {
            const group = groups.find(x => x.id == conditionId);
            return group.name;
        }
        const ingredient = ingredients.find(x => x.id == conditionId);
        return `${ingredient.quantity} ${ingredient.name}`.trim();
    }

    function startAddingStepCondition() {
        setShowStepConditionSelect(true);
    }

    function handleStepConditionChange(step: RecipeStepData, value: number) {
        step.condition.push(value);
        setShowStepConditionSelect(false);
    }

    function handleStepPress(stepIndex: number) {
        setSelectedStepIndex(stepIndex);
        setSelectedId(0);
    }

    function toggleStepConditionType(step: RecipeStepData) {
        step.conditionType = (step.conditionType == 'AND') ? 'OR' : 'AND';
        manualRefresh();
    }

    function handleRemoveStepCondition(step: RecipeStepData, conditionId: number) {
        step.condition = step.condition.filter(x => x != conditionId);
        manualRefresh();
    }

    function handleRemoveStep(stepIndex: number) {
        data.removeStep(stepIndex);
        manualRefresh();
    }

    function renderIngredientLine(ingredient: RecipeIngredientData, asBox: boolean) {
        return (
            <NotuView bg="$background"
                      box={asBox}
                      key={ingredient.id}
                      borderRadius={10}
                      marginBlockStart={10}
                      padding={5}
                      onPress={() => handleIngredientPress(ingredient)}>
                <XStack>
                    <NotuText flex={1}>{ingredient.quantity} {ingredient.name} {ingredient.optional ? '(Optional)' : ''}</NotuText>
                    <X size={17} color="red" onPress={() => handleRemoveIngredient(ingredient)} />
                </XStack>
            </NotuView>
        );
    }

    function renderIngredientEditor(ingredient: RecipeIngredientData) {
        return (
            <NotuView bg="$background"
                      borderRadius={10}
                      marginBlockStart={10}
                      key={ingredient.id}
                      padding={5}>

                <XStack style={{alignItems: 'center'}}>
                    <Label width={labelWidth}>Name</Label>
                    <Input value={ingredient.name}
                           onChangeText={value => handleIngredientNameChange(ingredient, value)}
                           flex={1} />
                </XStack>

                <XStack style={{alignItems: 'center'}}>
                    <Label width={labelWidth}>Quantity</Label>
                    <Input value={ingredient.quantity}
                           onChangeText={value => handleIngredientQuantityChange(ingredient, value)}
                           flex={1} />
                </XStack>

                <XStack style={{alignItems: 'center'}}>
                    <Label width={labelWidth}>Optional</Label>
                    <Checkbox checked={ingredient.optional}
                              onCheckedChange={() => onIngredientOptionalChange(ingredient)}>
                        <Checkbox.Indicator>
                            <Check />
                        </Checkbox.Indicator>
                    </Checkbox>
                </XStack>

                <XStack style={{alignItems: 'center'}}>
                    <Label width={labelWidth}>Alias</Label>
                    <Input value={ingredient.alias ?? ''}
                           onChangeText={value => handleIngredientAliasChange(ingredient, value)}
                           flex={1} />
                </XStack>
            </NotuView>
        );
    }

    return (
        <YStack>
            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Name</Label>
                <Input value={data.name} onChangeText={handleNameChange} flex={1} />
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Servings</Label>
                <NumberInput numberValue={data.servings}
                             onNumberChange={handleServingsChange} flex={1} />
            </XStack>

            <NotuText bold onPress={deselectAll}>Ingredients</NotuText>

            {ingredients.filter(x => x.groupId == null).map(ingredient => {
                if (ingredient.id == selectedId && ingredient.groupId == null)
                    return renderIngredientEditor(ingredient);
                else
                    return renderIngredientLine(ingredient, false);
            })}

            <NotuText pressable onPress={handleAddIngredient}>Add Ingredient</NotuText>

            {groups.map(group => {
                if (group.id == selectedId) {
                    return (
                        <NotuView bg="$background"
                                  borderRadius={10}
                                  marginBlockStart={10}
                                  key={group.id}
                                  padding={5}>

                            <XStack style={{alignItems: 'center'}}>
                                <Label width={labelWidth}>Name</Label>
                                <Input value={group.name}
                                       onChangeText={value => handleGroupNameChange(group, value)}
                                       flex={1} />
                            </XStack>

                            <XStack style={{alignItems: 'center'}}>
                                <Label width={labelWidth}>Optional</Label>
                                <Checkbox checked={group.optional}
                                          onCheckedChange={() => onGroupOptionalChange(group)}>
                                    <Checkbox.Indicator>
                                        <Check />
                                    </Checkbox.Indicator>
                                </Checkbox>
                            </XStack>

                            {ingredients.filter(x => x.groupId == group.id).map(ingredient => 
                                {renderIngredientLine(ingredient, true)}
                            )}

                            <NotuText pressable onPress={() => handleAddGroupIngredient(group)}>Add Ingredient</NotuText>

                        </NotuView>
                    )
                }
                else {
                    return (
                        <NotuView key={group.id}
                                  borderRadius={10}
                                  marginBlockStart={10}
                                  padding={5}
                                  onPress={() => handleGroupPress(group)}>
                            
                            <XStack>
                                <NotuText bold flex={1}>{group.name} {group.optional ? '(Optional)' : ''}</NotuText>
                                <X size={17} color="red" onPress={() => handleRemoveGroup(group)} />
                            </XStack>

                            {ingredients.filter(x => x.groupId == group.id).map(ingredient => (
                                <NotuView box key={ingredient.id}>
                                    {ingredient.id == selectedId && renderIngredientEditor(ingredient)}
                                    {ingredient.id != selectedId && renderIngredientLine(ingredient, false)}
                                </NotuView>
                            ))}

                            <NotuText pressable onPress={() => handleAddGroupIngredient(group)}>Add Ingredient</NotuText>
                        </NotuView>
                    )
                }
            })}

            <NotuText pressable onPress={handleAddGroup}>Add Group</NotuText>

            <NotuText bold onPress={deselectAll}>Steps</NotuText>

            {steps.map((step, index) => {
                if (index == selectedStepIndex) {
                    return (
                        <NotuView bg="$background"
                                  borderRadius={10}
                                  marginBlockStart={10}
                                  key={index}
                                  padding={5}>

                            <Input value={step.text}
                                   onChangeText={value => handleStepTextChange(step, value)}
                                   flex={1} multiline={true} />

                            <NotuText>
                                <NotuText pressable onPress={startAddingStepCondition}>
                                    Add Condition
                                </NotuText>
                                {step.condition.length > 1 && (
                                    <NotuText>
                                        <NotuText> - Condition Type: </NotuText>
                                        <NotuText pressable onPress={() => toggleStepConditionType(step)}>{step.conditionType}</NotuText>
                                    </NotuText>
                                )}
                            </NotuText>
                            
                            {step.condition.map(conditionId => (
                                <XStack key={conditionId}>
                                    <NotuView flex={1}>
                                        <NotuText>{getStepConditionText(conditionId)}</NotuText>
                                    </NotuView>
                                    <X size={17} color="red" onPress={() => handleRemoveStepCondition(step, conditionId)} />
                                </XStack>
                            ))}
                        </NotuView>
                    )
                }
                else {
                    return (
                        <NotuView bg="$background"
                                  key={index}
                                  borderRadius={10}
                                  marginBlockStart={10}
                                  padding={5}
                                  onPress={() => handleStepPress(index)}>
                            <XStack style={{alignItems: 'center'}}>
                                <NotuText flex={1}>{step.text}</NotuText>
                                <X size={17} color="red" onPress={() => handleRemoveStep(index)} />
                            </XStack>
                        </NotuView>
                    )
                }
            })}

            <NotuCustomSelect options={getAvailableConditions(steps[selectedStepIndex])}
                              onValueChange={value => handleStepConditionChange(steps[selectedStepIndex], value)}
                              open={showStepConditionSelect && selectedStepIndex >= 0} />

            <NotuText pressable onPress={handleAddStep}>Add Step</NotuText>
        </YStack>
    );
}