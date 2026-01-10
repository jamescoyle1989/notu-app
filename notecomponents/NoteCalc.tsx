import { NotuSelect } from "@/components/NotuSelect";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteActionsMenuBuilder } from "@/helpers/NoteAction";
import { NotuInput, NotuText } from "@/helpers/NotuStyles";
import { timespanToText } from "@/helpers/RenderHelpers";
import { Parser } from 'expr-eval';
import { NmlElement, Note, Notu } from "notu";
import { useMemo, useState } from "react";
import { Dialog, View } from "tamagui";

export class NoteCalc {
    private _displayText: string;
    get displayText(): string { return this._displayText; }
    set displayText(value: string) { this._displayText = value; }

    private _calculationText: string;
    get calculationText(): string { return this._calculationText; }
    set calculationText(value: string) { this._calculationText = value; }

    private _expressionObject: any;
    get expressionObject(): any { return this._expressionObject; }

    constructor(calculationText: string, displayText: string, expressionObject: any) {
        this._calculationText = calculationText;
        this._displayText = displayText;
        this._expressionObject = expressionObject;
    }

    render() {
        return (
            <NotuText>{this._displayText}</NotuText>
        )
    }

    renderForEdit(color: () => string) {
        const [showTextEditor, setShowTextEditor] = useState(false);
        const manualRefresh = useManualRefresh();
        const [selectedColor, setSelectedColor] = useState(color());
        const suggestions = useMemo(() => getExpressionSuggestions(this.expressionObject), []);
        const myself = this;

        function handleCalculationChange(newValue: string) {
            myself.calculationText = newValue;
            manualRefresh();
        }

        function handleSuggestionSelected(value: string) {
            myself.calculationText += value;
            manualRefresh();
        }

        function getExpressionSuggestions(expObj: any): Array<string> {
            const output = [];
            for (const property in expObj) {
                const value = expObj[property];
                if (typeof value == 'number' || typeof value == 'boolean' || typeof value == 'string' || Array.isArray(value))
                    output.push(property);
                else
                    output.push(...getExpressionSuggestions(value).map(x => `${property}.${x}`));
            }
            return output;
        }

        return (
            <NotuText>
                <NotuText bg={selectedColor as any}>
                    <NotuText>{myself.calculationText} </NotuText>
                    <NotuText pressable onPress={() => setShowTextEditor(true)}>Edit</NotuText>
                </NotuText>

                <View>
                    <Dialog modal open={showTextEditor}>
                        <Dialog.Portal>
                            <Dialog.Overlay key="notecalceditoroverlay" onPress={() => setShowTextEditor(false)} />
                            <Dialog.FocusScope>
                                <Dialog.Content bordered elevate
                                                width="80%"
                                                key="notecalceditorcontent">
                                    <NotuText>Calculation</NotuText>
                                    <NotuInput value={myself.calculationText}
                                               onChangeText={handleCalculationChange} />
                                    <NotuText>Suggestions</NotuText>
                                    <NotuSelect options={suggestions.map(x => ({name: x, value: x}))}
                                                value={null}
                                                onValueChange={handleSuggestionSelected} />
                                </Dialog.Content>
                            </Dialog.FocusScope>
                        </Dialog.Portal>
                    </Dialog>
                </View>
            </NotuText>
        );
    }

    getText(): string {
        return `<Calc>${this.calculationText}</Calc>`
    }

    get typeInfo(): string { return 'NoteCalc'; }

    get displaysInline(): boolean { return true; }

    get displaysInlineForEdit(): boolean { return true; }

    getThisPlusAllChildComponents(): Array<any> {
        return [this];
    }

    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
    }
}


export class NoteCalcProcessor {

    private static _parser: Parser;

    get displayName(): string { return 'Calc'; }

    get tagName(): string { return 'Calc'; }

    constructor() {
        if (!NoteCalcProcessor._parser) {
            NoteCalcProcessor._parser = new Parser();
            NoteCalcProcessor._parser.functions.formatSeconds = (seconds: number) => timespanToText(seconds * 1000, true);
            NoteCalcProcessor._parser.functions.formatMinutes = (minutes: number) => timespanToText(minutes * 60 * 1000);
            NoteCalcProcessor._parser.functions.formatHours = (hours: number) => timespanToText(hours * 3600 * 1000);
        }
    }

    newComponentText(textContent: string): string {
        return `<Calc>${textContent}</Calc>`
    }

    create(
        data: NmlElement,
        note: Note,
        save: () => Promise<void>,
        childComponentFactory: (childElement: string | NmlElement) => any
    ): NoteCalc {
        const calcText = data.children.map(x => (typeof x === 'string') ? x : x.fullText).join('');
        let displayText = '';

        const exprObject: any = { date: note.date };
        for (const nt of note.tags) {
            if (!!nt.data)
                exprObject[nt.tag.name.replaceAll(' ', '')] = nt.data;
        }

        try {
            const expr = NoteCalcProcessor._parser.parse(calcText);
            const exprResult = expr.evaluate(exprObject);
            if (exprResult == null)
                displayText = data.fullText;
            else
                displayText = String(exprResult);
        }
        catch (err) {
            displayText = data.fullText;
        }

        return new NoteCalc(calcText, displayText, exprObject);
    }
}