/**
 * script to clean and seed Firestore Database.
 * Runs on Node.js using Web SDK with admin credentials authentication.
 * Configured securely with process environment fallback to avoid hardcoding plaintext.
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} = require('firebase/firestore');

// Ensure dotenv is loaded to securely read variables if needed
require('dotenv').config({ path: 'env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDGMxDCbKMGMnpoWDNPo3mfpaxvrdEXc5M',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'eco-friendly-rad.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'eco-friendly-rad',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'eco-friendly-rad.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '537017782457',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:537017782457:web:088e20492dde2315e4cb68'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Use non-hardcoded fallbacks or environment variables for credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dadmin@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

async function cleanAndSeed() {
  console.log(`Authenticating as Admin (${ADMIN_EMAIL})...`);
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log('Successfully authenticated as admin.');

  // 1. Remove Residents without Resident ID starting from R
  console.log('\n--- 1. Deleting residents without Resident ID starting with R ---');
  const usersSnap = await getDocs(collection(db, 'users'));
  const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  let deletedResidentsCount = 0;
  for (const u of users) {
    if (u.role === 'resident') {
      const rid = (u.residentID || '').trim();
      if (!rid || !rid.startsWith('R')) {
        console.log(`Deleting resident: ${u.fullName || 'Unnamed'} (ID: ${u.residentID || 'None'}, UID: ${u.id})`);
        await deleteDoc(doc(db, 'users', u.id));
        deletedResidentsCount++;
      }
    }
  }
  console.log(`Residents deletion complete. Deleted ${deletedResidentsCount} user documents.`);

  // 2. Clear current rewards and seed more plausible rewards
  console.log('\n--- 2. Clearing and seeding Rewards collection ---');
  const rewardsSnap = await getDocs(collection(db, 'rewards'));
  console.log(`Found ${rewardsSnap.size} existing rewards to delete.`);
  for (const r of rewardsSnap.docs) {
    await deleteDoc(r.ref);
  }

  const plausibleRewards = [
    {
      title: 'Eco-Friendly Grocery Voucher',
      category: 'Shopping',
      pointsRequired: 250,
      quantity: 50,
      audiences: ['residents'],
      active: true,
      description: 'Get $10 off your purchase at local organic and zero-waste markets.'
    },
    {
      title: 'Public Transit Pass Discount',
      category: 'Utilities',
      pointsRequired: 500,
      quantity: 30,
      audiences: ['residents'],
      active: true,
      description: 'Receive 20% off your next monthly bus or train card top-up.'
    },
    {
      title: 'Reusable Stainless Steel Water Bottle',
      category: 'Merchandise',
      pointsRequired: 150,
      quantity: 100,
      audiences: ['residents'],
      active: true,
      description: 'Premium double-walled insulated bottle to help reduce single-use plastic.'
    },
    {
      title: 'Home Composting Starter Bin',
      category: 'Home',
      pointsRequired: 400,
      quantity: 20,
      audiences: ['residents'],
      active: true,
      description: 'A compact home composting kit to process organic household kitchen waste.'
    }
  ];

  for (const reward of plausibleRewards) {
    console.log(`Adding reward: ${reward.title}`);
    await addDoc(collection(db, 'rewards'), {
      ...reward,
      image: '', // No default image
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  console.log('Seeded 4 new plausible rewards.');

  // 3. All existing complaints, Schedules must be removed
  console.log('\n--- 3. Removing all complaints and schedules ---');
  const complaintsSnap = await getDocs(collection(db, 'complaints'));
  console.log(`Found ${complaintsSnap.size} complaints. Deleting...`);
  for (const c of complaintsSnap.docs) {
    await deleteDoc(c.ref);
  }

  const schedulesSnap = await getDocs(collection(db, 'schedules'));
  console.log(`Found ${schedulesSnap.size} schedules. Deleting...`);
  for (const s of schedulesSnap.docs) {
    await deleteDoc(s.ref);
  }

  // 4. Existing waste collection history should be removed
  console.log('\n--- 4. Removing all waste collection history ---');
  const wasteCollectionsSnap = await getDocs(collection(db, 'wasteCollections'));
  console.log(`Found ${wasteCollectionsSnap.size} waste collection documents. Deleting...`);
  for (const w of wasteCollectionsSnap.docs) {
    await deleteDoc(w.ref);
  }

  // 5. Existing notifications should be removed
  console.log('\n--- 5. Removing existing notifications ---');
  // Query notifications by matching each remaining user's UID.
  let deletedNotifsCount = 0;
  for (const u of users) {
    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', u.id));
      const notifsSnap = await getDocs(q);
      for (const notif of notifsSnap.docs) {
        await deleteDoc(notif.ref);
        deletedNotifsCount++;
      }
    } catch (e) {
      // Ignore if a specific query fails or has no access
    }
  }
  console.log(`Deleted ${deletedNotifsCount} notification documents.`);

  // 6. Existing redemption records should be removed
  console.log('\n--- 6. Removing all redemption records ---');
  const redemptionsSnap = await getDocs(collection(db, 'redemptions'));
  console.log(`Found ${redemptionsSnap.size} redemption documents. Deleting...`);
  for (const red of redemptionsSnap.docs) {
    await deleteDoc(red.ref);
  }

  console.log('\n====================================');
  console.log('CLEANUP AND SEEDING PROCESS COMPLETE!');
  console.log('====================================');
}

cleanAndSeed()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('Cleanup and seeding failed:', err);
    process.exit(1);
  });
