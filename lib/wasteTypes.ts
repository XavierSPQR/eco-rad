import {
  collection,
  doc,
  getDocs,
  getDoc,
  type Firestore,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type WasteType = "Organic" | "E-waste" | "Recycle";

export const WASTE_TYPE_OPTIONS = ["Organic", "E-waste", "Recycle"] as const;

const LEGACY_WASTE_TYPE_MAP: Record<string, WasteType> = {
  plastic: "Organic",
  paper: "E-waste",
  glass: "Recycle",
  recyclable: "Recycle",
  "e-waste": "E-waste",
  "e waste": "E-waste",
};

const POINTS_RATE_BY_WASTE_TYPE: Record<WasteType, number> = {
  Organic: 0.5,
  "E-waste": 1,
  Recycle: 0.75,
};

export const WASTE_POINT_SETTINGS_DOC = "current";
export const WASTE_POINT_SETTINGS_COLLECTION = "wastePointSettings";

export type WastePointRateConfig = Record<WasteType, number>;

export const DEFAULT_WASTE_POINT_RATE_CONFIG: WastePointRateConfig = {
  Organic: POINTS_RATE_BY_WASTE_TYPE.Organic / 1000,
  "E-waste": POINTS_RATE_BY_WASTE_TYPE["E-waste"] / 1000,
  Recycle: POINTS_RATE_BY_WASTE_TYPE.Recycle / 1000,
};

export function normalizeWasteType(value: string | null | undefined): WasteType {
  const normalizedValue = (value || "").toString().trim().toLowerCase();

  if (normalizedValue in LEGACY_WASTE_TYPE_MAP) {
    return LEGACY_WASTE_TYPE_MAP[normalizedValue];
  }

  if (normalizedValue === "organic") return "Organic";
  if (normalizedValue === "e-waste" || normalizedValue === "e waste") return "E-waste";
  if (normalizedValue === "recycle" || normalizedValue === "recyclable") return "Recycle";
  return "Organic";
}

export function calculatePointsEarned(weight: number, wasteType: string | null | undefined): number {
  return calculatePointsEarnedWithRates(weight, wasteType, DEFAULT_WASTE_POINT_RATE_CONFIG);
}

export function calculatePointsEarnedWithRates(
  weight: number,
  wasteType: string | null | undefined,
  rates: WastePointRateConfig,
): number {
  const normalizedType = normalizeWasteType(wasteType);
  const parsedWeight = Number.isFinite(weight) ? weight : 0;
  return Number((parsedWeight * (rates[normalizedType] ?? DEFAULT_WASTE_POINT_RATE_CONFIG[normalizedType])).toFixed(4));
}

export function normalizeWastePointRateConfig(input: Record<string, unknown> | null | undefined): WastePointRateConfig {
  return {
    Organic: Number(input?.Organic ?? DEFAULT_WASTE_POINT_RATE_CONFIG.Organic),
    "E-waste": Number(input?.["E-waste"] ?? DEFAULT_WASTE_POINT_RATE_CONFIG["E-waste"]),
    Recycle: Number(input?.Recycle ?? DEFAULT_WASTE_POINT_RATE_CONFIG.Recycle),
  };
}

export async function getWastePointRateConfig(firestoreDb: Firestore = db): Promise<WastePointRateConfig> {
  const snapshot = await getDoc(doc(firestoreDb, WASTE_POINT_SETTINGS_COLLECTION, WASTE_POINT_SETTINGS_DOC));
  if (!snapshot.exists()) {
    return DEFAULT_WASTE_POINT_RATE_CONFIG;
  }

  return normalizeWastePointRateConfig(snapshot.data() as Record<string, unknown>);
}

export function watchWastePointRateConfig(
  firestoreDb: Firestore,
  onChange: (rates: WastePointRateConfig) => void,
  onError?: (error: unknown) => void,
) {
  return onSnapshot(
    doc(firestoreDb, WASTE_POINT_SETTINGS_COLLECTION, WASTE_POINT_SETTINGS_DOC),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(DEFAULT_WASTE_POINT_RATE_CONFIG);
        return;
      }

      onChange(normalizeWastePointRateConfig(snapshot.data() as Record<string, unknown>));
    },
    onError,
  );
}

export function formatCollectionDate(value: unknown): string {
  const dateValue = getCollectionDate(value);
  return Number.isNaN(dateValue.getTime()) ? "" : dateValue.toISOString().slice(0, 10);
}

export function getCollectionDate(value: unknown): Date {
  if (!value) return new Date();

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
      return new Date(`${trimmedValue}T00:00:00`);
    }
    const dateValue = new Date(trimmedValue);
    return Number.isNaN(dateValue.getTime()) ? new Date() : dateValue;
  }

  if (typeof value === "object" && "toDate" in value) {
    const timestamp = value as { toDate: () => Date };
    return timestamp.toDate();
  }

  return new Date();
}

export async function migrateLegacyWasteTypes(firestoreDb: Firestore = db) {
  const snapshot = await getDocs(collection(firestoreDb, "wasteCollections"));
  if (snapshot.empty) return 0;

  const rates = await getWastePointRateConfig(firestoreDb);
  const batch = writeBatch(firestoreDb);
  let changed = 0;

  snapshot.docs.forEach((documentSnapshot) => {
    const data = documentSnapshot.data() as Record<string, unknown>;
    const normalizedWasteType = normalizeWasteType(String(data.wasteType ?? ""));
    const updates: Record<string, unknown> = {
      wasteType: normalizedWasteType,
    };

    if (data.collectionDate == null && data.collectedAt != null) {
      updates.collectionDate = data.collectedAt;
    }

    if (data.residentID == null && typeof data.id === "string") {
      updates.residentID = data.id;
    }

    if (data.userId == null && typeof data.residentId === "string") {
      updates.userId = data.residentId;
    }

    if (data.pointsEarned == null && typeof data.weight === "number") {
      updates.pointsEarned = calculatePointsEarnedWithRates(data.weight, normalizedWasteType, rates);
    }

    if (data.wasteType !== normalizedWasteType || data.collectionDate == null && data.collectedAt != null || data.residentID == null && typeof data.id === "string") {
      batch.update(doc(firestoreDb, "wasteCollections", documentSnapshot.id), updates);
      changed += 1;
    }
  });

  if (changed > 0) {
    await batch.commit();
  }

  return changed;
}
