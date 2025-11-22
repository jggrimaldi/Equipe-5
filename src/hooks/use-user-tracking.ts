import { useEffect, useState, useRef } from 'react';

interface LocationData {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  country_name?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  error?: boolean;
  reason?: string;
  [key: string]: any;
}

interface UseUserTrackingProps {
  articleId?: string;
}

// Default location for Recife, PE, Brazil
const DEFAULT_LOCATION: LocationData = {
  ip: 'unknown',
  city: 'Recife',
  region: 'Pernambuco',
  country: 'BR',
  country_name: 'Brazil',
  timezone: 'America/Recife',
  latitude: -8.0476,
  longitude: -34.877,
};

export const useUserTracking = ({ articleId }: UseUserTrackingProps = {}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    const trackUser = async () => {
      try {
        // Step 1: Get or create anonymous user
        const userResponse = await fetch('/api/anonymous-user', {
          method: 'POST',
        });

        const userData = await userResponse.json();

        if (!userData.success) {
          console.error('Failed to get/create user');
          return;
        }

        const currentUserId = userData.nanoid;
        setUserId(currentUserId);

        // Step 2: If we have an article ID, log the visit
        if (articleId) {
          // Get geolocation
          let locationData: LocationData = DEFAULT_LOCATION;

          try {
            const geoResponse = await fetch('/api/geolocation');
            const geoData: LocationData = await geoResponse.json();

            // Only use geolocation if no error
            if (!geoData.error) {
              locationData = geoData;
            }
          } catch (error) {
            console.warn('Could not fetch geolocation, using default:', error);
            // locationData is already set to DEFAULT_LOCATION
          }

          // Log the visit
          const logResponse = await fetch('/api/user-logs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: currentUserId,
              articleId,
              location: locationData,
              ipAddress: locationData.ip,
            }),
          });

          const logData = await logResponse.json();

          if (!logData.success) {
            console.error('Failed to log visit');
            return;
          }

          console.log('User visit logged successfully');

          // Increment view count
          try {
            await fetch('/api/article-views', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ articleId }),
            });
            console.log('View count incremented');
          } catch (viewError) {
            console.error('Failed to increment view count:', viewError);
          }
        }

        setIsTracking(true);
      } catch (error) {
        console.error('Error in user tracking:', error);
      }
    };

    trackUser();
  }, [articleId]);

  return { userId, isTracking };
};
