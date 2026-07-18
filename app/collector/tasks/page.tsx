"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, Timestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLiveTracking } from "@/lib/useLiveTracking";
import { RoleGuard } from "@/components/RoleGuard";

type ScheduleTask = {
  id: string;
  collectorId: string;
  collectorName: string;
  driverId: string;
  driverName: string;
  vehicleNo: string;
  region: string;
  routeId: string;
  date: string;
  description: string;
  status: "pending" | "started" | "completed";
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

type RouteData = {
  id: string;
  region: string;
  points: string[];
};

// TEMPORARY TEST DATA: remove or gate behind a flag once real schedule/route data is wired in.
const USE_TEST_DUMMY_DATA = true;
const dummyRoutePointsByRouteId: Record<string, string[]> = {
  "R-100": ["Kotte", "Bambalapitiya", "Wellawatte"],
  "R-101": ["Maharagama", "Nugegoda", "Dehiwala"],
  "R-102": ["Rajagiriya", "Battaramulla", "Pelawatte"],
};

const createDummyTasks = (collectorId: string, collectorName: string): ScheduleTask[] => [
  {
    id: "dummy-task-1",
    collectorId,
    collectorName,
    driverId: "dummy-driver-1",
    driverName: "Nimal Perera",
    vehicleNo: "CT-102",
    region: "Colombo 07",
    routeId: "R-100",
    date: new Date().toISOString().slice(0, 10),
    description: "Temporary test schedule for the collector task table",
    status: "pending",
  },
  {
    id: "dummy-task-2",
    collectorId,
    collectorName,
    driverId: "dummy-driver-2",
    driverName: "Samantha Silva",
    vehicleNo: "CT-204",
    region: "Colombo 05",
    routeId: "R-101",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    description: "Temporary test schedule for route-based collection",
    status: "pending",
  },
  {
    id: "dummy-task-3",
    collectorId,
    collectorName,
    driverId: "dummy-driver-3",
    driverName: "Kasun Fernando",
    vehicleNo: "CT-310",
    region: "Colombo 03",
    routeId: "R-102",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    description: "Temporary test schedule for the points-marking view",
    status: "pending",
  },
];

export default function CollectorTasksPage() {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");
  const [vehicleData, setVehicleData] = useState<{ id?: string; area?: string } | null>(null);
  const [activeTask, setActiveTask] = useState<ScheduleTask | null>(null);
  const [activeRoutePoints, setActiveRoutePoints] = useState<string[]>([]);
  const [completedPoints, setCompletedPoints] = useState<boolean[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useLiveTracking(user, profile);

  const collectorAccountId = user?.uid || profile?.uid || "";

  useEffect(() => {
    if (!collectorAccountId) return;

    const qSchedules = query(
      collection(db, "schedules"),
      where("collectorId", "==", collectorAccountId),
      where("status", "in", ["pending", "started", "completed"]),
      orderBy("date", "asc")
    );

    const unsubscribeSchedules = onSnapshot(qSchedules, (snapshot) => {
      const nextTasks = snapshot.docs.map((documentSnapshot) => {
        const data = documentSnapshot.data();
        return {
          id: documentSnapshot.id,
          collectorId: String(data.collectorId || ""),
          collectorName: String(data.collectorName || ""),
          driverId: String(data.driverId || ""),
          driverName: String(data.driverName || ""),
          vehicleNo: String(data.vehicleNo || ""),
          region: String(data.region || ""),
          routeId: String(data.routeId || ""),
          date: String(data.date || ""),
          description: String(data.description || ""),
          status: String(data.status || "pending") as ScheduleTask["status"],
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : null,
        } satisfies ScheduleTask;
      });

      setTasks(nextTasks);
      setLoading(false);
    });

    const qRoutes = query(collection(db, "routes"));
    const unsubscribeRoutes = onSnapshot(qRoutes, (snapshot) => {
      const nextRoutes = snapshot.docs.map((documentSnapshot) => {
        const data = documentSnapshot.data();
        return {
          id: String(data.routeId || documentSnapshot.id || ""),
          region: String(data.region || ""),
          points: Array.isArray(data.points) ? data.points.filter((entry): entry is string => typeof entry === "string") : [],
        } satisfies RouteData;
      });
      setRoutes(nextRoutes);
    });

    const fetchVehicle = async () => {
      try {
        const { getDoc, doc } = await import("firebase/firestore");
        const vehicleDoc = await getDoc(doc(db, "activeVehicles", collectorAccountId));
        if (vehicleDoc.exists()) {
          const vehicle = vehicleDoc.data();
          setVehicleData({ id: String(vehicle.id || ""), area: String(vehicle.area || "") });
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
      }
    };

    void fetchVehicle();

    return () => {
      unsubscribeSchedules();
      unsubscribeRoutes();
    };
  }, [collectorAccountId]);

  const demoTask = useMemo<ScheduleTask>(() => ({
    id: "demo-task-1",
    collectorId: collectorAccountId,
    collectorName: profile?.fullName || "Demo Collector",
    driverId: "demo-driver-1",
    driverName: "Demo Driver",
    vehicleNo: "CT-102",
    region: "Colombo 07",
    routeId: "R-100",
    date: new Date().toISOString().slice(0, 10),
    description: "Dummy scheduled collection",
    status: "pending",
  }), [collectorAccountId, profile?.fullName]);

  const dummyTasks = useMemo(() => {
    if (!USE_TEST_DUMMY_DATA) return [];
    return createDummyTasks(collectorAccountId, profile?.fullName || "Demo Collector");
  }, [collectorAccountId, profile?.fullName]);

  const visibleTasks = useMemo(() => {
    if (tasks.length === 0 && !loading && dummyTasks.length > 0) {
      return dummyTasks;
    }
    return tasks;
  }, [dummyTasks, loading, tasks]);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return visibleTasks.filter((task) => {
      const matchesStatus = filterStatus === "all" || (filterStatus === "pending" ? task.status !== "completed" : task.status === "completed");
      const matchesSearch = !normalizedSearch || [task.collectorName, task.driverName, task.routeId, task.vehicleNo, task.region].some((value) => value.toLowerCase().includes(normalizedSearch));
      return matchesStatus && matchesSearch;
    });
  }, [filterStatus, searchTerm, visibleTasks]);

  const progress = useMemo(() => {
    if (visibleTasks.length === 0) return 0;
    const completedCount = visibleTasks.filter((task) => task.status === "completed").length;
    return Math.round((completedCount / visibleTasks.length) * 100);
  }, [visibleTasks]);

  const getInitials = (name: string) => {
    return name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDisplayDate = (value: string) => {
    if (!value) return "—";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
  };

  const openRoutePoints = (task: ScheduleTask) => {
    const matchedRoute = routes.find((route) => route.id.toLowerCase() === task.routeId.toLowerCase());
    const fallbackPoints = dummyRoutePointsByRouteId[task.routeId] || dummyRoutePointsByRouteId[task.routeId.toUpperCase()];
    const points = matchedRoute?.points.length ? matchedRoute.points : fallbackPoints || [];

    setActiveTask(task);
    setActiveRoutePoints(points);
    setCompletedPoints(new Array(points.length).fill(false));
  };

  const handlePointToggle = (index: number) => {
    setCompletedPoints((current) => {
      const next = [...current];
      next[index] = !next[index];
      const allCompleted = next.every(Boolean);

      if (allCompleted && activeTask) {
        void completeTask(activeTask.id);
      }

      return next;
    });
  };

  const completeTask = async (taskId: string) => {
    if (!activeTask) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "schedules", taskId), {
        status: "completed",
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setActiveTask(null);
      setActiveRoutePoints([]);
      setCompletedPoints([]);
    } catch (error) {
      console.error("Error completing task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualClose = () => {
    setActiveTask(null);
    setActiveRoutePoints([]);
    setCompletedPoints([]);
  };

  const handleStartTask = async (task: ScheduleTask) => {
    try {
      await updateDoc(doc(db, "schedules", task.id), {
        status: "started",
        updatedAt: serverTimestamp(),
      });
      openRoutePoints(task);
    } catch (error) {
      console.error("Error starting task:", error);
    }
  };

  return (
    <RoleGuard allowedRole="collector">
      <div className="flex min-h-screen bg-[#F1F5F0] font-sans">
        <aside className="w-64 bg-white/50 p-6 flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            </div>
            <span className="text-xl font-bold text-[#1F3915]">
              EcoCycle <span className="text-xs block font-normal text-[#2E7D32] -mt-1">LANKA</span>
            </span>
          </div>

          <nav className="flex flex-col gap-2">
            <Link href="/collector" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Dashboard
            </Link>
            <Link href="/collector/tasks" className="flex items-center gap-3 px-4 py-2 text-sm font-medium bg-[#55B56F] text-white rounded-[12px] shadow-lg shadow-[#55B56F]/20">
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
        </aside>

        <main className="flex-1 p-8">
          <div className="text-gray-400 text-sm mb-4 font-semibold uppercase tracking-wider">Collector-Task</div>

          <div className="flex justify-end items-center mb-6">
            <div className="flex items-center gap-3 bg-white/60 px-4 py-1.5 rounded-full border border-white/40 shadow-sm">
              <div className="w-9 h-9 bg-[#2E7D32] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner">
                {profile?.fullName ? getInitials(profile.fullName) : "C"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 leading-tight">{profile?.fullName || "Collector"}</span>
                <span className="text-[10px] text-gray-500 font-medium tracking-wide">Collector</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#DBF2DC] to-[#E9F7E9] rounded-[32px] p-8 flex justify-between items-center relative overflow-hidden shadow-sm">
              <div className="relative z-10">
                <span className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-[0.2em] mb-1 block">Collector</span>
                <h1 className="text-[36px] font-bold text-gray-800 leading-tight">
                  Hello,<span className="text-[#55B56F]">{profile?.fullName?.split(" ")[0] || "Collector"}!</span>
                </h1>
                <p className="text-gray-500 text-sm font-medium mt-1">Working with Truck {vehicleData?.id || "N/A"} · Zone {vehicleData?.area || profile?.district || "N/A"}</p>
              </div>

              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#FFFFFF" strokeWidth="12" fill="transparent" />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#55B56F"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray="440"
                    strokeDashoffset={440 * (1 - progress / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-[32px] font-black text-gray-800 leading-none">{progress}%</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Tasks</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase">Today</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-white/60 min-h-[400px]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[24px] font-bold text-gray-800">Pending & Upcoming Task</h2>

                <div className="flex items-center gap-4">
                  <div className="relative bg-[#f7fbf6] rounded-full flex items-center px-4 py-2 gap-3 w-64 border border-[#dfe9e2]">
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
                    <input
                      type="text"
                      placeholder="Search route or collector"
                      className="bg-transparent text-sm w-full outline-none placeholder:text-gray-500"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>

                  <div className="relative group">
                    <button className="flex items-center gap-2 text-gray-500 font-bold text-sm bg-gray-50 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"></path></svg>
                      Filter: {filterStatus === "all" ? "All" : filterStatus === "pending" ? "Pending" : "Completed"}
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 hidden group-hover:block z-20">
                      <button onClick={() => setFilterStatus("all")} className="w-full text-left px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">All Tasks</button>
                      <button onClick={() => setFilterStatus("pending")} className="w-full text-left px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Pending Only</button>
                      <button onClick={() => setFilterStatus("completed")} className="w-full text-left px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Completed Only</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[860px]">
                  <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-gray-400">
                    <span>DATE</span>
                    <span>COLLECTOR</span>
                    <span>DRIVER</span>
                    <span>VEHICLE</span>
                    <span>ROUTE ID</span>
                    <span>ACTION</span>
                  </div>

                  {loading ? (
                    <div className="rounded-[18px] bg-[#f8fbf7] p-8 text-center text-gray-500">Loading tasks...</div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="rounded-[18px] bg-[#f8fbf7] p-8 text-center text-gray-500">No tasks found.</div>
                  ) : (
                    filteredTasks.map((task, index) => {
                      const isCompleted = task.status === "completed";
                      return (
                        <div key={task.id} className={`grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center rounded-[18px] px-4 py-4 mb-2 ${index % 2 === 0 ? "bg-[#f8fbf7]" : "bg-[#f3f6f3]"} ${isCompleted ? "opacity-70" : ""}`}>
                          <span className="text-sm font-semibold text-gray-700">{formatDisplayDate(task.date)}</span>
                          <span className="text-sm font-semibold text-gray-700">{task.collectorName || "—"}</span>
                          <span className="text-sm font-semibold text-gray-700">{task.driverName || "—"}</span>
                          <span className="text-sm font-semibold text-gray-700">{task.vehicleNo || "—"}</span>
                          <span className="text-sm font-semibold text-gray-700">{task.routeId || "—"}</span>
                          <div className="flex justify-end">
                            {isCompleted ? (
                              <span className="rounded-full bg-gray-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-gray-600">Completed</span>
                            ) : (
                              <button type="button" onClick={() => void handleStartTask(task)} className="rounded-full bg-[#2E7D32] px-5 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#235f28]">
                                Start
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {activeTask ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
            <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#166529]">Route points</p>
                  <h3 className="text-xl font-bold text-gray-800">{activeTask.routeId}</h3>
                  <p className="mt-1 text-sm text-gray-500">Mark each collection point as collected. The panel stays open until the last point is completed.</p>
                </div>
                <button type="button" onClick={handleManualClose} className="rounded-full bg-[#f3f7f3] p-2 text-lg text-gray-600">
                  ×
                </button>
              </div>

              {activeRoutePoints.length === 0 ? (
                <div className="rounded-[18px] bg-[#f8fbf7] p-4 text-sm text-gray-600">No collection points found for this route.</div>
              ) : (
                <div className="space-y-3">
                  {activeRoutePoints.map((point, index) => (
                    <label key={`${activeTask.id}-${point}`} className="flex items-center gap-3 rounded-[16px] border border-[#e6efe7] bg-[#f8fbf7] px-4 py-3">
                      <input
                        type="checkbox"
                        checked={completedPoints[index] || false}
                        onChange={() => handlePointToggle(index)}
                        className="h-4 w-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]"
                      />
                      <span className="text-sm font-medium text-gray-700">{point}</span>
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button type="button" onClick={handleManualClose} className="rounded-full bg-[#eef9f2] px-4 py-2 text-sm font-semibold text-[#166529]">
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </RoleGuard>
  );
}
