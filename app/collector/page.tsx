"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  collection,
  query,
  where,
  getCountFromServer,
  onSnapshot,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";
import { useLiveTracking } from "@/lib/useLiveTracking";
import { RoleGuard } from "@/components/RoleGuard";

export default function CollectorDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    verifications: 0
  });
  const [allPendingCount, setAllPendingCount] = useState(0);
  const [completedTodayCount, setCompletedTodayCount] = useState(0);
  const [vehicleData, setVehicleData] = useState<any>(null);

  // Start live tracking
  useLiveTracking(user, profile);

  useEffect(() => {
    if (!user) return;

    // Fetch Truck ID and Area from activeVehicles
    const fetchTruck = async () => {
      try {
        const vehicleDoc = await getDoc(doc(db, "activeVehicles", user.uid));
        if (vehicleDoc.exists()) {
          setVehicleData(vehicleDoc.data());
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
      }
    };
    fetchTruck();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Fetch stats
    const fetchStats = async () => {
      try {
        // Total Completed by this collector (ever) - Pickups
        const qCompletedAll = query(
          collection(db, "pickupRequests"),
          where("status", "==", "completed"),
          where("collectorId", "==", user.uid)
        );
        const completedSnap = await getCountFromServer(qCompletedAll);

        // Total Completed by this collector (ever) - Schedules
        const qSchedulesCompletedAll = query(
          collection(db, "schedules"),
          where("status", "==", "completed"),
          where("collectorId", "==", user.uid)
        );
        const schedulesCompletedSnap = await getCountFromServer(qSchedulesCompletedAll);

        setStats(prev => ({
          ...prev,
          completed: completedSnap.data().count + schedulesCompletedSnap.data().count
        }));

        // Verifications (global)
        const qCollections = collection(db, "wasteCollections");
        const collectionsSnap = await getCountFromServer(qCollections);
        setStats(prev => ({ ...prev, verifications: collectionsSnap.data().count }));
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();

    // Real-time listeners for today's progress

    // 1. Completed Today (Pickups)
    const qCompletedToday = query(
      collection(db, "pickupRequests"),
      where("status", "==", "completed"),
      where("collectorId", "==", user.uid),
      where("updatedAt", ">=", startOfToday)
    );
    const unsubscribeCompletedToday = onSnapshot(qCompletedToday, (snapshot) => {
        const count = snapshot.size;
        setCompletedTodayCount(prev => {
            // This is a bit tricky since we want to combine both.
            // We'll use a better approach by having separate states.
            return count; // Temporary, will refine
        });
    });
    // Actually, let's use separate states for clarity

    return () => {
        unsubscribeCompletedToday();
    };
  }, [user]);

  // Refined real-time listeners for progress
  const [completedPickupsToday, setCompletedPickupsToday] = useState(0);
  const [completedSchedulesToday, setCompletedSchedulesToday] = useState(0);
  const [pendingPickupsTotal, setPendingPickupsTotal] = useState(0);
  const [pendingSchedulesTotal, setPendingSchedulesTotal] = useState(0);

  useEffect(() => {
    if (!user) return;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const unsub1 = onSnapshot(query(
      collection(db, "pickupRequests"),
      where("status", "==", "completed"),
      where("collectorId", "==", user.uid),
      where("updatedAt", ">=", startOfToday)
    ), s => setCompletedPickupsToday(s.size));

    const unsub2 = onSnapshot(query(
      collection(db, "schedules"),
      where("status", "==", "completed"),
      where("collectorId", "==", user.uid),
      where("updatedAt", ">=", startOfToday)
    ), s => setCompletedSchedulesToday(s.size));

    const unsub3 = onSnapshot(query(
      collection(db, "pickupRequests"),
      where("status", "==", "pending")
    ), s => setPendingPickupsTotal(s.size));

    const unsub4 = onSnapshot(query(
      collection(db, "schedules"),
      where("collectorId", "==", user.uid),
      where("status", "in", ["pending", "started"])
    ), s => setPendingSchedulesTotal(s.size));

    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [user]);

  const progress = useMemo(() => {
    const completed = completedPickupsToday + completedSchedulesToday;
    const pending = pendingPickupsTotal + pendingSchedulesTotal;
    const total = completed + pending;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [completedPickupsToday, completedSchedulesToday, pendingPickupsTotal, pendingSchedulesTotal]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(query(
        collection(db, "pickupRequests"),
        where("status", "==", "pending"),
        where("collectorId", "==", user.uid)
      ), s => setStats(prev => ({ ...prev, pending: s.size })));
    return unsub;
  }, [user]);

  return (
    <RoleGuard allowedRole="collector">
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>EcoCycle</div>
        <nav className={styles.nav}>
          <nav className="flex flex-col gap-2">
          <Link href="/collector" className="flex items-center gap-3 px-4 py-2 text-sm font-medium bg-[#55B56F] text-white rounded-[12px] shadow-lg shadow-[#55B56F]/20">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </Link>
          <Link href="/collector/tasks" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            Tasks
          </Link>
          <Link href="/collector/notification" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            Notifications
          </Link>
          <Link href="/collector/profile" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Profile
          </Link>
        </nav>
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <p className={styles.role}>COLLECTOR</p>
            <h1 className={styles.greeting}>Hello, {profile?.fullName || "Collector"}!</h1>
            <p className={styles.sub}>Working with Truck {vehicleData?.id || "N/A"} · Zone {vehicleData?.area || profile?.district || "N/A"}</p>
          </div>
          <div className={styles.kpiRing} style={{
            background: `conic-gradient(#2e7d32 0 ${progress}%, #e6f6ea ${progress}% 100%)`
          }}>
            <div className={styles.kpiInner}>
              {progress}%
              <div className={styles.kpiLabel}>Tasks Today</div>
            </div>
          </div>
        </header>

        <section className={styles.stats}>
          <div className={styles.statCard}><div className={styles.statNum}>{stats.completed}</div><div>Completed pickups</div></div>
          <div className={styles.statCard}><div className={styles.statNum}>{stats.pending}</div><div>Pending pickups</div></div>
          <div className={styles.statCard}><div className={styles.statNum}>{stats.verifications * 3}</div><div>Bags scanned</div></div>
          <div className={styles.statCard}><div className={styles.statNum}>{stats.verifications}</div><div>Verifications</div></div>
        </section>

        <section className={styles.panels}>
          <div className={styles.pendingPanel}>
            <h3>Recent verifications</h3>
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 italic">
              Use the Tasks page to perform new verifications.
              <Link href="/collector/tasks" className="mt-4 not-italic font-bold text-[#2E7D32] hover:underline">Go to Tasks →</Link>
            </div>
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.scanBox}>
              <div className={styles.scanLabel}>Scan waste bag</div>
            </div>

            <div className={styles.checklist}>
              <h4>Safety checklist</h4>
              <ul>
                <li>Gloves & vest</li>
                <li>Sanitizer station</li>
                <li>First-aid kit</li>
                <li>Truck inspection log</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
    </RoleGuard>
  );
}
