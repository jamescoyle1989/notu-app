import { NotuButton, NotuText } from "@/helpers/NotuStyles";
import { Check } from "@tamagui/lucide-icons";
import { NmlElement, Note } from "notu";
import { Checkbox, XStack, YStack } from "tamagui";
import { NoteComponentContainer } from "../components/NoteComponentContainer";
import { useManualRefresh } from "../helpers/Hooks";


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
    
    showClearButton: boolean;

    private _save: () => Promise<void>;

    constructor(
        lines: Array<NoteChecklistLine>,
        showClearButton: boolean,
        save: () => Promise<void>
    ) {
        this._lines = lines;
        this.showClearButton = showClearButton;
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
                {this.showClearButton && (
                    <NotuButton danger>
                        Clear Completed Items
                    </NotuButton>
                )}
            </YStack>
        );
    }

    renderForEdit() {
        const manualRefresh = useManualRefresh();
        const myself = this;

        function onShowClearChange() {
            myself.showClearButton = !myself.showClearButton;
            manualRefresh();
        }

        return (
            <YStack bg="#00FF00">
                <XStack>
                    <NotuText bold>Checklist</NotuText>
                    <Checkbox checked={this.showClearButton}
                              onCheckedChange={() => onShowClearChange()}>
                        <Checkbox.Indicator>
                            <Check />
                        </Checkbox.Indicator>
                    </Checkbox>
                    <NotuText>Show Clear Button</NotuText>
                </XStack>
                {this.lines.map((line, index) => (
                    <NotuText key={`line${index}`}>
                        {line.content.map((x, index) => (
                            <NoteComponentContainer key={`x${index}`} component={x} editMode={true} />
                        ))}
                    </NotuText>
                ))}
            </YStack>
        );
    }

    getText(): string {
        return `<Checklist${this.showClearButton ? ' showClearButton' : ''}>\n${this._lines.map(x => '  ' + x.getText()).join('\n')}\n</Checklist>`;
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

        const showClearButton = data.attributes.hasOwnProperty('showClearButton') && (
            data.attributes['showClearButton'] == true ||
            data.attributes['showClearButton'].toUpperCase() == 'TRUE'
        )

        return new NoteChecklist(lines, showClearButton, save);
    }
}