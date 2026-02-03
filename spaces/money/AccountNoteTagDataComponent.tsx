import { NotuSelect } from "@/components/NotuSelect";
import { NumberInput } from "@/components/NumberInput";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Input, Label, XStack, YStack } from "tamagui";
import { AccountData } from "./AccountNoteTagData";

export default class AccountNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        const data = new AccountData(noteTag);
        return (<NotuText color={textColor} small>{data.importType}</NotuText>)
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} refreshCallback={refreshCallback} />)
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        if (!note.ownTag)
            throw new Error('The Account tag requires that the note has its own tag set.');

        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new AccountData(noteTag);
    }
}


function EditorComponent({ noteTag, refreshCallback }: NoteTagDataComponentProps) {
    const data = new AccountData(noteTag);
    const manualRefresh = useManualRefresh();

    function onImportTypeChange(value: 'CSV' | 'Manual') {
        data.importType = value;
        refreshCallback();
    }

    function onFileImportMappingChange(value: string) {
        data.fileImportMapping = value;
        manualRefresh();
    }

    function onSettlementDaysChange(value: number) {
        data.settlementDays = value;
        manualRefresh();
    }

    return (
        <YStack>
            <XStack style={{alignItems: 'center'}}>
                <Label width={120}>Import Type</Label>
                <NotuSelect value={data.importType}
                            options={['CSV', 'Manual'].map(x => ({name: x, value: x}))}
                            onValueChange={onImportTypeChange} />
            </XStack>

            {data.importType == 'CSV' && (
                <YStack>
                    <YStack>
                        <Label>File Import Mapping</Label>
                        <Input value={data.fileImportMapping}
                            onChangeText={onFileImportMappingChange} />
                    </YStack>

                    <XStack style={{alignItems: 'center'}}>
                        <Label width={120}>Settlement Days</Label>
                        <NumberInput numberValue={data.settlementDays}
                                    onNumberChange={onSettlementDaysChange} />
                    </XStack>
                </YStack>
            )}
        </YStack>
    );
}