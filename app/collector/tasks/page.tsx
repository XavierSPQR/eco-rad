"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  increment,
  Timestamp,
  writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLiveTracking } from "@/lib/useLiveTracking";
import { RoleGuard } from "@/components/RoleGuard";
import { notifyAllAdmins } from "@/lib/adminNotifications";

type PickupRequest = {
  id: string;
  userId?: string;
  description: string;
  location: string;
  status: "pending" | "scheduled" | "completed" | "cancelled" | "started";
  requestedDate?: Timestamp | null;
  date?: string;
  createdAt: Timestamp | null;
  collectorId?: string;
  updatedAt?: Timestamp | null;
  type: "pickup" | "schedule";
};

type WasteType = "Recyclable" | "Organic" | "E-Waste";

const POINTS_CONFIG: Record<WasteType, number> = {
  Organic: 5,
  Recyclable: 10,
  "E-Waste": 20,
};

export default function CollectorTasksPage() {
  const { user, profile } = useAuth();
  const [pendingPickups, setPendingPickups] = useState<PickupRequest[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<PickupRequest[]>([]);
  const [completedTasksToday, setCompletedTasksToday] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");
  const [vehicleData, setVehicleData] = useState<any>(null);

  // Start live tracking
  useLiveTracking(user, profile);

  // Confirmation Modal State for Pickups
  const [selectedTask, setSelectedTask] = useState<PickupRequest | null>(null);
  const [wasteType, setWasteType] = useState<WasteType>("Organic");
  const [weight, setWeight] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation Modal State for Schedules
  const [scheduleToComplete, setScheduleToComplete] = useState<PickupRequest | null>(null);

  useEffect(() => {
    if (!user) return;

    // Listen to pending pickup requests
    const qPending = query(
      collection(db, "pickupRequests"),
      where("status", "==", "pending"),
      orderBy("requestedDate", "asc")
    );

    const unsubscribePending = onSnapshot(qPending, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: "pickup"
      })) as PickupRequest[];
      setPendingPickups(taskList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching pending tasks:", error);
      setLoading(false);
    });

    // Listen to schedules assigned to this collector
    const qSchedules = query(
      collection(db, "schedules"),
      where("collectorId", "==", user.uid),
      where("status", "in", ["pending", "started"])
    );

    const unsubscribeSchedules = onSnapshot(qSchedules, (snapshot) => {
      const scheduleList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: "schedule",
        location: doc.data().region,
        requestedDate: doc.data().date ? Timestamp.fromDate(new Date(doc.data().date)) : null
      })) as PickupRequest[];
      setScheduledTasks(scheduleList);
    });

    // Listen to completed tasks (both types) by this collector
    const qCompletedPickups = query(
      collection(db, "pickupRequests"),
      where("status", "==", "completed"),
      where("collectorId", "==", user.uid)
    );

    const qCompletedSchedules = query(
      collection(db, "schedules"),
      where("status", "==", "completed"),
      where("collectorId", "==", user.uid)
    );

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const unsubscribeCompletedPickups = onSnapshot(qCompletedPickups, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: "pickup"
      })) as PickupRequest[];

      const todayList = taskList.filter(task => {
        const updateDate = task.updatedAt?.toDate();
        return updateDate && updateDate >= startOfToday;
      });

      setCompletedTasksToday(prev => {
        const otherType = prev.filter(t => t.type !== "pickup");
        return [...otherType, ...todayList];
      });
    });

    const unsubscribeCompletedSchedules = onSnapshot(qCompletedSchedules, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: "schedule",
        location: doc.data().region
      })) as PickupRequest[];

      const todayList = taskList.filter(task => {
        const updateDate = task.updatedAt?.toDate();
        return updateDate && updateDate >= startOfToday;
      });

      setCompletedTasksToday(prev => {
        const otherType = prev.filter(t => t.type !== "schedule");
        return [...otherType, ...todayList];
      });
    });

    // Fetch Truck ID and Area from activeVehicles
    const fetchTruck = async () => {
      try {
        const { getDoc, doc } = await import("firebase/firestore");
        const vehicleDoc = await getDoc(doc(db, "activeVehicles", user.uid));
        if (vehicleDoc.exists()) {
          setVehicleData(vehicleDoc.data());
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
      }
    };
    fetchTruck();

    return () => {
      unsubscribePending();
      unsubscribeSchedules();
      unsubscribeCompletedPickups();
      unsubscribeCompletedSchedules();
    };
  }, [user]);

  const handleConfirmCollection = async () => {
    if (!selectedTask || !weight || isSubmitting || !user) return;

    setIsSubmitting(true);
    try {
      const weightNum = parseFloat(weight);
      const pointsEarned = weightNum * POINTS_CONFIG[wasteType];
      const batch = writeBatch(db);

      // 1. Create waste collection record
      const collectionRef = doc(collection(db, "wasteCollections"));
      batch.set(collectionRef, {
        userId: selectedTask.userId,
        wasteType,
        weight: weightNum,
        pointsEarned,
        collectedAt: serverTimestamp(),
        collectorId: user.uid,
        requestId: selectedTask.id
      });

      // 2. Update pickup request status
      const requestRef = doc(db, "pickupRequests", selectedTask.id);
      batch.update(requestRef, {
        status: "completed",
        collectorId: user.uid,
        updatedAt: serverTimestamp()
      });

      // 3. Update resident points and residences count
      const userRef = doc(db, "users", selectedTask.userId!);
      batch.update(userRef, {
        points: increment(pointsEarned),
        residences: increment(1),
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      setSelectedTask(null);
      setWeight("");
    } catch (error) {
      console.error("Error confirming collection:", error);
      alert("Failed to confirm collection. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartSchedule = async (schedule: PickupRequest) => {
    try {
      await updateDoc(doc(db, "schedules", schedule.id), {
        status: "started",
        updatedAt: serverTimestamp()
      });

      const time = new Date().toLocaleTimeString();
      await notifyAllAdmins(
        "Pickup started",
        `${profile?.fullName || "Collector"} Pickup Started ${time}`,
        "truck"
      );
    } catch (error) {
      console.error("Error starting schedule:", error);
    }
  };

  const handleCompleteSchedule = async () => {
    if (!scheduleToComplete) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "schedules", scheduleToComplete.id), {
        status: "completed",
        updatedAt: serverTimestamp()
      });

      const time = new Date().toLocaleTimeString();
      await notifyAllAdmins(
        "Pickup completed",
        `${profile?.fullName || "Collector"} Pickup Completed ${time}`,
        "verified"
      );
      setScheduleToComplete(null);
    } catch (error) {
      console.error("Error completing schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTasks = useMemo(() => {
    let combined = [...pendingPickups, ...scheduledTasks];
    if (filterStatus === "all" || filterStatus === "completed") {
      combined = [...combined, ...completedTasksToday];
    }

    // If filter is specific
    if (filterStatus === "pending") {
      combined = [...pendingPickups, ...scheduledTasks];
    } else if (filterStatus === "completed") {
      combined = [...completedTasksToday];
    }

    return combined
      .filter(task =>
        task.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const dateA = a.requestedDate?.toDate() || new Date(0);
        const dateB = b.requestedDate?.toDate() || new Date(0);
        return dateA.getTime() - dateB.getTime();
      });
  }, [pendingPickups, scheduledTasks, completedTasksToday, searchTerm, filterStatus]);

  const progress = useMemo(() => {
    const completedCount = completedTasksToday.length;
    const total = completedCount + pendingPickups.length + scheduledTasks.length;
    return total > 0 ? Math.round((completedCount / total) * 100) : 0;
  }, [completedTasksToday, pendingPickups, scheduledTasks]);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <RoleGuard allowedRole="collector">
    <div className="flex min-h-screen bg-[#F1F5F0] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white/50 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center">
             <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <span className="text-xl font-bold text-[#1F3915]">EcoCycle <span className="text-xs block font-normal text-[#2E7D32] -mt-1">LANKA</span></span>
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

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="text-gray-400 text-sm mb-4 font-semibold uppercase tracking-wider">Collector-Task</div>

        {/* Top Bar */}
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

        {/* Content Area */}
        <div className="space-y-6">
          {/* Greeting Card */}
          <div className="bg-gradient-to-r from-[#DBF2DC] to-[#E9F7E9] rounded-[32px] p-8 flex justify-between items-center relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <span className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-[0.2em] mb-1 block">Collector</span>
              <h1 className="text-[36px] font-bold text-gray-800 leading-tight">
                Hello,<span className="text-[#55B56F]">{profile?.fullName?.split(" ")[0] || "Collector"}!</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-1">Working with Truck {vehicleData?.id || "N/A"} · Zone {vehicleData?.area || profile?.district || "N/A"}</p>
            </div>

            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Simple Progress Ring */}
              <svg className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#FFFFFF" strokeWidth="12" fill="transparent" />
                <circle
                  cx="80" cy="80" r="70"
                  stroke="#55B56F" strokeWidth="12" fill="transparent"
                  strokeDasharray="440" strokeDashoffset={440 * (1 - progress / 100)}
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

          {/* Table Section */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-white/60 min-h-[400px]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[24px] font-bold text-gray-800">Pending & Upcoming Task</h2>

              <div className="flex items-center gap-4">
                <div className="relative bg-[#E9EEF4] rounded-full flex items-center px-4 py-2 gap-3 w-64 border border-gray-100">
                  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
                  <input
                    type="text"
                    placeholder="search"
                    className="bg-transparent text-sm w-full outline-none placeholder:text-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="relative group">
                  <button className="flex items-center gap-2 text-gray-500 font-bold text-sm bg-gray-50 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"></path></svg>
                    Filter: {filterStatus === "all" ? "All" : filterStatus === "pending" ? "Pending" : "Confirmed"}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 hidden group-hover:block z-20">
                    <button onClick={() => setFilterStatus("all")} className="w-full text-left px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">All Tasks</button>
                    <button onClick={() => setFilterStatus("pending")} className="w-full text-left px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Pending Only</button>
                    <button onClick={() => setFilterStatus("completed")} className="w-full text-left px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Confirmed Only</button>
                  </div>
                </div>
              </div>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-4">
                  <th className="pb-4 font-bold">Location</th>
                  <th className="pb-4 font-bold">Description</th>
                  <th className="pb-4 font-bold">Type</th>
                  <th className="pb-4 font-bold">Request Date</th>
                  <th className="pb-4 font-bold text-center">Status</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">Loading tasks...</td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">No tasks found.</td>
                  </tr>
                ) : filteredTasks.map((task) => (
                  <tr key={task.id} className="group">
                    <td className="py-5 flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                      <span className="font-bold text-gray-800 text-[14px]">{task.location}</span>
                    </td>
                    <td className="py-5 font-bold text-gray-600 text-[14px] truncate max-w-[200px]">{task.description}</td>
                    <td className="py-5 font-bold text-[12px] uppercase">
                      <span className={task.type === "pickup" ? "text-blue-500" : "text-purple-500"}>
                        {task.type}
                      </span>
                    </td>
                    <td className="py-5 font-bold text-gray-600 text-[14px]">
                      {task.requestedDate?.toDate().toLocaleDateString() || "N/A"}
                    </td>
                    <td className="py-5 text-center">
                      <span className={`text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg capitalize ${
                        task.status === 'pending'
                        ? 'bg-gradient-to-r from-[#F1883D] to-[#F37651] text-white shadow-orange-500/20'
                        : task.status === 'started'
                        ? 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white shadow-blue-500/20'
                        : 'bg-gradient-to-r from-[#55B56F] to-[#2E7D32] text-white shadow-green-500/20'
                      }`}>
                        {task.status === 'completed' ? 'Confirmed' : task.status}
                      </span>
                    </td>
                    <td className="py-5 text-right">
                      {task.type === 'pickup' && task.status === 'pending' && (
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="bg-[#2E7D32] hover:bg-[#25632a] text-white text-[10px] font-bold px-5 py-1.5 rounded-full transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {task.type === 'schedule' && task.status === 'pending' && (
                        <button
                          onClick={() => handleStartSchedule(task)}
                          className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[10px] font-bold px-5 py-1.5 rounded-full transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {task.type === 'schedule' && task.status === 'started' && (
                        <button
                          onClick={() => setScheduleToComplete(task)}
                          className="bg-[#55B56F] hover:bg-[#469d5d] text-white text-[10px] font-bold px-5 py-1.5 rounded-full transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Confirmation Modal for Pickups */}
            {selectedTask && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Confirm Collection</h3>

                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Waste Type</label>
                      <select
                        value={wasteType}
                        onChange={(e) => setWasteType(e.target.value as WasteType)}
                        className="w-full bg-[#F1F5F0] border-none rounded-xl px-4 py-3 text-gray-800 font-medium focus:ring-2 focus:ring-[#55B56F]"
                      >
                        <option value="Organic">Organic</option>
                        <option value="Recyclable">Recyclable</option>
                        <option value="E-Waste">E-Waste</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="e.g. 5.5"
                        className="w-full bg-[#F1F5F0] border-none rounded-xl px-4 py-3 text-gray-800 font-medium focus:ring-2 focus:ring-[#55B56F]"
                      />
                    </div>

                    <div className="bg-[#DBF2DC] p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-gray-600">Points to be earned:</span>
                        <span className="text-lg font-black text-[#2E7D32]">
                          {weight ? (parseFloat(weight) * POINTS_CONFIG[wasteType]).toFixed(0) : 0}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#2E7D32] font-bold opacity-70">Resident will be notified immediately.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedTask(null)}
                      className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmCollection}
                      disabled={!weight || isSubmitting}
                      className="flex-1 bg-[#55B56F] hover:bg-[#469d5d] disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#55B56F]/20 transition-all"
                    >
                      {isSubmitting ? "Processing..." : "Complete Task"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Modal for Schedules */}
            {scheduleToComplete && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Are you sure?</h3>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setScheduleToComplete(null)}
                      className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      No
                    </button>
                    <button
                      onClick={handleCompleteSchedule}
                      disabled={isSubmitting}
                      className="flex-1 bg-[#55B56F] hover:bg-[#469d5d] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#55B56F]/20 transition-all"
                    >
                      {isSubmitting ? "..." : "Yes"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
    </RoleGuard>
  );
}
