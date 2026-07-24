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

  const [collectors, setCollectors] = useState<any[]>([]);
  const [allPickupRequests, setAllPickupRequests] = useState<any[]>([]);
  const [allSchedules, setAllSchedules] = useState<any[]>([]);

  const leaderboards = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const pendingPickupsCount = allPickupRequests.filter(r => r.status === "pending").length;

    const stats = collectors.map(c => {
      const collectorCompletedPickups = allPickupRequests.filter(r => r.status === "completed" && r.collectorId === c.uid);
      const collectorSchedules = allSchedules.filter(s => s.collectorId === c.uid);

      const completedPickupsAllTime = collectorCompletedPickups.length;
      const completedSchedulesAllTime = collectorSchedules.filter(s => s.status === "completed").length;

      const getTimestampDate = (ts: any) => {
        if (!ts) return null;
        if (typeof ts.toDate === 'function') return ts.toDate();
        if (ts.seconds) return new Date(ts.seconds * 1000);
        if (ts instanceof Date) return ts;
        if (typeof ts === 'string') return new Date(ts);
        return null;
      };

      const completedPickupsToday = collectorCompletedPickups.filter(r => {
        const date = getTimestampDate(r.updatedAt);
        return date && date.getTime() >= startOfToday.getTime();
      }).length;
      const completedSchedulesToday = collectorSchedules.filter(s => {
        const date = getTimestampDate(s.updatedAt);
        return s.status === "completed" && date && date.getTime() >= startOfToday.getTime();
      }).length;

      const pendingSchedules = collectorSchedules.filter(s => ["pending", "started"].includes(s.status)).length;

      const allTimeDone = completedPickupsAllTime + completedSchedulesAllTime;
      const todayDone = completedPickupsToday + completedSchedulesToday;
      const pending = pendingPickupsCount + pendingSchedules;

      const totalAllTime = allTimeDone + pending;
      const totalToday = todayDone + pending;

      return {
        uid: c.uid,
        name: c.fullName || "Unknown",
        percentageAllTime: totalAllTime > 0 ? Math.round((allTimeDone / totalAllTime) * 100) : 0,
        percentageToday: totalToday > 0 ? Math.round((todayDone / totalToday) * 100) : 0
      };
    });

    return {
      allTime: [...stats].sort((a, b) => b.percentageAllTime - a.percentageAllTime).slice(0, 5),
      today: [...stats].sort((a, b) => b.percentageToday - a.percentageToday).slice(0, 5)
    };
  }, [collectors, allPickupRequests, allSchedules]);

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

  useEffect(() => {
    const unsubCollectors = onSnapshot(
      query(collection(db, "users"), where("role", "==", "collector")),
      (s) => setCollectors(s.docs.map(d => ({ uid: d.id, ...d.data() })))
    );

    const unsubPickupRequests = onSnapshot(
      query(collection(db, "pickupRequests"), where("status", "in", ["pending", "completed"])),
      (s) => setAllPickupRequests(s.docs.map(d => d.data()))
    );

    const unsubAllSchedules = onSnapshot(
      collection(db, "schedules"),
      (s) => setAllSchedules(s.docs.map(d => d.data()))
    );

    return () => {
      unsubCollectors();
      unsubPickupRequests();
      unsubAllSchedules();
    };
  }, []);

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
    <div className="collector-main">
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
          <div className={styles.statCard}><div className={styles.statNum}>{stats.completed}</div><div className={styles.statLabel}>Completed pickups</div></div>
          <div className={styles.statCard}><div className={styles.statNum}>{stats.pending}</div><div className={styles.statLabel}>Pending pickups</div></div>
          <div className={styles.statCard}><div className={styles.statNum}>{stats.verifications}</div><div className={styles.statLabel}>Verifications</div></div>
        </section>

        <section className={styles.panels}>
          <div className={styles.pendingPanel}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Collector Leaderboard</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Top Performers</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* All Time Leaderboard */}
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
                  All Time
                </h4>
                <div className="space-y-3">
                  {leaderboards.allTime.map((c, i) => (
                    <div key={c.uid} className={`flex items-center justify-between p-3 rounded-2xl ${c.uid === user?.uid ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-orange-300 text-white' : 'text-gray-400'}`}>
                          {i + 1}
                        </span>
                        <span className="font-bold text-gray-700 text-sm">{c.name} {c.uid === user?.uid && "(You)"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${c.percentageAllTime}%` }} />
                        </div>
                        <span className="text-xs font-black text-gray-800">{c.percentageAllTime}%</span>
                      </div>
                    </div>
                  ))}
                  {leaderboards.allTime.length === 0 && (
                    <p className="text-center py-10 text-gray-400 italic text-sm">No data available</p>
                  )}
                </div>
              </div>

              {/* Today Leaderboard */}
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Today
                </h4>
                <div className="space-y-3">
                  {leaderboards.today.map((c, i) => (
                    <div key={c.uid} className={`flex items-center justify-between p-3 rounded-2xl ${c.uid === user?.uid ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-orange-300 text-white' : 'text-gray-400'}`}>
                          {i + 1}
                        </span>
                        <span className="font-bold text-gray-700 text-sm">{c.name} {c.uid === user?.uid && "(You)"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.percentageToday}%` }} />
                        </div>
                        <span className="text-xs font-black text-gray-800">{c.percentageToday}%</span>
                      </div>
                    </div>
                  ))}
                  {leaderboards.today.length === 0 && (
                    <p className="text-center py-10 text-gray-400 italic text-sm">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rightPanel}>
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
    </div>
  );
}
