# Proposed Firebase Firestore Schema for Resident Features

Based on the analysis of the `app/resident` directory, the following Firestore collection structures are proposed to transition from mock data to a persistent backend.

## 1. `users` (Collection)
*Core profile information and reward balance.*
- **Document ID**: `uid` (Matches Firebase Auth UID)
- **Fields**:
    - `uid`: `string`
    - `fullName`: `string`
    - `email`: `string`
    - `phone`: `string`
    - `district`: `string`
    - `address`: `string`
    - `nic`: `string` (**Private**: Access restricted to Admin and Owner)
    - `role`: `"resident" | "collector" | "admin"`
    - `points`: `number` (Current available points)
    - `residences`: `number` (Number of registered properties)
    - `badgeLevel`: `string` (e.g., "Green Champion")
    - `badgeProgress`: `number` (Percentage, 0-100)
    - `createdAt`: `timestamp`
    - `updatedAt`: `timestamp`

## 2. `complaints` (Collection)
*Resident-submitted issues and their resolution status.*
- **Fields**:
    - `id`: `string` (Auto-generated)
    - `userId`: `string` (Reference to `users.uid`)
    - `userName`: `string` (Denormalized for performance)
    - `subject`: `string`
    - `description`: `string`
    - `status`: `"In review" | "Resolved"`
    - `priority`: `"Low" | "Medium" | "High"` (Assigned by Admin)
    - `location`: `string` (Coordinates or address string)
    - `photoUrl`: `string` (Optional, reference to Firebase Storage)
    - `createdAt`: `timestamp`
    - `updatedAt`: `timestamp`

## 3. `pickupRequests` (Collection)
*Special pickup requests made by residents.*
- **Fields**:
    - `id`: `string`
    - `userId`: `string` (Reference to `users.uid`)
    - `description`: `string`
    - `location`: `string`
    - `status`: `"pending" | "scheduled" | "completed" | "cancelled"`
    - `requestedDate`: `timestamp`
    - `createdAt`: `timestamp`

## 4. `wasteCollections` (Collection)
*Records of verified waste pickups. Drives the dashboard charts and points.*
- **Fields**:
    - `id`: `string`
    - `userId`: `string` (Reference to `users.uid`)
    - `wasteType`: `"Organic" | "Recyclable" | "E-Waste"`
    - `weight`: `number` (in kg)
    - `pointsEarned`: `number`
    - `collectedAt`: `timestamp`
    - `collectorId`: `string` (Reference to the collector)

## 5. `notifications` (Collection)
*Resident-specific alerts.*
- **Fields**:
    - `id`: `string`
    - `userId`: `string` (Reference to `users.uid`)
    - `type`: `"truck" | "verified" | "reward" | "resolved"`
    - `title`: `string`
    - `description`: `string`
    - `read`: `boolean`
    - `createdAt`: `timestamp`

## 6. `rewards` (Collection)
*Global catalog of rewards available in the store.*
- **Fields**:
    - `id`: `string`
    - `category`: `string` (e.g., "Shopping", "Utilities")
    - `title`: `string`
    - `description`: `string`
    - `pointsRequired`: `number`
    - `image`: `string` (Optional)
    - `active`: `boolean`
    - `audiences`: `string[]` (e.g., `["residents"]`)
    - `discountBadge`: `string` (Optional, e.g., "50% OFF")

## 7. `redemptions` (Collection)
*History of rewards claimed by residents.*
- **Fields**:
    - `id`: `string`
    - `userId`: `string` (Reference to `users.uid`)
    - `rewardId`: `string` (Reference to `rewards.id`)
    - `rewardName`: `string`
    - `pointsSpent`: `number`
    - `residentName`: `string`
    - `nic`: `string` (**Private**: Access restricted to Admin only)
    - `status`: `"pending" | "completed"`
    - `createdAt`: `timestamp`

---

## Security & Privacy Note
- **Field-Level Security**: Access to `nic` fields in `users` and `redemptions` must be locked behind Firestore Security Rules, allowing only the user themselves or users with the `admin` role to read them.
- **Top-Level Querying**: All collections are top-level to facilitate administrative cross-user reporting and dashboard aggregations. Resident-facing queries must always filter by `userId`.
