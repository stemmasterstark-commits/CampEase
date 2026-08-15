import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useGpsTracker(rideId: string | null) {
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!rideId) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }

    // Start continuous tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`[GPS Tracking] Ride ${rideId}:`, latitude, longitude);

        // Update ride's current location in Supabase
        await supabase
          .from('rides')
          .update({
            current_lat: latitude,
            current_lng: longitude,
            last_location_time: new Date().toISOString(),
          })
          .eq('id', rideId);
      },
      (error) => {
        console.error('GPS error:', error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [rideId]);
}