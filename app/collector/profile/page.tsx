"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/RoleGuard";

export default function CollectorProfilePage() {
  const { user, profile: authProfile, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    district: "",
    address: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (authProfile) {
      setProfile({
        fullName: authProfile.fullName || "",
        email: authProfile.email || "",
        phone: authProfile.phone || "",
        district: authProfile.district || "",
        address: authProfile.address || "",
      });
    }
  }, [authProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    // Map hyphenated IDs to camelCase state keys
    const key = id === "full-name" ? "fullName" : id;
    setProfile(prev => ({ ...prev, [key]: value }));
    if (message) setMessage(null);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsUpdating(true);
    setMessage(null);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        district: profile.district,
        address: profile.address,
        updatedAt: serverTimestamp(),
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    if (authProfile) {
      setProfile({
        fullName: authProfile.fullName || "",
        email: authProfile.email || "",
        phone: authProfile.phone || "",
        district: authProfile.district || "",
        address: authProfile.address || "",
      });
    }
    setMessage(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/collector/tasks?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <RoleGuard allowedRole="collector">
    <div className="flex min-h-screen bg-[#F1F5F0] font-sans text-gray-800">
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
          <Link href="/collector/tasks" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            Tasks
          </Link>
          <Link href="/collector/notification" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            Notifications
          </Link>
          <Link href="/collector/profile" className="flex items-center gap-3 px-4 py-2 text-sm font-medium bg-[#55B56F] text-white rounded-[12px] shadow-lg shadow-[#55B56F]/20">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Profile
          </Link>
        </nav>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="text-gray-400 text-sm mb-4 font-semibold uppercase tracking-wider">Collectors-Profile</div>

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <form onSubmit={handleSearch} className="relative w-[450px]">
            <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input
              type="text"
              placeholder="Search collections, complaints, trucks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white rounded-full text-[13px] focus:outline-none shadow-sm border-none placeholder:text-gray-400"
            />
          </form>

          <div className="flex items-center gap-3 bg-white/60 px-4 py-1.5 rounded-full border border-white/40 shadow-sm">
            <div className="w-9 h-9 bg-[#2E7D32] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner">
              {getInitials(authProfile?.fullName || "Collector")}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800 leading-tight">{authProfile?.fullName || "Collector"}</span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wide capitalize">{authProfile?.role || "Collector"}</span>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-[32px] p-10 shadow-sm border border-white/60">
          <h2 className="text-[24px] font-bold text-gray-800 mb-8">Profile</h2>

          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label htmlFor="full-name" className="text-[13px] font-medium text-gray-500 ml-1">Full name</label>
              <input
                id="full-name"
                type="text"
                value={profile.fullName}
                onChange={handleChange}
                className="w-full px-5 py-3 bg-[#E9F0E6] rounded-[15px] text-[14px] font-medium text-gray-700 focus:outline-none border-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-[13px] font-medium text-gray-500 ml-1">Email</label>
              <input
                id="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full px-5 py-3 bg-[#E9F0E6] rounded-[15px] text-[14px] font-medium text-gray-700 focus:outline-none border-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-[13px] font-medium text-gray-500 ml-1">Phone</label>
              <input
                id="phone"
                type="text"
                value={profile.phone}
                onChange={handleChange}
                className="w-full px-5 py-3 bg-[#E9F0E6] rounded-[15px] text-[14px] font-medium text-gray-700 focus:outline-none border-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="district" className="text-[13px] font-medium text-gray-500 ml-1">District</label>
              <input
                id="district"
                type="text"
                value={profile.district}
                onChange={handleChange}
                className="w-full px-5 py-3 bg-[#E9F0E6] rounded-[15px] text-[14px] font-medium text-gray-700 focus:outline-none border-none"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label htmlFor="address" className="text-[13px] font-medium text-gray-500 ml-1">Address</label>
              <input
                id="address"
                type="text"
                value={profile.address}
                onChange={handleChange}
                className="w-full px-5 py-3 bg-[#E9F0E6] rounded-[15px] text-[14px] font-medium text-gray-700 focus:outline-none border-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-12">
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="px-8 py-2.5 rounded-full border border-gray-200 text-gray-600 font-bold text-[14px] hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="px-8 py-2.5 rounded-full bg-[#4CAF50] text-white font-bold text-[14px] shadow-lg shadow-[#4CAF50]/20 hover:bg-[#43a047] transition-colors disabled:opacity-50"
            >
              {isUpdating ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </main>
    </div>
    </RoleGuard>
  );
}
