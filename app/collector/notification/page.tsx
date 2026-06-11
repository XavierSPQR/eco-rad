"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/RoleGuard";

export default function CollectorNotificationPage() {
  const notifications = [
    {
      id: 1,
      type: "truck",
      title: "Truck arriving in 12 min",
      description: "LK-4521 is approaching Nugegoda zone B",
      time: "2m ago",
      iconBg: "bg-[#E6F4EA]",
      iconColor: "text-[#2E7D32]",
    },
    {
      id: 2,
      type: "verified",
      title: "Verified: BC10234",
      description: "+136 points credited to your wallet",
      time: "1h ago",
      iconBg: "bg-[#E6F4EA]",
      iconColor: "text-[#2E7D32]",
    },
    {
      id: 3,
      type: "reward",
      title: "Reward unlocked",
      description: "Free reusable tote at Keells Super",
      time: "Yesterday",
      iconBg: "bg-[#FFF4E5]",
      iconColor: "text-[#D97706]",
    },
    {
      id: 4,
      type: "complaint",
      title: "Complaint resolved",
      description: "Overflowing bin - Borella reported by you",
      time: "2d ago",
      iconBg: "bg-[#E6F4EA]",
      iconColor: "text-[#2E7D32]",
    },
    {
      id: 5,
      type: "truck",
      title: "Truck arriving in 12 min",
      description: "LK-4521 is approaching Nugegoda zone B",
      time: "2m ago",
      iconBg: "bg-[#E6F4EA]",
      iconColor: "text-[#2E7D32]",
    },
    {
      id: 6,
      type: "verified",
      title: "Verified: BC10234",
      description: "+136 points credited to your wallet",
      time: "1h ago",
      iconBg: "bg-[#E6F4EA]",
      iconColor: "text-[#2E7D32]",
    },
    {
      id: 7,
      type: "reward",
      title: "Reward unlocked",
      description: "Free reusable tote at Keells Super",
      time: "Yesterday",
      iconBg: "bg-[#FFF4E5]",
      iconColor: "text-[#D97706]",
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "truck":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        );
      case "verified":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case "reward":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 12 20 22 4 22 4 12"></polyline>
            <rect x="2" y="7" width="20" height="5"></rect>
            <line x1="12" y1="22" x2="12" y2="7"></line>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
          </svg>
        );
      case "complaint":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      default:
        return null;
    }
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
          <Link href="/collector/tasks" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            Tasks
          </Link>
          <Link href="/collector/notification" className="flex items-center gap-3 px-4 py-2 text-sm font-medium bg-[#55B56F] text-white rounded-[12px] shadow-lg shadow-[#55B56F]/20">
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
        <div className="text-gray-400 text-sm mb-4 font-semibold uppercase tracking-wider">Collectors-Notification</div>

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-[450px]">
            <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input
              type="text"
              placeholder="Search collections, complaints, trucks..."
              className="w-full pl-11 pr-4 py-2.5 bg-white rounded-full text-[13px] focus:outline-none shadow-sm border-none placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-3 bg-white/60 px-4 py-1.5 rounded-full border border-white/40 shadow-sm">
            <div className="w-9 h-9 bg-[#2E7D32] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner">SF</div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800 leading-tight">Sanjeewa Fernando</span>
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
                Hello,<span className="text-[#55B56F]">Sanjeewa!</span>
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-1">Working with Truck LK-4521 · Zone Colombo South</p>

              <div className="flex items-center gap-3 mt-5">
                <div className="bg-[#BCE4C0] px-3 py-1 rounded-full flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#2E7D32]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"></path></svg>
                  <span className="text-[11px] font-bold text-[#2E7D32]">Rank #4 this month</span>
                </div>
                <div className="bg-[#BCE4C0] px-3 py-1 rounded-full flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#2E7D32]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 6l-9.5 9.5-5-5L1 18"></path></svg>
                  <span className="text-[11px] font-bold text-[#2E7D32]">Score 92.4</span>
                </div>
              </div>
            </div>

            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Simple Progress Ring */}
              <svg className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#FFFFFF" strokeWidth="12" fill="transparent" />
                <circle
                  cx="80" cy="80" r="70"
                  stroke="#55B56F" strokeWidth="12" fill="transparent"
                  strokeDasharray="440" strokeDashoffset={440 * (1 - 0.82)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[32px] font-black text-gray-800 leading-none">82%</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Tasks</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase">Today</span>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-white/60 min-h-[400px]">
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${notif.iconBg} ${notif.iconColor}`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[15px] font-bold text-gray-800">{notif.title}</h3>
                      <p className="text-[13px] text-gray-500 font-medium">{notif.description}</p>
                    </div>
                  </div>
                  <span className="text-[12px] font-bold text-gray-400">{notif.time}</span>
                </div>
              ))}
            </div>
            <div className="p-8"></div>
          </div>
        </div>
      </main>
    </div>
    </RoleGuard>
  );
}
