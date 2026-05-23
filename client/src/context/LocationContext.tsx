import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserLocation {
  lat: number;
  lon: number;
  cityName: string;
  country?: string;
}

interface LocationContextValue {
  location: UserLocation | null;
  setLocation: (loc: UserLocation) => void;
  clearLocation: () => void;
  isSet: boolean;
}

const STORAGE_KEY = "jalsetu_user_location";

const LocationContext = createContext<LocationContextValue>({
  location: null,
  setLocation: () => {},
  clearLocation: () => {},
  isSet: false,
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<UserLocation | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setLocation = (loc: UserLocation) => {
    setLocationState(loc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  };

  const clearLocation = () => {
    setLocationState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, clearLocation, isSet: !!location }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useUserLocation() {
  return useContext(LocationContext);
}
