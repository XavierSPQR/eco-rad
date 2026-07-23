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
  getDocs,
  writeBatch,
  runTransaction,
  getDoc,
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
  const isOutOfStock = typeof offer.quantity === 'number' && offer.quantity <= 0;

  return (
    <article className={`${styles.offerCard} ${offer.active && !isOutOfStock ? "" : styles.offerCardDisabled}`}>
      <div className={styles.offerMeta}>
        <span>{offer.category}</span>
      </div>
      <h3 className={styles.offerTitle}>{offer.title}</h3>
      <p className={styles.offerDescription}>{offer.description}</p>
      <div className={styles.offerFooter}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className={styles.offerPoints}>{points} pts</span>
          {typeof offer.quantity === 'number' && (
            <span className={isOutOfStock ? styles.outOfStockLabel : styles.quantityLabel} style={{ width: 'fit-content' }}>
              {isOutOfStock ? "Out of Stock" : `${offer.quantity} available`}
            </span>
          )}
        </div>
        <button
          type="button"
          className={styles.redeemButton}
          disabled={!offer.active || isOutOfStock}
          onClick={() => onRedeem(offer)}
        >
          {isOutOfStock ? "Out of Stock" : "Redeem"}
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
  const [totalEarnedPoints, setTotalEarnedPoints] = useState(0);
  const [totalSpentPoints, setTotalSpentPoints] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [redeemName, setRedeemName] = useState("");
  const [redeemNic, setRedeemNic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute available points = total earned - total spent
  useEffect(() => {
    const earned = wasteCollections.reduce((acc, curr) => acc + (curr.pointsEarned || 0), 0);
    setTotalEarnedPoints(earned);
    setAvailablePoints(Math.max(0, earned - totalSpentPoints));
  }, [wasteCollections, totalSpentPoints]);

  useEffect(() => {
    if (profile) {
      // Fallback: if no wasteCollections data, use profile.points
      if (totalEarnedPoints === 0 && profile.points) {
        setAvailablePoints(Math.max(0, (profile.points || 0) - totalSpentPoints));
      }
    }
  }, [profile, totalEarnedPoints, totalSpentPoints]);

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

  // Fetch user redemptions to track spent points
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "redemptions"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const spent = snapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        return acc + (data.pointsSpent || 0);
      }, 0);
      setTotalSpentPoints(spent);
    });
    return () => unsubscribe();
  }, [user]);

  const stats = {
    points: totalEarnedPoints || profile?.points || 0,
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
    const offerId = selectedOffer.id;
    if (!offerId) return;

    setIsSubmitting(true);

    const pointsRequired = selectedOffer.pointsRequired || selectedOffer.points || 0;

    // Validate using client-side computed available points
    if (availablePoints < pointsRequired) {
      setMessage("Insufficient points to redeem this reward.");
      setIsError(true);
      setIsSubmitting(false);
      setModalOpen(false);
      setSelectedOffer(null);
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        // 1. Get latest data
        const userRef = doc(db, "users", user.uid);
        const rewardRef = doc(db, "rewards", offerId);

        const userSnap = await transaction.get(userRef);
        const rewardSnap = await transaction.get(rewardRef);

        if (!userSnap.exists()) throw new Error("User does not exist");
        if (!rewardSnap.exists()) throw new Error("Reward does not exist");

        const rewardData = rewardSnap.data();
        const currentQuantity = rewardData.quantity;

        // 2. Validate stock
        if (typeof currentQuantity === 'number' && currentQuantity <= 0) {
          throw new Error("Reward is out of stock");
        }

        // 3. Update reward quantity if applicable
        if (typeof currentQuantity === 'number') {
          transaction.update(rewardRef, {
            quantity: increment(-1),
            updatedAt: serverTimestamp(),
          });
        }

        // 4. Create redemption record
        const redemptionRef = doc(collection(db, "redemptions"));
        transaction.set(redemptionRef, {
          userId: user.uid,
          rewardId: offerId,
          rewardName: rewardData.title,
          pointsSpent: pointsRequired,
          residentName: redeemName || profile?.fullName || "Anonymous",
          nic: redeemNic || profile?.nic || "-",
          status: "pending",
          createdAt: serverTimestamp(),
        });
      });

      // 4. Notify all admins (outside transaction for efficiency/simplicity, as it's not critical for consistency)
      const adminsQuery = query(collection(db, "users"), where("role", "==", "admin"));
      const adminsSnap = await getDocs(adminsQuery);
      const batch = writeBatch(db);
      adminsSnap.docs.forEach((adminDoc) => {
        const notifRef = doc(collection(db, "notifications"));
        batch.set(notifRef, {
          userId: adminDoc.id,
          title: "Reward Redemption",
          description: `${redeemName || profile?.fullName || "User"} ${redeemNic || profile?.nic || ""} redeemed ${selectedOffer.title}`,
          type: "reward",
          read: false,
          createdAt: serverTimestamp(),
        });
      });
      await batch.commit();

      setMessage(`Successfully redeemed ${selectedOffer.title}!`);
      setIsError(false);
    } catch (error: any) {
      console.error("Redemption error:", error);
      if (error.message === "Insufficient points") {
        setMessage("Insufficient points to redeem this reward.");
      } else if (error.message === "Reward is out of stock") {
        setMessage("This reward is currently out of stock.");
      } else {
        setMessage("Failed to redeem reward. Please try again.");
      }
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
            <strong>{parseFloat(availablePoints.toFixed(2))} pts</strong>
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
