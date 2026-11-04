import { useCallback, useEffect, useState } from 'react';

import type { LocationState } from '@/components/reports/location-status';
import {
  readLocation,
  type Coordinates,
  type LocationResult,
} from '@/lib/location';

/**
 * GPS state for report forms. With `autoCapture` the location is requested on
 * mount (create); otherwise it starts from `initial` (edit).
 */
export function useReportLocation({
  initial = null,
  autoCapture,
}: {
  initial?: Coordinates | null;
  autoCapture: boolean;
}) {
  const [location, setLocation] = useState<Coordinates | null>(initial);
  const [state, setState] = useState<LocationState>(
    autoCapture ? 'loading' : initial ? 'ready' : 'error',
  );
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((result: LocationResult) => {
    if (result.ok) {
      setLocation(result.coords);
      setState('ready');
      setError(null);
    } else {
      setLocation(null);
      setState('error');
      setError(result.message);
    }
  }, []);

  const capture = useCallback(async () => {
    setState('loading');
    setError(null);
    apply(await readLocation());
  }, [apply]);

  useEffect(() => {
    if (!autoCapture) return;
    let active = true;
    void readLocation().then((result) => {
      if (active) apply(result);
    });
    return () => {
      active = false;
    };
  }, [apply, autoCapture]);

  return { location, state, error, capture };
}
