import { NoteComponentContainer } from "@/components/NoteComponentContainer";
import { NumberInput } from "@/components/NumberInput";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteActionsMenuBuilder } from "@/helpers/NoteAction";
import { NotuButton, NotuInput, NotuText } from "@/helpers/NotuStyles";
import { randomInt } from "es-toolkit";
import { NmlElement, Note, Notu } from "notu";
import { useState } from "react";
import { Dialog, View, YStack } from "tamagui";
import { NoteText } from "./NoteText";

class NoteRandomChoice {
    private _content: Array<any>;
    get content(): Array<any> { return this._content; }

    weight: number;

    constructor(content: Array<any>, weight: number) {
        this._content = content;
        this.weight = weight;
    }

    getText(): string {
        return `<Choice weight="${this.weight}">${this.content.map(x => x.getText()).join('')}</Choice>`;
    }
}


export class NoteRandom {
    private _choices: Array<NoteRandomChoice>;
    get choices(): Array<NoteRandomChoice> { return this._choices; }

    selectedIndex: number = 0;

    constructor(
        choices: Array<NoteRandomChoice>,
        selectedIndex: number
    ) {
        this._choices = choices;
        this.selectedIndex = selectedIndex;
    }

    changeSelection(): void {
        if (this.choices.length > 0)
            this.selectedIndex = randomInt(this._choices.length);
    }

    render() {
        if (this.choices.length == 0)
            return;

        const selectedChoice = this.choices[this.selectedIndex % this.choices.length];

        return (
            <NotuText>
                {selectedChoice.content.map((x, index) => (
                    <NoteComponentContainer key={index} component={x} />
                ))}
            </NotuText>
        );
    }

    renderForEdit(color: () => string) {
        const [choiceUnderEdit, setChoiceUnderEdit] = useState<NoteRandomChoice>(null);
        const manualRefresh = useManualRefresh();
        const [selectedColor, setSelectedColor] = useState(color());
        const myself = this;

        function handleWeightChange(value: number) {
            choiceUnderEdit.weight = value;
            manualRefresh();
        }

        function removeChoiceBeingEdited() {
            const index = myself.choices.indexOf(choiceUnderEdit);
            if (index >= 0)
                myself.choices.splice(index, 1);
            if (myself.selectedIndex > index)
                myself.selectedIndex--;
            setChoiceUnderEdit(null);
        }

        function canEditChoiceContent(choice: NoteRandomChoice): boolean {
            if (choice == null)
                return false;
            return choice.content.length == 0 ||
                (choice.content.length == 1 && choice.content[0].typeInfo == 'NoteText');
        }

        function getChoiceContentValue(choice: NoteRandomChoice): string {
            if (!canEditChoiceContent(choice))
                return '';
            if (choice.content.length == 0)
                return '';
            return choice.content[0].displayText;
        }

        function handleChoiceContentChange(choice: NoteRandomChoice, newValue: string): void {
            if (newValue.length == 0 && choice.content.length == 1) {
                choice.content.pop();
                manualRefresh();
                return;
            }
            if (choice.content.length == 0)
                choice.content.push(new NoteText(newValue));
            else
                choice.content[0] = new NoteText(newValue);
            manualRefresh();
        }

        function addNewChoice(): void {
            myself.choices.push(new NoteRandomChoice([], 1));
            manualRefresh();
        }

        return (
            <YStack bg={selectedColor as any} width="100%">
                <NotuText bold> Random</NotuText>
                {myself.choices.map((choice, index) => (
                    <NotuText key={`choice${index}`}>
                        <NotuText> </NotuText>
                        <NotuText pressable onPress={() => setChoiceUnderEdit(choice)}>Edit</NotuText>
                        <NotuText> </NotuText>
                        {choice.content.map((x, index2) => (
                            <NoteComponentContainer key={`x${index2}`}
                                                    component={x}
                                                    color={color}
                                                    editMode={true} />
                        ))}
                    </NotuText>
                ))}
                <NotuText> <NotuText pressable onPress={addNewChoice}>Add Choice</NotuText></NotuText>

                <Dialog modal open={choiceUnderEdit != null}>
                    <Dialog.Portal>
                        <Dialog.Overlay key="noterandomchoiceoverlay"
                                        onPress={() => setChoiceUnderEdit(null)} />
                        <Dialog.FocusScope>
                            <Dialog.Content bordered elevate
                                            width="80%"
                                            key="noterandomchoicecontent">
                                {canEditChoiceContent(choiceUnderEdit) && (
                                    <View>
                                        <NotuText>Content</NotuText>
                                        <NotuInput value={getChoiceContentValue(choiceUnderEdit)}
                                                   onChangeText={newValue => handleChoiceContentChange(choiceUnderEdit, newValue)} />
                                    </View>
                                )}
                                <NotuText>Weight</NotuText>
                                <NumberInput value={choiceUnderEdit?.weight ?? 1}
                                             onChange={handleWeightChange} />
                                <NotuButton theme="danger" onPress={removeChoiceBeingEdited}>
                                    Remove
                                </NotuButton>
                            </Dialog.Content>
                        </Dialog.FocusScope>
                    </Dialog.Portal>
                </Dialog>
            </YStack>
        );
    }

    getText(): string {
        return `<Random selectedIndex="${this.selectedIndex}">\n${this.choices.map(x => '  ' + x.getText()).join('\n')}\n</Random>`;
    }

    get typeInfo(): string { return 'NoteRandom'; }

    get displaysInline(): boolean { return true; }

    get displaysInlineForEdit(): boolean { return false; }

    getThisPlusAllChildComponents(): Array<any> {
        const output = [this];
        for (const choice of this.choices) {
            for (const cnt of choice.content) {
                output.push(...cnt.getThisPlusAllChildComponents());
            }
        }
        return output;
    }
        
    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
    }
}


export class NoteRandomProcessor {

    get displayName(): string { return 'Random'; }

    get tagName(): string { return 'Random'; }

    newComponentText(textContent: string): string {
        return `<Random selectedIndex="0">
    <Choice weight="1">${textContent}</Choice>
</Random>`;
    }

    create(
        data: NmlElement,
        note: Note,
        save: () => Promise<void>,
        childComponentFactory: (childElement: string | NmlElement) => any
    ): NoteRandom {
        const choices: Array<NoteRandomChoice> = [];
        for (const child of data.children) {
            if (typeof child === 'string') {
                choices.push(...child
                    .split('\n')
                    .map(x => x.trim())
                    .filter(x => !!x)
                    .map(x => new NoteRandomChoice([childComponentFactory(x)], 1))
                )
            }
            else if (child.tag == 'Choice') {
                choices.push(new NoteRandomChoice(
                    child.children.map(x => childComponentFactory(x)),
                    this._parseChoiceWeight(child)
                ));
            }
            else
                choices.push(new NoteRandomChoice([childComponentFactory(child)], 1));
        }

        let selectedIndex = 0;
        if (data.attributes.hasOwnProperty('selectedIndex')) {
            selectedIndex = Number.parseInt(data.attributes['selectedIndex']);
            if (Number.isNaN(selectedIndex))
                selectedIndex = 0;
        }
        selectedIndex = Math.max(0, Math.min(selectedIndex, choices.length - 1));

        return new NoteRandom(choices, selectedIndex);
    }

    private _parseChoiceWeight(choiceElement: NmlElement): number {
        if (!choiceElement.attributes.hasOwnProperty('weight'))
            return 1;
        const parsedVal = Number.parseFloat(choiceElement.attributes['weight']);
        if (Number.isNaN(parsedVal))
            return 1;
        return parsedVal;
    }
}