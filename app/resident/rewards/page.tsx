"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  increment,
} from "firebase/firestore";

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
  offer: any;
  onRedeem: (offer: any) => void;
}) {
  const points = offer.pointsRequired !== undefined ? offer.pointsRequired : offer.points;
  return (
    <article className={`${styles.offerCard} ${offer.active ? "" : styles.offerCardDisabled}`}>
      <div className={styles.offerMeta}>
        <span>{offer.category}</span>
      </div>
      <h3 className={styles.offerTitle}>{offer.title}</h3>
      <p className={styles.offerDescription}>{offer.description}</p>
      <div className={styles.offerFooter}>
        <span className={styles.offerPoints}>{points} pts</span>
        <button type="button" className={styles.redeemButton} disabled={!offer.active} onClick={() => onRedeem(offer)}>
          Redeem
        </button>
      </div>
    </article>
  );
}

export default function ResidentRewardsPage() {
  const { profile, user } = useAuth();
  const [availablePoints, setAvailablePoints] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [storeRewards, setStoreRewards] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [redeemName, setRedeemName] = useState("");
  const [redeemNic, setRedeemNic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setAvailablePoints(profile.points || 0);
    }
  }, [profile]);

  useEffect(() => {
    const q = query(collection(db, "rewards"), where("active", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((r: any) => (r.audiences || []).includes("residents"));
      setStoreRewards(data);
    });

    return () => unsubscribe();
  }, []);

  const handleRedeem = (offer: any) => {
    if (!offer.active) return;
    setSelectedOffer(offer);
    setRedeemName(profile?.fullName || "");
    setRedeemNic(profile?.nic || "");
    setModalOpen(true);
  };

  const confirmRedeem = async () => {
    if (!selectedOffer || !user) return;
    const offer = selectedOffer;
    const pointsRequired = offer.pointsRequired || offer.points;

    if (pointsRequired > availablePoints) {
      setMessage("Insufficient points to redeem this reward.");
      setIsError(true);
      setModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Deduct points from user
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        points: increment(-pointsRequired),
        updatedAt: serverTimestamp(),
      });

      // 2. Create redemption record
      await addDoc(collection(db, "redemptions"), {
        userId: user.uid,
        rewardId: offer.id || "manual",
        rewardName: offer.title,
        pointsSpent: pointsRequired,
        residentName: redeemName || profile?.fullName || "Anonymous",
        nic: redeemNic || profile?.nic || "-",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setMessage(`Successfully redeemed ${offer.title}!`);
      setIsError(false);
    } catch (error) {
      console.error("Redemption error:", error);
      setMessage("Failed to redeem reward. Please try again.");
      setIsError(true);
    } finally {
      setIsSubmitting(false);
      setModalOpen(false);
      setSelectedOffer(null);
    }
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
          {storeRewards.length > 0 ? (
            storeRewards.map((offer) => <OfferCard offer={offer} key={offer.id || offer.title} onRedeem={handleRedeem} />)
          ) : (
            <div className={styles.emptyState}>No rewards available at the moment.</div>
          )}
        </div>
      </section>

      {modalOpen && selectedOffer ? (
        <div className={styles.redeemModalBackdrop}>
          <div className={styles.redeemModal} role="dialog" aria-modal="true">
            <div className={styles.redeemModalHeader}>Confirm redemption</div>
            <div style={{ marginBottom: 8 }}>{selectedOffer.title} — {selectedOffer.pointsRequired || selectedOffer.points} pts</div>
            <div className={styles.redeemFormRow}>
              <label style={{ fontSize: 12, color: "#374151" }}>Full name</label>
              <input className={styles.redeemInput} value={redeemName} onChange={(e) => setRedeemName(e.target.value)} placeholder="Your full name" />
            </div>

            <div className={styles.redeemFormRow}>
              <label style={{ fontSize: 12, color: "#374151" }}>NIC</label>
              <input className={styles.redeemInput} value={redeemNic} onChange={(e) => setRedeemNic(e.target.value)} placeholder="National ID" />
            </div>

            <div className={styles.redeemActions}>
              <button className={styles.redeemButton} disabled={isSubmitting} onClick={() => { setModalOpen(false); setSelectedOffer(null); }}>Cancel</button>
              <button className={styles.redeemButton} disabled={isSubmitting} onClick={confirmRedeem}>
                {isSubmitting ? "Processing..." : "Confirm Redeem"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
