import { useEffect, useRef, useState } from "react";

export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
    const [isIntersecting,setIsIntersecting] = useState(false);
    const targetRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        },options);
        if(targetRef.current){
            observer.observe(targetRef.current); //tell the observer which element to observe
        }
        return () => observer.disconnect(); //cleanup
    },[options])
    return {targetRef, isIntersecting};
}