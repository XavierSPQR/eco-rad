import { useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useLiveTracking(user: any, profile: any) {
  useEffect(() => {
    if (!user || profile?.role !== "collector") return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const vehicleRef = doc(db, "activeVehicles", user.uid);
        
        // We use setDoc with merge: true to create or update the document
        setDoc(
          vehicleRef,
          {
            id: profile?.truckId || "LK-4521", // Fallback to LK-4521 if not in profile
            driver: profile?.fullName || "Collector",
            area: profile?.district || "Colombo",
            status: "Live",
            eta: "N/A", // This could be calculated later dynamically
            lat: latitude,
            lng: longitude,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      },
      (error) => {
        console.error("Error watching location:", error);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000 
      }
    );

    const handleUnload = () => {
      const vehicleRef = doc(db, "activeVehicles", user.uid);
      setDoc(vehicleRef, { status: "Offline", updatedAt: serverTimestamp() }, { merge: true });
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.removeEventListener("beforeunload", handleUnload);
      
      // Also mark offline when the component unmounts (e.g., logging out)
      handleUnload();
    };
  }, [user, profile]);
}
