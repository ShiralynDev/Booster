'use client';

import { CommunitiesSection } from "../sections/communities-section";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props{
    categoryId?: string;
}

export const CommunitiesView = ({ categoryId }: Props) => {
  return (
    <Suspense fallback={<CommunitiesViewSkeleton />}>
      <ErrorBoundary fallback={<p>Failed to load categories.</p>}>
        <CommunitiesViewSuspense  categoryId={categoryId}/>
      </ErrorBoundary>
    </Suspense>
  );
};

const CommunitiesViewSkeleton = () => {
  return <div>Loading...</div>;
};



const CommunitiesViewSuspense = ({categoryId}: Props) => {
    
    return (
        <CommunitiesSection categoryId={categoryId} />
  );
};
