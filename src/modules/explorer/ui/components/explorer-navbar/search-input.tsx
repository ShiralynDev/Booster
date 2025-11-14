'use client';

import { Button } from "@/components/ui/button";
import { SearchIcon, Stars, XIcon } from "lucide-react"
import { useRouter } from "next/navigation";
import { useState } from "react"

export const SearchInput = () => {
    const [value, setValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isStarMode, setIsStarMode] = useState(false);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newQuery = value.trim();

        if (newQuery === "") {
            router.push("/search")
        } else {
            router.push(`/search?query=${encodeURIComponent(newQuery)}`)
        }

        setValue(newQuery)
    }

    const handleStarClick = () => {
        setIsStarMode(!isStarMode);
    }

    return (
        <form className='relative flex w-full max-w-[500px] items-center gap-3 justify-between' onSubmit={handleSearch}>
            <div className="relative w-full">
                

                {/* Input Field */}
                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    type='text'
                    placeholder={`${!isStarMode ? "Search for anything..." : "Ask AI..."}`}
                    className={`w-full pl-12 pr-16 py-2 rounded-full border-2 bg-background/95 backdrop-blur-sm transition-all duration-300 focus:outline-none text-foreground placeholder:text-muted-foreground
                        ${value ? 'pr-12' : 'pr-4'}
                        ${isStarMode ? 'border-primary shadow-lg shadow-orange-500/30' : 'border-border'}
                    `}
                />

                {/* Search/Star Icon */}
                <button
                    disabled={!value.trim()}
                    type="submit"
                    className={`absolute left-0 top-0 bottom-0 px-4 rounded-r-full flex items-center justify-center focus:outline-none hover:text-primary transition-colors duration-200 disabled:cursor-not-allowed
                        ${isStarMode ? 'text-primary' : 'text-muted-foreground/70'}
                    `}
                >
                    {isStarMode ? (
                        <Stars className='size-5 text-primary' />
                    ) : (
                        <SearchIcon className='size-5' />
                    )}
                </button>

                {/* Clear search button */}
                {value && (
                    <Button
                        type="button"
                        variant='ghost'
                        size='icon'
                        onClick={() => setValue("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full size-7 hover:bg-muted transition-colors"
                    >
                        <XIcon className="text-muted-foreground size-4 hover:text-foreground transition-colors" />
                    </Button>
                )}
            </div>

            {/* Enhanced Stars Button with Primary-Secondary Gradient Glow */}
            <div
                onClick={handleStarClick}
                className={`relative p-1.5 group rounded-full transition-all duration-300 hover:scale-105 active:scale-95 bg-background hover:cursor-pointer
                    ${isStarMode ? 'ring-2 ring-primary' : ''}
                `}
            >
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 blur-md group-hover:blur-lg -z-10
                    ${isStarMode ? 'bg-gradient-to-r from-primary to-secondary opacity-90' : 'bg-gradient-to-r from-primary to-secondary opacity-70 group-hover:opacity-90'}
                `} />
                
                {/* Gradient Border */}
                <div className={`absolute inset-0 rounded-2xl p-0.5 -z-5 transition-all duration-300
                    ${isStarMode ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gradient-to-r from-primary to-secondary'}
                `}>
                    <div className="w-full h-full rounded-[15px] bg-background" />
                </div>
                
                {/* Icon with Gradient Fill */}
                <div className={`z-50 p-1 relative bg-clip-text text-transparent group-hover:brightness-110 transition-all duration-300
                    ${isStarMode ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gradient-to-r from-primary to-secondary'}
                `}>
                    <Stars className={`size-4 ${isStarMode ? 'text-primary' : 'text-white'}`} />
                </div>
                
                {/* Subtle shine effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
        </form>
    )
}