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
          <Link href="#" className={styles.navItem}>Dashboard</Link>
          <Link href="#" className={styles.navItem}>Tasks</Link>
          <Link href="#" className={styles.navItem}>Notifications</Link>
          <Link href="#" className={styles.navItem}>Profile</Link>
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
