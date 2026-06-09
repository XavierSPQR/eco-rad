# Required Firestore Composite Indexes

To ensure the application functions correctly, the following composite indexes must be created in the Firebase Console.

## 1. Pickup Requests for Residents
**Collection**: `pickupRequests`
**Fields**:
- `userId`: `Ascending`
- `requestedDate`: `Descending`

**Direct Link**: [Create Index](https://console.firebase.google.com/v1/r/project/eco-friendly-rad/firestore/indexes?create_composite=Cldwcm9qZWN0cy9lY28tZnJpZW5kbHktcmFkL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9waWNrdXBSZXF1ZXN0cy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoRCg1yZXF1ZXN0ZWREYXRlEAIaDAoIX19uYW1lX18QAg)

## 2. Waste Collections for Residents
**Collection**: `wasteCollections`
**Fields**:
- `userId`: `Ascending`
- `collectedAt`: `Descending`

## 3. Pending Pickup Requests for Collectors
**Collection**: `pickupRequests`
**Fields**:
- `status`: `Ascending`
- `requestedDate`: `Ascending`

---
**Note**: If you encounter a "query requires an index" error in the browser console, it will usually provide a direct link to create the specific missing index.
