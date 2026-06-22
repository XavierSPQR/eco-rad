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
        
        // We use setDoc with merge: true to create or update the document.
        // Managed exclusively by admin: id, driver, area.
        setDoc(
          vehicleRef,
          {
            status: "Live",
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
