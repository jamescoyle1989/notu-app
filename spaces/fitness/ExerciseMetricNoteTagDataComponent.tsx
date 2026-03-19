import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode } from "react";
import { ExerciseMetricData } from "./ExerciseMetricNoteTagData";
import { FitnessSpaceSetup } from "./FitnessSpaceSetup";

export default class ExerciseMetricNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        const data = new ExerciseMetricData(noteTag);
        return (<NotuText small color={textColor}>{data.value}</NotuText>)
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return null;
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new ExerciseMetricData(noteTag);
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        if (!tag.links.find(x => 
            x.space.internalName == FitnessSpaceSetup.internalName &&
            x.name == FitnessSpaceSetup.metric
        ))
            return false;

        return !note.tags.find(x => 
            x.tag.space.internalName == FitnessSpaceSetup.internalName && (
                x.tag.name == FitnessSpaceSetup.exercise ||
                x.tag.name == FitnessSpaceSetup.workout
            )
        );
    }
}