import { EyeIcon } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
    compactViews?: string;
    expandedViews?: string;
}

export const VideoViews = ({  expandedViews }: Props) => {
    return (
        <motion.div
            className="flex items-center gap-2 p-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
        >

            <EyeIcon className="size-4" />
            {expandedViews}
            <p className="text-xs text-muted-foreground">views</p>
        </motion.div>
    );
};
