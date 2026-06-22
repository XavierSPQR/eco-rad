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
  orderBy,
  serverTimestamp,
  increment,
} from "firebase/firestore";

type BadgeLevel = {
  target: number;
  note: string;
};

type Badge = {
  id: string;
  title: string;
  type: "points" | "pickups" | "weight" | "plastic";
  variant: string;
  levels: BadgeLevel[];
};

function BadgeCard({ badge, progressInfo }: { badge: Badge; progressInfo: any }) {
  const { subtitle, note, isMaxLevel } = progressInfo;
  return (
    <article className={`${styles.badgeCard} ${styles[`badgeCard_${badge.variant}`]}`}>
      <div className={styles.badgeMeta}>{subtitle}</div>
      <h3 className={styles.badgeTitle}>{badge.title}</h3>
      <p className={styles.badgeNote}>{note}</p>
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
  const { profile, user, loading } = useAuth();
  const [availablePoints, setAvailablePoints] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [storeRewards, setStoreRewards] = useState<any[]>([]);
  const [dbBadges, setDbBadges] = useState<Badge[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [wasteCollections, setWasteCollections] = useState<any[]>([]);
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

  // Fetch badges
  useEffect(() => {
    const q = query(collection(db, "badges"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Badge));
      setDbBadges(data);
      setLoadingBadges(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user waste collections
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "wasteCollections"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setWasteCollections(data);
    });
    return () => unsubscribe();
  }, [user]);

  const stats = {
    points: profile?.points || 0,
    pickups: wasteCollections.length,
    weight: wasteCollections.reduce((acc, curr) => acc + (curr.weight || 0), 0),
    plastic: wasteCollections
      .filter((w) => w.wasteType === "Recyclable")
      .reduce((acc, curr) => acc + (curr.weight || 0) * 0.476, 0),
  };

  const getBadgeProgress = (badge: Badge) => {
    const userValue = stats[badge.type as keyof typeof stats] || 0;
    const levels = badge.levels || [];

    // Find current level (highest achieved)
    let currentLevelIndex = -1;
    for (let i = 0; i < levels.length; i++) {
      if (userValue >= levels[i].target) {
        currentLevelIndex = i;
      } else {
        break;
      }
    }

    const nextLevelIndex = currentLevelIndex + 1;
    const isMaxLevel = nextLevelIndex >= levels.length;

    if (isMaxLevel) {
      return {
        subtitle: "Earned",
        note: "Max Level Reached",
        isMaxLevel: true,
      };
    }

    const nextLevel = levels[nextLevelIndex];
    const prevTarget = currentLevelIndex === -1 ? 0 : levels[currentLevelIndex].target;
    const progress = ((userValue - prevTarget) / (nextLevel.target - prevTarget)) * 100;
    const clampedProgress = Math.min(Math.max(Math.round(progress), 0), 99);

    return {
      subtitle: `${clampedProgress}% complete`,
      note: nextLevel.note,
      isMaxLevel: false,
      progress: clampedProgress,
    };
  };

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

      // 3. Notify all admins
      const adminsQuery = query(collection(db, "users"), where("role", "==", "admin"));
      const adminsSnap = await getDocs(adminsQuery);
      const batch = writeBatch(db);
      adminsSnap.docs.forEach((adminDoc) => {
        const notifRef = doc(collection(db, "notifications"));
        batch.set(notifRef, {
          userId: adminDoc.id,
          title: "Reward Redemption",
          description: `${redeemName || profile?.fullName || "User"} ${redeemNic || profile?.nic || ""} redeemed ${offer.title}`,
          type: "reward",
          read: false,
          createdAt: serverTimestamp(),
        });
      });
      await batch.commit();

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
          {dbBadges.map((badge) => (
            <BadgeCard
              badge={badge}
              key={badge.id}
              progressInfo={getBadgeProgress(badge)}
            />
          ))}
          {!loadingBadges && dbBadges.length === 0 && (
             <div className={styles.emptyState} style={{ background: 'transparent', border: '1px dashed rgba(255,255,255,0.3)', color: '#fff' }}>
               No badges available.
             </div>
          )}
          {loadingBadges && (
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Loading badges...</div>
          )}
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
