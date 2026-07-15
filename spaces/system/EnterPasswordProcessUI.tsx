import { PasswordEnforcement, PasswordForm } from "@/components/PasswordForm";


export function showPasswordForm(
    data: Array<PasswordEnforcement>,
    submitCallback: () => void
) {
    return (
        <PasswordForm data={data}
                      submitCallback={() => submitCallback()} />
    )
}