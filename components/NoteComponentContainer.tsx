//This is a wrapper around each note component
// Otherwise changing the components in a note can cause react to crash because it gets confused by a different number of hooks since the previous render
interface NoteComponentContainerProps {
    component: any,
    editMode?: boolean
}


export const NoteComponentContainer = ({
    component,
    editMode = false
}: NoteComponentContainerProps) => {
    if (editMode)
        return component.renderForEdit();
    else
        return component.render();
}