import { PasswordForm } from "@/components/PasswordForm";
import { PasswordProtectionData } from "./PasswordProtectionNoteTagData";


export function showPasswordForm(
    passwordNoteId: number,
    passwordProtectionData: PasswordProtectionData,
    forNoteId: number | null,
    submitCallback: () => void
) {
    return (
        <PasswordForm passwordNoteId={passwordNoteId}
                      passwordProtectionData={passwordProtectionData}
                      forNoteId={forNoteId}
                      submitCallback={password => submitCallback()} />
    )
}