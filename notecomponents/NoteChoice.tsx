import { NoteComponentContainer } from "@/components/NoteComponentContainer";
import { NotuCustomSelect } from "@/components/NotuCustomSelect";
import { NumberInput } from "@/components/NumberInput";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteActionsMenuBuilder } from "@/helpers/NoteAction";
import { NotuButton, NotuInput, NotuText } from "@/helpers/NotuStyles";
import { SquarePen } from "@tamagui/lucide-icons";
import { randomInt } from "es-toolkit";
import { NmlElement, Note, Notu } from "notu";
import { useState } from "react";
import { Dialog, View, YStack } from "tamagui";
import { NoteText } from "./NoteText";

class NoteChoiceOption {
    private _content: Array<any>;
    get content(): Array<any> { return this._content; }

    weight: number;

    constructor(content: Array<any>, weight: number) {
        this._content = content;
        this.weight = weight;
    }

    getText(): string {
        const weightText = (this.weight == 1)
            ? ''
            : ` weight="${this.weight}"`
        return `<Option${weightText}>${this.content.map(x => x.getText()).join('')}</Option>`;
    }
}


export class NoteChoice {
    private _options: Array<NoteChoiceOption>;
    get options(): Array<NoteChoiceOption> { return this._options; }

    selectedIndex: number = 0;

    private _save: () => Promise<void>;

    constructor(
        options: Array<NoteChoiceOption>,
        selectedIndex: number,
        save: () => Promise<void>
    ) {
        this._options = options;
        this.selectedIndex = selectedIndex;
        this._save = save;
    }

    shuffleSelection(): void {
        if (this.options.length > 1) {
            let newIndex = randomInt(this._options.length - 1);
            if (newIndex == this.selectedIndex)
                newIndex++;
            this.selectedIndex = newIndex;
        }
    }

    render() {
        if (this.options.length == 0)
            return;

        const manualRefresh = useManualRefresh();
        const [showSelect, setShowSelect] = useState(false);
        const myself = this;
        const selectedOption = this.options[this.selectedIndex % this.options.length];

        function getSelectOptions(): Array<{name: string, value: any}> {
            if (!showSelect)
                return [];
            const output = [{name: '-- Random --', value: -1}];
            for (let i = 0; i < myself.options.length; i++) {
                const option = myself.options[i];
                output.push({name: getOptionSelectText(option), value: i});
            }
            return output;
        }

        function getOptionSelectText(option: NoteChoiceOption): string {
            if (option.content.length == 0)
                return '-- Empty --';
            let output = option.content[0].getText() as string;
            if (output.length > 50)
                output = output.substring(0, 47) + '...';
            else if (option.content.length > 1)
                output += '...';
            return output;
        }

        function onOptionSelected(value: number) {
            if (value == -1)
                myself.shuffleSelection();
            else
                myself.selectedIndex = value;
            myself._save();
            setShowSelect(false);
        }

        return (
            <NotuText>
                {selectedOption.content.map((x, index) => (
                    <NoteComponentContainer key={index} component={x} />
                ))}
                <NotuText> </NotuText>
                <SquarePen size={14} onPress={() => setShowSelect(true)} />
                <NotuCustomSelect open={showSelect}
                                  onValueChange={onOptionSelected}
                                  options={getSelectOptions()} />
            </NotuText>
        );
    }

    renderForEdit(color: () => string) {
        const [optionUnderEdit, setOptionUnderEdit] = useState<NoteChoiceOption>(null);
        const manualRefresh = useManualRefresh();
        const [selectedColor, setSelectedColor] = useState(color());
        const myself = this;

        function handleWeightChange(value: number) {
            optionUnderEdit.weight = value;
            manualRefresh();
        }

        function removeOptionBeingEdited() {
            const index = myself.options.indexOf(optionUnderEdit);
            if (index >= 0)
                myself.options.splice(index, 1);
            if (myself.selectedIndex > index)
                myself.selectedIndex--;
            setOptionUnderEdit(null);
        }

        function canEditOptionContent(option: NoteChoiceOption): boolean {
            if (option == null)
                return false;
            return option.content.length == 0 ||
                (option.content.length == 1 && option.content[0].typeInfo == 'NoteText');
        }

        function getOptionContentValue(option: NoteChoiceOption): string {
            if (!canEditOptionContent(option))
                return '';
            if (option.content.length == 0)
                return '';
            return option.content[0].displayText;
        }

        function handleOptionContentChange(option: NoteChoiceOption, newValue: string): void {
            if (newValue.length == 0 && option.content.length == 1) {
                option.content.pop();
                manualRefresh();
                return;
            }
            if (option.content.length == 0)
                option.content.push(new NoteText(newValue));
            else
                option.content[0] = new NoteText(newValue);
            manualRefresh();
        }

        function addNewOption(): void {
            myself.options.push(new NoteChoiceOption([], 1));
            manualRefresh();
        }

        return (
            <YStack bg={selectedColor as any} width="100%">
                <NotuText bold> Choice</NotuText>
                {myself.options.map((option, index) => (
                    <NotuText key={`option${index}`}>
                        <NotuText> </NotuText>
                        <NotuText pressable onPress={() => setOptionUnderEdit(option)}>Edit</NotuText>
                        <NotuText> </NotuText>
                        {option.content.map((x, index2) => (
                            <NoteComponentContainer key={`x${index2}`}
                                                    component={x}
                                                    color={color}
                                                    editMode={true} />
                        ))}
                    </NotuText>
                ))}
                <NotuText> <NotuText pressable onPress={addNewOption}>Add Option</NotuText></NotuText>

                <Dialog modal open={optionUnderEdit != null}>
                    <Dialog.Portal>
                        <Dialog.Overlay key="notechoiceoptionoverlay"
                                        onPress={() => setOptionUnderEdit(null)} />
                        <Dialog.FocusScope>
                            <Dialog.Content bordered elevate
                                            width="80%"
                                            key="notechoiceoptioncontent">
                                {canEditOptionContent(optionUnderEdit) && (
                                    <View>
                                        <NotuText>Content</NotuText>
                                        <NotuInput value={getOptionContentValue(optionUnderEdit)}
                                                   onChangeText={newValue => handleOptionContentChange(optionUnderEdit, newValue)} />
                                    </View>
                                )}
                                <NotuText>Random Weight</NotuText>
                                <NumberInput numberValue={optionUnderEdit?.weight ?? 1}
                                             onNumberChange={handleWeightChange} />
                                <NotuButton theme="danger"
                                            onPress={removeOptionBeingEdited}
                                            marginBlockStart={10}>
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
        return `<Choice selectedIndex="${this.selectedIndex}">\n${this.options.map(x => '  ' + x.getText()).join('\n')}\n</Choice>`;
    }

    get typeInfo(): string { return 'NoteChoice'; }

    get displaysInline(): boolean { return true; }

    get displaysInlineForEdit(): boolean { return false; }

    getThisPlusAllChildComponents(): Array<any> {
        const output = [this];
        for (const option of this.options) {
            for (const cnt of option.content) {
                output.push(...cnt.getThisPlusAllChildComponents());
            }
        }
        return output;
    }
        
    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
    }
}


export class NoteChoiceProcessor {

    get displayName(): string { return 'Choice'; }

    get tagName(): string { return 'Choice'; }

    newComponentText(textContent: string): string {
        return `<Choice selectedIndex="0">
    <Option>${textContent}</Option>
</Choice>`;
    }

    create(
        data: NmlElement,
        note: Note,
        save: () => Promise<void>,
        childComponentFactory: (childElement: string | NmlElement) => any
    ): NoteChoice {
        const options: Array<NoteChoiceOption> = [];
        for (const child of data.children) {
            if (typeof child === 'string') {
                options.push(...child
                    .split('\n')
                    .map(x => x.trim())
                    .filter(x => !!x)
                    .map(x => new NoteChoiceOption([childComponentFactory(x)], 1))
                )
            }
            else if (child.tag == 'Option') {
                options.push(new NoteChoiceOption(
                    child.children.map(x => childComponentFactory(x)),
                    this._parseOptionWeight(child)
                ));
            }
            else
                options.push(new NoteChoiceOption([childComponentFactory(child)], 1));
        }

        let selectedIndex = 0;
        if (data.attributes.hasOwnProperty('selectedIndex')) {
            selectedIndex = Number.parseInt(data.attributes['selectedIndex']);
            if (Number.isNaN(selectedIndex))
                selectedIndex = 0;
        }
        selectedIndex = Math.max(0, Math.min(selectedIndex, options.length - 1));

        return new NoteChoice(options, selectedIndex, save);
    }

    private _parseOptionWeight(optionElement: NmlElement): number {
        if (!optionElement.attributes.hasOwnProperty('weight'))
            return 1;
        const parsedVal = Number.parseFloat(optionElement.attributes['weight']);
        if (Number.isNaN(parsedVal))
            return 1;
        return parsedVal;
    }
}