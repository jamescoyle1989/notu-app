import { NoteAction, NoteActionsMenuBuilder, RefreshAction } from "@/helpers/NoteAction";
import { NotuInput, NotuText } from "@/helpers/NotuStyles";
import { Check } from "@tamagui/lucide-icons";
import { NmlElement, Note, Notu } from "notu";
import { useState } from "react";
import { Checkbox, Dialog, XStack, YStack } from "tamagui";
import { NoteComponentContainer } from "../components/NoteComponentContainer";
import { useManualRefresh } from "../helpers/Hooks";
import { NoteText } from "./NoteText";


class NoteChecklistLine {
    private _content: Array<any>;
    get content(): Array<any> { return this._content; }

    done: boolean;

    constructor(content: Array<any>, done: boolean) {
        this._content = content;
        this.done = done;
    }

    getText(): string {
        return `<Item${this.done ? ' done' : ''}>${this.content.map(x => x.getText()).join('')}</Item>`;
    }
}


export class NoteChecklist {
    private _lines: Array<NoteChecklistLine>;
    get lines(): Array<NoteChecklistLine> { return this._lines; }

    private _save: () => Promise<void>;

    constructor(
        lines: Array<NoteChecklistLine>,
        save: () => Promise<void>
    ) {
        this._lines = lines;
        this._save = save;
    }

    removeFinishedItems(): void {
        this._lines = this._lines.filter(x => !x.done);
    }

    render() {
        const manualRefresh = useManualRefresh();
        const myself = this;

        function onCheckboxChange(line: NoteChecklistLine) {
            line.done = !line.done;
            myself._save();
            manualRefresh();
        }

        return (
            <YStack>
                {this.lines.map((line, index) => (
                    <XStack key={index} marginBlock={2}>
                        <Checkbox checked={line.done}
                                  onCheckedChange={() => onCheckboxChange(line)}
                                  marginLeft={10} marginRight={5}>
                            <Checkbox.Indicator>
                                <Check />
                            </Checkbox.Indicator>
                        </Checkbox>
                        <NotuText>
                            {line.content.map((x, index) => (
                                <NoteComponentContainer key={index} component={x} />
                            ))}
                        </NotuText>
                    </XStack>
                ))}
            </YStack>
        );
    }

    renderForEdit() {
        const manualRefresh = useManualRefresh();
        const [lineUnderEdit, setLineUnderEdit] = useState<NoteChecklistLine>(null);
        const myself = this;

        function canEditLineContent(line: NoteChecklistLine): boolean {
            if (line == null)
                return false;
            return line.content.length == 0 ||
                (line.content.length == 1 && line.content[0].typeInfo == 'NoteText');
        }

        function getLineContentValue(line: NoteChecklistLine): string {
            if (!canEditLineContent(line))
                return '';
            if (line.content.length == 0)
                return '';
            return line.content[0].displayText;
        }

        function handleLineContentChange(line: NoteChecklistLine, newValue: string): void {
            if (newValue.length == 0 && line.content.length == 1) {
                line.content.pop();
                manualRefresh();
                return;
            }
            if (line.content.length == 0)
                line.content.push(new NoteText(newValue));
            else
                line.content[0] = new NoteText(newValue);
            manualRefresh();
        }

        function addNewLine(): void {
            myself.lines.push(new NoteChecklistLine([], false));
            manualRefresh();
        }

        return (
            <YStack bg="#00FF00">
                <NotuText bold>Checklist</NotuText>
                {this.lines.map((line, index) => (
                    <NotuText key={`line${index}`}>
                        {canEditLineContent(line) && (<NotuText pressable onPress={() => setLineUnderEdit(line)}>Edit </NotuText>)}
                        {line.content.map((x, index) => (
                            <NoteComponentContainer key={`x${index}`} component={x} editMode={true} />
                        ))}
                    </NotuText>
                ))}
                <NotuText pressable onPress={addNewLine}>Add Line</NotuText>

                <Dialog modal open={lineUnderEdit != null}>
                    <Dialog.Portal>
                        <Dialog.Overlay key="notechecklisteditoroverlay" onPress={() => setLineUnderEdit(null)} />
                        <Dialog.FocusScope>
                            <Dialog.Content bordered elevate
                                            width="80%"
                                            key="notechecklisteditorcontent">
                                <NotuText>Content</NotuText>
                                <NotuInput value={getLineContentValue(lineUnderEdit)}
                                           onChangeText={newValue => handleLineContentChange(lineUnderEdit, newValue)} />
                            </Dialog.Content>
                        </Dialog.FocusScope>
                    </Dialog.Portal>
                </Dialog>
            </YStack>
        );
    }

    getText(): string {
        return `<Checklist>\n${this._lines.map(x => '  ' + x.getText()).join('\n')}\n</Checklist>`;
    }

    get typeInfo(): string { return 'NoteChecklist'; }

    get displaysInline(): boolean { return false; }

    get displaysInlineForEdit(): boolean { return false; }

    getThisPlusAllChildComponents(): Array<any> {
        const output = [this];
        for (const line of this.lines) {
            for (const cnt of line.content) {
                output.push(...cnt.getThisPlusAllChildComponents());
            }
        }
        return output;
    }

    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
        if (!menuBuilder.actions.find(x => x.name == 'Remove checked off items')) {
            menuBuilder.addToBottomOfStart(
                new NoteAction('Removed checked off items',
                    async () => {
                        this.removeFinishedItems();
                        await this._save();
                        return new RefreshAction();
                    }
                )
            )
        }
    }
}


export class NoteChecklistProcessor {

    get displayName(): string { return 'Checklist'; }

    get tagName(): string { return 'Checklist'; }

    newComponentText(textContent: string): string {
        return `<Checklist>
${textContent}
</Checklist>`;
    }

    create(
        data: NmlElement,
        note: Note,
        save: () => Promise<void>,
        childComponentFactory: (childElement: string | NmlElement) => any
    ): NoteChecklist {
        const lines: Array<NoteChecklistLine> = [];
        for (const child of data.children) {
            if (typeof child === 'string') {
                lines.push(...child
                    .split('\n')
                    .map(x => x.trim())
                    .filter(x => !!x)
                    .map(x => new NoteChecklistLine([childComponentFactory(x)], false))
                );
            }
            else if (child.tag == 'Item') {
                lines.push(new NoteChecklistLine(
                    child.children.map(x => childComponentFactory(x)),
                    child.attributes.hasOwnProperty('done') && (
                        child.attributes['done'] == true ||
                        child.attributes['done'].toUpperCase() == 'TRUE'
                    )
                ));
            }
            else
                lines.push(new NoteChecklistLine([childComponentFactory(child)], false));
        }

        return new NoteChecklist(lines, save);
    }
}