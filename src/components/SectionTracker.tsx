"use client";

import React, { useEffect, useRef } from 'react';

interface SectionTrackingProps {
  children: React.ReactNode;
  userId: string;
  articleId: string;
}

export function SectionTracker({ children, userId, articleId }: SectionTrackingProps) {
  const observedSectionsRef = useRef<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!articleId || !userId) {
      console.log('SectionTracker: Missing articleId or userId', { articleId, userId });
      return;
    }
    
    console.log('SectionTracker: Initializing with', { articleId, userId });

    // Function to extract section info
    const extractSectionInfo = (element: HTMLElement): { title: string; level: string } | null => {
      const match = element.tagName.match(/^H([1-6])$/);
      if (!match) return null;

      return {
        title: element.textContent?.trim() || 'Sem título',
        level: element.tagName,
      };
    };

    // Function to send section view to API
    const trackSectionView = async (sectionTitle: string, sectionLevel: string) => {
      const sectionKey = `${sectionLevel}:${sectionTitle}`;

      // Prevent duplicates
      if (observedSectionsRef.current.has(sectionKey)) {
        console.log('SectionTracker: Already tracked', sectionKey);
        return;
      }

      observedSectionsRef.current.add(sectionKey);
      console.log('SectionTracker: Tracking section', { sectionTitle, sectionLevel });

      try {
        const response = await fetch('/api/section-tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articleId,
            userId,
            sectionTitle,
            sectionLevel,
          }),
        });
        console.log('SectionTracker: API response', response.status);
      } catch (err) {
        console.error('Failed to track section view:', err);
      }
    };

    // Intersection Observer for visibility
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionInfo = extractSectionInfo(entry.target as HTMLElement);
            if (sectionInfo) {
              console.log('SectionTracker: Section became visible', sectionInfo);
              trackSectionView(sectionInfo.title, sectionInfo.level);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    // Mutation Observer to detect dynamically added sections
    const mutationObserver = new MutationObserver((mutations) => {
      console.log('SectionTracker: Mutation detected, nodes count:', mutations.reduce((acc, m) => acc + m.addedNodes.length, 0));
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;

            // Check if the element itself is a heading
            const sectionInfo = extractSectionInfo(element);
            if (sectionInfo) {
              console.log('SectionTracker: Found heading in mutation', sectionInfo);
              intersectionObserver.observe(element);
            }

            // Check for headings within added elements
            const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
            if (headings.length > 0) {
              console.log('SectionTracker: Found nested headings in mutation', headings.length);
            }
            headings.forEach((heading) => {
              intersectionObserver.observe(heading);
            });
          }
        });
      });
    });

    // Use containerRef for tracking, with fallback to article element
    let trackingElement = containerRef.current;
    
    if (!trackingElement) {
      trackingElement = document.querySelector('article');
    }
    
    console.log('SectionTracker: Tracking element found?', !!trackingElement, trackingElement?.tagName);
    
    if (trackingElement) {
      // Observe all existing headings
      const existingHeadings = trackingElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
      console.log('SectionTracker: Found existing headings', existingHeadings.length);
      
      existingHeadings.forEach((heading) => {
        console.log('SectionTracker: Observing existing heading', heading.textContent?.substring(0, 50));
        intersectionObserver.observe(heading);
      });

      // Start observing mutations
      mutationObserver.observe(trackingElement, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [articleId, userId]);

  return <div ref={containerRef}>{children}</div>;
}
