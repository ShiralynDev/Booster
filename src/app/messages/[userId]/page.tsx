import { MessageView } from "@/modules/messages/ui/views/message-view";

interface MessagePageProps {
    params: Promise<{ userId: string }>;
}

export default async function MessagePage({ params }: MessagePageProps) {
    const { userId } = await params;
    
    return <MessageView userId={userId} />;
}
