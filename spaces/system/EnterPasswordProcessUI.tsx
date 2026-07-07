import { PasswordForm } from "@/components/PasswordForm";
import { HideOverlayAction, RefreshAction, UIAction } from "@/helpers/NoteAction";
import { PasswordProtectionData } from "./PasswordProtectionNoteTagData";


export function showPasswordForm(
    passwordNoteId: number,
    passwordProtectionData: PasswordProtectionData,
    forNoteId: number | null,
    onUIAction: (action: UIAction) => void
) {
    return (
        <PasswordForm passwordNoteId={passwordNoteId}
                      passwordProtectionData={passwordProtectionData}
                      forNoteId={forNoteId}
                      submitCallback={password => new HideOverlayAction(new RefreshAction())} />
    )
}