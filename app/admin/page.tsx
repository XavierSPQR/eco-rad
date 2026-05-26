import Link from 'next/link'
import styles from './page.module.css'

const leaves = [
  { left: '39%', top: '25%', rotate: -18, size: 25 },
  { left: '57%', top: '21%', rotate: 12, size: 27 },
  { left: '70%', top: '35%', rotate: -22, size: 24 },
  { left: '92%', top: '55%', rotate: -14, size: 25 },
  { left: '40%', top: '67%', rotate: -26, size: 24 },
  { left: '53%', top: '74%', rotate: -8, size: 25 },
  { left: '60%', top: '69%', rotate: 18, size: 22 },
  { left: '92%', top: '79%', rotate: -5, size: 24 },
  { left: '37%', top: '89%', rotate: 8, size: 24 },
]

function LeafIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M5.5 15.4C6.8 8 13.9 5.3 22.3 6.1c.7 8.1-3.2 14.2-10.1 14.5-3.2.1-5.5-1.7-6.7-5.2Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.8 15.2c3.2.2 6.5-.9 9.6-3.7"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <circle cx="17" cy="11" r="5.5" stroke="currentColor" strokeWidth="2.6" />
      <path
        d="M6.5 29c0-6 4.2-10 10.5-10s10.5 4 10.5 10"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function AdminLanding() {
  return (
    <main className={styles.container}>
      <div className={styles.leafField} aria-hidden="true">
        {leaves.map((leaf) => (
          <span
            className={styles.floatingLeaf}
            key={`${leaf.left}-${leaf.top}`}
            style={{
              left: leaf.left,
              top: leaf.top,
              transform: `rotate(${leaf.rotate}deg)`,
            }}
          >
            <LeafIcon size={leaf.size} />
          </span>
        ))}
      </div>

      <section className={styles.storyPanel} aria-label="Eco Cycle Lanka impact">
        <div className={styles.illustration}>
          <div className={styles.sunGlow} />
          <div className={`${styles.building} ${styles.buildingBack}`}>
            <span />
            <span />
            <span />
          </div>
          <div className={`${styles.building} ${styles.buildingTall}`}>
            {Array.from({ length: 15 }).map((_, index) => (
              <i key={index} />
            ))}
          </div>
          <div className={`${styles.building} ${styles.buildingRight}`}>
            {Array.from({ length: 6 }).map((_, index) => (
              <i key={index} />
            ))}
          </div>
          <div className={styles.treeLeft}>
            <span />
            <span />
            <span />
          </div>
          <div className={styles.treeCenter}>
            <span />
            <span />
          </div>
          <div className={styles.treeRight}>
            <span />
            <span />
            <span />
          </div>
          <div className={styles.road} />
          <div className={styles.truck}>
            <div className={styles.truckCab}>
              <span />
            </div>
            <div className={styles.truckBody}>
              <strong>Recycle</strong>
            </div>
            <i className={styles.wheelOne} />
            <i className={styles.wheelTwo} />
          </div>
        </div>

        <h2 className={styles.title}>
          Building a Cleaner <span>Sri Lanka</span> Together
        </h2>
        <p className={styles.desc}>
          Smart waste collection, real-time truck tracking, and rewards for every recyclable kilogram.
        </p>

        <div className={styles.metrics}>
          <div className={styles.metric}>
            <strong>10,000+</strong>
            <span>Waste Collections</span>
          </div>
          <div className={styles.metric}>
            <strong>5,000+</strong>
            <span>Active Contributors</span>
          </div>
        </div>
      </section>

      <section className={styles.hero}>
        <p className={styles.kicker}>Eco Cycle Lanka</p>
        <h1 className={styles.heading}>
          Welcome To Eco Cycle Lanka <LeafIcon size={42} />
        </h1>
        <p className={styles.choose}>Choose Your Role</p>

        <Link href="/admin/login" className={styles.button}>
          <span className={styles.buttonIcon}>
            <UserIcon />
          </span>
          <span>Admin</span>
        </Link>
      </section>
    </main>
  )
}
