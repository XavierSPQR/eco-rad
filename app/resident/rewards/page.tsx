import styles from "./page.module.css";

const BADGES = [
  {
    title: "Green Champion",
    subtitle: "78% complete",
    note: "Reach 3,000 points",
    variant: "complete",
  },
  {
    title: "Gold Collector",
    subtitle: "Earned",
    note: "100 verified pickups",
    variant: "gold",
  },
  {
    title: "Eco Contributor",
    subtitle: "Earned",
    note: "Recycle 50 kg",
    variant: "eco",
  },
  {
    title: "Plastic Buster",
    subtitle: "Earned",
    note: "Divert 25 kg of plastic",
    variant: "plastic",
  },
];

const OFFERS = [
  {
    category: "Utilities",
    badge: "50% OFF",
    title: "50% off Utility Bill",
    description: "Redeem for electricity savings up to Rs. 2,000.",
    points: 300,
    active: true,
  },
  {
    category: "Shopping",
    title: "Grocery Voucher",
    description: "Rs. 2,500 voucher at Keells, Cargills, or Arpico.",
    points: 400,
    active: true,
  },
  {
    category: "Shopping",
    title: "Gift Card",
    description: "Rs. 5,000 universal gift card.",
    points: 500,
    active: false,
  },
  {
    category: "Transport",
    title: "Bus Pass",
    description: "One month free public transport pass.",
    points: 350,
    active: true,
  },
  {
    category: "Food & Beverage",
    title: "Coffee Voucher",
    description: "5 free coffees at selected cafes.",
    points: 150,
    active: true,
  },
  {
    category: "Telecom",
    title: "Mobile Data Pack",
    description: "10GB data bundle for Dialog / Mobitel.",
    points: 200,
    active: true,
  },
  {
    category: "Utilities",
    badge: "30% OFF",
    title: "Water Bill Discount",
    description: "30% off water bill up to Rs. 1,500.",
    points: 250,
    active: true,
  },
  {
    category: "Shopping",
    title: "Premium Gift Box",
    description: "Eco-friendly products worth Rs. 3,000.",
    points: 450,
    active: true,
  },
];

function BadgeCard({ badge }: { badge: (typeof BADGES)[number] }) {
  return (
    <article className={`${styles.badgeCard} ${styles[`badgeCard_${badge.variant}`]}`}>
      <div className={styles.badgeMeta}>{badge.subtitle}</div>
      <h3 className={styles.badgeTitle}>{badge.title}</h3>
      <p className={styles.badgeNote}>{badge.note}</p>
    </article>
  );
}

function OfferCard({ offer }: { offer: (typeof OFFERS)[number] }) {
  return (
    <article className={`${styles.offerCard} ${offer.active ? "" : styles.offerCardDisabled}`}>
      <div className={styles.offerMeta}>
        <span>{offer.category}</span>
        {offer.badge ? <span className={styles.offerBadge}>{offer.badge}</span> : null}
      </div>
      <h3 className={styles.offerTitle}>{offer.title}</h3>
      <p className={styles.offerDescription}>{offer.description}</p>
      <div className={styles.offerFooter}>
        <span className={styles.offerPoints}>{offer.points} pts</span>
        <button type="button" className={styles.redeemButton} disabled={!offer.active}>
          Redeem
        </button>
      </div>
    </article>
  );
}

export default function ResidentRewardsPage() {
  return (
    <div className={styles.root}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroLabel}>Awards & Recognition</p>
          <h1 className={styles.heroTitle}>Earn badges, climb the leaderboard, and unlock real-world rewards.</h1>
        </div>

        <div className={styles.badges}>
          {BADGES.map((badge) => (
            <BadgeCard badge={badge} key={badge.title} />
          ))}
        </div>
      </section>

      <section className={styles.storeSection}>
        <div className={styles.storeHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Rewards Store</h2>
            <p className={styles.sectionSubtitle}>Redeem your points for exclusive rewards.</p>
          </div>

          <div className={styles.balancePill}>
            <span className={styles.balanceIcon}>🏦</span>
            <span>Available Balance:</span>
            <strong>450 pts</strong>
          </div>
        </div>

        <div className={styles.offerGrid}>
          {OFFERS.map((offer) => (
            <OfferCard offer={offer} key={offer.title} />
          ))}
        </div>
      </section>
    </div>
  );
}
