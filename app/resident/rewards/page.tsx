"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";

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

function OfferCard({
  offer,
  onRedeem,
}: {
  offer: (typeof OFFERS)[number];
  onRedeem: (offer: (typeof OFFERS)[number]) => void;
}) {
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
        <button type="button" className={styles.redeemButton} disabled={!offer.active} onClick={() => onRedeem(offer)}>
          Redeem
        </button>
      </div>
    </article>
  );
}

export default function ResidentRewardsPage() {
  const { profile } = useAuth();
  const [availablePoints, setAvailablePoints] = useState(450);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [storeRewards, setStoreRewards] = useState<typeof OFFERS>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [redeemName, setRedeemName] = useState("");
  const [redeemNic, setRedeemNic] = useState("");

  useEffect(() => {
    if (profile) {
      setAvailablePoints(profile.points || 0);
    }
  }, [profile]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rewards");
      if (raw) {
        const parsed = JSON.parse(raw) as any[];
        const normalized = parsed.map((r) => ({
          category: "Store",
          title: r.name,
          description: r.description,
          points: r.points || 0,
          active: true,
          image: r.image,
          audiences: r.audiences ?? ["residents", "drivers", "collectors"],
        }));
        const filtered = normalized.filter((x) => (x.audiences || []).includes("residents"));
        setStoreRewards(filtered);
      }
    } catch (e) {
      setStoreRewards([]);
    }
  }, []);

  const handleRedeem = (offer: (typeof OFFERS)[number] & { image?: string }) => {
    if (!offer.active) return;
    setSelectedOffer(offer);
    setRedeemName(profile?.fullName || "");
    setRedeemNic(profile?.nic || "");
    setModalOpen(true);
  };

  const confirmRedeem = () => {
    if (!selectedOffer) return;
    const offer = selectedOffer as typeof OFFERS[number];
    if (offer.points > availablePoints) {
      setMessage("Insufficient points to redeem this reward.");
      setIsError(true);
      setModalOpen(false);
      return;
    }

    setAvailablePoints((current) => current - offer.points);
    setMessage(`Redeemed ${offer.title} for ${offer.points} points.`);
    setIsError(false);

    const rec = {
      date: new Date().toISOString(),
      name: redeemName || "Anonymous",
      nic: redeemNic || "-",
      rewardName: offer.title,
      action: "pending",
    };
    try {
      const raw = localStorage.getItem("rewardRedeems");
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift(rec);
      localStorage.setItem("rewardRedeems", JSON.stringify(arr));
    } catch (e) {
      // ignore
    }

    setModalOpen(false);
    setSelectedOffer(null);
  };

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
            <strong>{availablePoints} pts</strong>
          </div>
        </div>

        {message ? (
          <div className={`${styles.toastMessage} ${isError ? styles.toastError : styles.toastSuccess}`}>
            {message}
          </div>
        ) : null}

        <div className={styles.offerGrid}>
          {storeRewards.length > 0
            ? storeRewards.map((offer) => <OfferCard offer={offer as any} key={offer.title} onRedeem={handleRedeem} />)
            : OFFERS.map((offer) => <OfferCard offer={offer} key={offer.title} onRedeem={handleRedeem} />)}
        </div>
      </section>

      {modalOpen && selectedOffer ? (
        <div className={styles.redeemModalBackdrop}>
          <div className={styles.redeemModal} role="dialog" aria-modal="true">
            <div className={styles.redeemModalHeader}>Confirm redemption</div>
            <div style={{ marginBottom: 8 }}>{selectedOffer.title} — {selectedOffer.points} pts</div>
            <div className={styles.redeemFormRow}>
              <label style={{ fontSize: 12, color: "#374151" }}>Full name</label>
              <input className={styles.redeemInput} value={redeemName} onChange={(e) => setRedeemName(e.target.value)} placeholder="Your full name" />
            </div>

            <div className={styles.redeemFormRow}>
              <label style={{ fontSize: 12, color: "#374151" }}>NIC</label>
              <input className={styles.redeemInput} value={redeemNic} onChange={(e) => setRedeemNic(e.target.value)} placeholder="National ID" />
            </div>

            <div className={styles.redeemActions}>
              <button className={styles.redeemButton} onClick={() => { setModalOpen(false); setSelectedOffer(null); }}>Cancel</button>
              <button className={styles.redeemButton} onClick={confirmRedeem}>Confirm Redeem</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
