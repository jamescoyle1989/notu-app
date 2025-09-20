import { setupNotu } from '@/helpers/NotuSetup';
import { Note, Page, Space } from "notu";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import GroupedSearchList from '../components/GroupedSearchList';
import NoteEditor from '../components/NoteEditor';
import { NoteViewerAction } from "../components/NoteViewer";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import s from '../helpers/NotuStyles';


export default function Index() {
    
    const [renderTools, setRenderTools] = useState<NotuRenderTools>(null);

    useEffect(() => {
        async function load() {
            const renderToolsVal = await setupNotu();
            const notu = renderToolsVal.notu;
            
            let commonSpace = notu.getSpaceByName('Common');
            if (!commonSpace) {
                commonSpace = new Space('Common').v('1.0.0');
                commonSpace.internalName = 'decoyspace.notu.common';
                await notu.saveSpace(commonSpace);
            
                const thought = new Note('This marks a note as being some thought that I\'ve had on a particular subject.')
                    .in(commonSpace).setOwnTag('Thought');
                thought.ownTag.asInternal().asPublic();
            
                const info = new Note('This marks a note as being some info about a particular subject that may be useful later.')
                    .in(commonSpace).setOwnTag('Info');
                info.ownTag.asInternal().asPublic();
            
                await notu.saveNotes([thought, info]);
            
                const page1 = new Page();
                page1.name = 'Page 1';
                page1.order = 1;
                page1.group = 'Pages';
                page1.space = commonSpace;
                page1.query = `t.isInternal`;
                await notu.savePage(page1);
            
                const page2 = new Page();
                page2.name = 'Page 2';
                page2.order = 2;
                page2.group = 'Pages';
                page2.space = commonSpace;
                page2.query = `#Info`;
                await notu.savePage(page2);
            
                const page3 = new Page();
                page3.name = 'Page 3';
                page3.order = 3;
                page3.group = null;
                page3.space = commonSpace;
                page3.query = `#Thought`;
                await notu.savePage(page3);
            }
            
            setRenderTools(renderToolsVal);
        }
        load();
    }, []);

    if (renderTools == null) {
        return (
            <View style={s.container.background}>
                <Text>Loading Index...</Text>
            </View>
        );
    }
    const notu = renderTools.notu;

    function renderGroupedSearchList() {
        return (
            <GroupedSearchList query={`t.isInternal`}
                               searchSpace={notu.getSpaceByName('Common')}
                               notuRenderTools={renderTools}
                               actionsGenerator={n => [
                                    new NoteViewerAction('Test Action 1', () => {}, false),
                                    new NoteViewerAction('Test Action 2', () => {}, true)
                               ]}
                               actionsBar={() => (
                                    <Text style={s.text.plain}>Hello from actions bar</Text>
                               )}/>
        );
    }

    function renderNoteEditor() {
        const note = new Note('Test note').in(notu.getSpaceByName('Common'));

        return (
            <NoteEditor notuRenderTools={renderTools}
                        note={note}
                        tags={notu.getTags()}
                        canSave={n => Promise.resolve(false)}
                        onSave={n => {}}
                        onCancel={n => {}}/>
        )
    }

    return (
        <View style={s.container.background}>
            {renderNoteEditor()}
        </View>
    )
}