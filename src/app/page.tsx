"use client";

import Editor from '@/components/Editor';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { loadPresentation } from '@/lib/slidesSlice';
import { resetUI } from '@/lib/uiSlice';

function HomePageContent() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadId = searchParams.get('load');
    if (loadId) {
      const fetchSharedPresentation = async () => {
        try {
          const response = await fetch(`/api/presentations?id=${loadId}`);
          if (response.ok) {
            const { presentation } = await response.json();
            if (Array.isArray(presentation) && presentation.length > 0) {
              dispatch(resetUI());
              dispatch(loadPresentation(presentation));
              alert('Shared presentation loaded successfully!');
            } else {
              alert('Invalid shared presentation data.');
            }
          } else {
            const errorData = await response.json();
            alert(`Failed to load shared presentation: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
          console.error('Error loading shared presentation from URL:', error);
          alert('An unexpected error occurred while loading the shared presentation.');
        }
      };
      fetchSharedPresentation();
    }
  }, [searchParams, dispatch]);

  return <Editor />;
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
