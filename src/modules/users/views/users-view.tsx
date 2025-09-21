'use client'

import { UserAvatar } from "@/components/user-avatar";
import { trpc } from "@/trpc/client";

interface Props{
    userId: string;
}

export const UsersView = ({userId}:Props) => {

    const [user] = trpc.users.getByUserId.useSuspenseQuery({userId});
    
    return (
        <div>
           
            {user?.name}
            <UserAvatar 
            size="lg"
            imageUrl={user?.imageUrl || undefined}
            name={user?.name || 'Unknown user'}
            />
        </div>
    )
}