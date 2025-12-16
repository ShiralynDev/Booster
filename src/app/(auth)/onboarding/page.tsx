import { AccountTypeSelection } from "@/modules/auth/ui/components/account-type-selection"

export default function OnboardingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <AccountTypeSelection />
        </div>
    )
}
