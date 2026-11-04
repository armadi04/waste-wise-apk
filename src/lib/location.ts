import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type LocationResult =
  { ok: true; coords: Coordinates } | { ok: false; message: string };

const LOCATION_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(
      () =>
        reject(new Error('Could not get your location in time. Try again.')),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

/** One-shot GPS read with services/permission checks; never throws. */
export async function readLocation(): Promise<LocationResult> {
  try {
    const services = await Location.hasServicesEnabledAsync();
    if (!services) {
      throw new Error(
        'Location services are turned off. Enable GPS in your device settings.',
      );
    }

    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      throw new Error(
        'Location permission is required to create a report. Allow it in settings and try again.',
      );
    }

    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      LOCATION_TIMEOUT_MS,
    );
    return {
      ok: true,
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Could not get your location. Try again.',
    };
  }
}
