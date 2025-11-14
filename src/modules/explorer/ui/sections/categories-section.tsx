'use client';

import { FilterCarousel } from "@/components/filter-carousel";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CategoriesSectionProps{
    categoryId?: string;
    setSelectedCategory: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const CategoriesSection = ({categoryId,setSelectedCategory}: CategoriesSectionProps) => {

    return (
        <Suspense fallback={<FilterCarousel isLoading data={[]} onSelect={() => {}}/>}>
            <ErrorBoundary fallback={<p>Failed to load categories.</p>}>
                <CategoriesSectionSuspense categoryId={categoryId} setSelectedCategory={setSelectedCategory} />
            </ErrorBoundary>
        </Suspense>
    )
}

 const CategoriesSectionSuspense = ({categoryId,setSelectedCategory}: CategoriesSectionProps) => {
    const router = useRouter();
    const [categories] = trpc.categories.getMany.useSuspenseQuery();
    const data = categories.map(({name,id}) =>({
        value:id,
        label: name
    }))
    const onSelect = (value: string | null, label:string | null) =>{
        const url = new URL(window.location.href);
        if(value){
            url.searchParams.set('categoryId', value);
            if(label) setSelectedCategory(label)
        }else{
            url.searchParams.delete('categoryId');
            setSelectedCategory("All")
        }
        router.push(url.toString());
        // router.push does not prefetch so it is a bit slower than Link component
    }
    return (
        <FilterCarousel onSelect={onSelect} value={categoryId} data={data}>

        </FilterCarousel>
        // <div>
        //     {JSON.stringify(categories)}
        // </div>
    )
}