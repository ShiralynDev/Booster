import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils";

interface Props{
    onClick: ButtonProps["onClick"];
    disabled: boolean;
    isSubscribed?: boolean;
    className?: string;
    size?: ButtonProps["size"]
}
export const SubButton = ({
    onClick,
    isSubscribed,
    className,
    size
}:Props) => {
    return (
        <Button
            size={size}
            variant={isSubscribed ? "default" : "default"}
            className={cn(
                `rounded-full`,
                isSubscribed 
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700" 
                    : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600",
                className
            )}
            onClick={onClick}
        >

            {isSubscribed ? "Leave": "Follow"}
        </Button>
    )
}