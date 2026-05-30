import Link from "next/link";

export default function CollectorProfilePage() {
  return (
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
          <Link href="#" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15l-2 5L9 9l11 4-5 2zm0 0l4 4m-4-4L8 8"></path></svg>
            Rewards
          </Link>
          <Link href="/collector/profile" className="flex items-center gap-3 px-4 py-2 text-sm font-medium bg-[#55B56F] text-white rounded-[12px] shadow-lg shadow-[#55B56F]/20">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Profile
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="text-gray-400 text-sm mb-4 font-semibold uppercase tracking-wider">Collectors-Profile</div>

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

        {/* Profile Card */}
        <div className="bg-white rounded-[32px] p-10 shadow-sm border border-white/60">
          <h2 className="text-[24px] font-bold text-gray-800 mb-8">Profile</h2>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label htmlFor="full-name" className="text-[13px] font-medium text-gray-500 ml-1">Full name</label>
              <input
                id="full-name"
                type="text"
                defaultValue="Hasindu Fernando"
                className="w-full px-5 py-3 bg-[#E9F0E6] rounded-[15px] text-[14px] font-medium text-gray-700 focus:outline-none border-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-[13px] font-medium text-gray-500 ml-1">Email</label>
              <input
                id="email"
                type="email"
                defaultValue="hasindu@ecocycle.lk"
                className="w-full px-5 py-3 bg-[#E9F0E6] rounded-[15px] text-[14px] font-medium text-gray-700 focus:outline-none border-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-[13px] font-medium text-gray-500 ml-1">Phone</label>
              <input
                id="phone"
                type="text"
                defaultValue="+94 77 234 5678"
                className="w-full px-5 py-3 bg-[#E9F0E6] rounded-[15px] text-[14px] font-medium text-gray-700 focus:outline-none border-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="district" className="text-[13px] font-medium text-gray-500 ml-1">District</label>
              <input
                id="district"
                type="text"
                defaultValue="Colombo"
                className="w-full px-5 py-3 bg-[#E9F0E6] rounded-[15px] text-[14px] font-medium text-gray-700 focus:outline-none border-none"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-[13px] font-medium text-gray-500 ml-1">Designation</label>
              <div className="flex items-center gap-6 mt-1 ml-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input type="radio" name="designation" className="peer appearance-none w-4 h-4 border-2 border-gray-300 rounded-full checked:border-[#2E7D32] transition-all" />
                    <div className="absolute w-2 h-2 bg-[#2E7D32] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                  <span className="text-[14px] font-medium text-gray-600">Driver</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input type="radio" name="designation" defaultChecked className="peer appearance-none w-4 h-4 border-2 border-gray-300 rounded-full checked:border-[#2E7D32] transition-all" />
                    <div className="absolute w-2 h-2 bg-[#2E7D32] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                  <span className="text-[14px] font-medium text-gray-600">Collector</span>
                </label>
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <label htmlFor="address" className="text-[13px] font-medium text-gray-500 ml-1">Address</label>
              <input
                id="address"
                type="text"
                defaultValue="14/3 Stanley Tilakaratne Mw, Nugegoda"
                className="w-full px-5 py-3 bg-[#E9F0E6] rounded-[15px] text-[14px] font-medium text-gray-700 focus:outline-none border-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-12">
            <button className="px-8 py-2.5 rounded-full border border-gray-200 text-gray-600 font-bold text-[14px] hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button className="px-8 py-2.5 rounded-full bg-[#4CAF50] text-white font-bold text-[14px] shadow-lg shadow-[#4CAF50]/20 hover:bg-[#43a047] transition-colors">
              Save changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
