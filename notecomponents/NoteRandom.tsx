import { NoteComponentContainer } from "@/components/NoteComponentContainer";
import { NumberInput } from "@/components/NumberInput";
import { useManualRefresh } from "@/helpers/Hooks";
import { NotuButton, NotuText } from "@/helpers/NotuStyles";
import { randomInt } from "es-toolkit";
import { NmlElement, Note } from "notu";
import { useState } from "react";
import { Dialog, YStack } from "tamagui";

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

    renderForEdit() {
        const [choiceIndexBeingEdited, setChoiceIndexBeingEdited] = useState(-1);
        const manualRefresh = useManualRefresh();
        const myself = this;

        const choiceBeingEdited: NoteRandomChoice = (choiceIndexBeingEdited == -1)
            ? new NoteRandomChoice([], 1)
            : myself.choices[choiceIndexBeingEdited];

        function handleWeightChange(value: number) {
            choiceBeingEdited.weight = value;
            manualRefresh();
        }

        function removeChoiceBeingEdited() {
            myself.choices.splice(choiceIndexBeingEdited, 1);
            if (myself.selectedIndex > choiceIndexBeingEdited)
                myself.selectedIndex--;
            setChoiceIndexBeingEdited(-1);
        }

        return (
            <YStack bg="#0000FF">
                <NotuText bold>Random</NotuText>
                {myself.choices.map((choice, index) => (
                    <NotuText key={`choice${index}`}
                          onPress={() => setChoiceIndexBeingEdited(index)}>
                        {choice.content.map((x, index2) => (
                            <NoteComponentContainer key={`x${index2}`}
                                                    component={x}
                                                    editMode={true} />
                        ))}
                    </NotuText>
                ))}

                    <Dialog modal open={choiceIndexBeingEdited != -1}>
                        <Dialog.Portal>
                            <Dialog.Overlay key="noterandomchoiceoverlay"
                                            onPress={() => setChoiceIndexBeingEdited(-1)} />
                            <Dialog.FocusScope>
                                <Dialog.Content bordered elevate
                                                width="80%"
                                                key="noterandomchoicecontent">
                                    <NotuText>
                                        {choiceBeingEdited.content.map((x, index) => (
                                            <NoteComponentContainer key={`${index}`} component={x} />
                                        ))}
                                    </NotuText>
                                    <NotuText>Weight</NotuText>
                                    <NumberInput value={choiceBeingEdited.weight ?? 1}
                                                onChange={handleWeightChange} />
                                    <NotuButton danger onPress={removeChoiceBeingEdited}>
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