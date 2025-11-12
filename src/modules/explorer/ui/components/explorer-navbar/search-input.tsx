// 'use client';

import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation";
import { useState } from "react"

export const SearchInput = () => {
    // TODO: Search functionality

    const [value, setValue] = useState("");
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

    return (
        <form className='relative flex w-full max-w-[600px]' onSubmit={handleSearch}>
            <div className="relative w-full">
                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    type='text'
                    placeholder="Search"
                    className="w-full pl-4 pr-20 py-1.5 border rounded-full focus:outline-none focus:border-blue-500"
                />
                {/* Clear search button */}
                {value && (
                    <Button
                        type="button"
                        variant='ghost'
                        size='icon'
                        onClick={() => setValue("")}
                        className="absolute right-16 top-1/2 -translate-y-1/2 rounded-full size-6"
                    >
                        <XIcon className="text-gray-500 size-4" />
                    </Button>
                )}
            </div>
            {/* Search button overlapping on the right */}
            <button
                disabled={!value.trim()}
                type="submit"
                className="absolute top-[48.5%] right-0 -translate-y-1/2 h-10 px-7 rounded-full bg-gradient-to-r from-[#FFCA55] to-[#FFA100] text-black disabled:cursor-not-allowed flex items-center justify-center "
            >
                <SearchIcon className='size-6' />
            </button>
        </form>
    )
}


