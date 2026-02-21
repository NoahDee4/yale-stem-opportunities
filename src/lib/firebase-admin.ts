import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import path from "path";

if (getApps().length === 0) {
  const serviceAccountPath = path.resolve(
    process.cwd(),
    "serviceAccountKey.json"
  );

  initializeApp({
    credential: cert(serviceAccountPath),
  });
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
