"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export const OnboardingCheck = ({ accountType, userId }: { accountType: string | null | undefined, userId: string | null }) => {
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        if (userId && !accountType && pathname !== "/onboarding" && pathname !== "/welcome" && !pathname.startsWith("/api") && !pathname.startsWith("/trpc")) {
            router.push("/onboarding")
        }
    }, [accountType, pathname, router, userId])

    return null
}
