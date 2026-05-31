import Link from "next/link";
import styles from "./page.module.css";

export default function CollectorDashboard() {
  const pending = [
    { barcode: "BC10231", category: "Recyclable", weight: "4.5 kg" },
    { barcode: "BC10232", category: "Organic", weight: "2 kg" },
  ];

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>EcoCycle</div>
        <nav className={styles.nav}>
          <nav className="flex flex-col gap-2"><Link href="/collector/notification" className="flex items-center gap-3 px-4 py-2 text-sm font-medium bg-[#55B56F] text-white rounded-[12px] shadow-lg shadow-[#55B56F]/20">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            Dashboard
          </Link>
          <Link href="/collector/tasks" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            Tasks
          </Link>
          <Link href="/collector" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Notifications
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors">
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
            <h1 className={styles.greeting}>Hello, Sanjeewa!</h1>
            <p className={styles.sub}>Working with Truck LK-4521 · Zone Colombo South</p>
          </div>
          <div className={styles.kpiRing}>
            <div className={styles.kpiInner}>82%<div className={styles.kpiLabel}>Tasks Today</div></div>
          </div>
        </header>

        <section className={styles.stats}>
          <div className={styles.statCard}><div className={styles.statNum}>23</div><div>Completed pickups</div></div>
          <div className={styles.statCard}><div className={styles.statNum}>5</div><div>Pending pickups</div></div>
          <div className={styles.statCard}><div className={styles.statNum}>146</div><div>Bags scanned</div></div>
          <div className={styles.statCard}><div className={styles.statNum}>31</div><div>Verifications</div></div>
        </section>

        <section className={styles.panels}>
          <div className={styles.pendingPanel}>
            <h3>Pending verifications</h3>
            <table className={styles.table}>
              <thead>
                <tr><th>BARCODE</th><th>AI CATEGORY</th><th>WEIGHT</th><th>ACTION</th></tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.barcode}>
                    <td>{p.barcode}</td>
                    <td>{p.category}</td>
                    <td>{p.weight}</td>
                    <td><button className={styles.verify}>Verify</button> <button className={styles.reject}>Reject</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  );
}
