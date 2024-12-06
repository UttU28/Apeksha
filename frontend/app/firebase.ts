// firebase.ts
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBPV7KdEAERXSeoAq3gYBvoxejcb2_czLc",
  authDomain: "apeksha-685d2.firebaseapp.com",
  projectId: "apeksha-685d2",
  storageBucket: "apeksha-685d2.appspot.com",
  messagingSenderId: "573178281343",
  appId: "1:573178281343:web:43e90b59babc60f5846e4a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestore utility functions
export const addItemToStore = async (
  storeId: string,
  itemName: string
): Promise<void> => {
  const storeDocRef = doc(db, "todo", storeId);
  const storeDoc = await getDoc(storeDocRef);

  if (!storeDoc.exists()) {
    await setDoc(storeDocRef, {
      [storeId]: [],
    });
  }

  await updateDoc(storeDocRef, {
    [storeId]: arrayUnion({ gotIt: false, gotWhat: itemName }),
  });
};

export const updateItemInStore = async (
  storeId: string,
  itemName: string,
  gotIt: boolean
): Promise<void> => {
  const storeDocRef = doc(db, "todo", storeId);
  const storeDoc = await getDoc(storeDocRef);

  if (storeDoc.exists()) {
    const items = storeDoc.data()[storeId] || [];
    const updatedItems = items.map((item: any) =>
      item.gotWhat === itemName ? { ...item, gotIt } : item
    );
    await updateDoc(storeDocRef, {
      [storeId]: updatedItems,
    });
  }
};

export const moveItemBetweenStores = async (
  fromStoreId: string,
  toStoreId: string,
  itemName: string
): Promise<void> => {
  const fromStoreRef = doc(db, "todo", fromStoreId);
  const toStoreRef = doc(db, "todo", toStoreId);

  const fromStoreDoc = await getDoc(fromStoreRef);
  const toStoreDoc = await getDoc(toStoreRef);

  if (fromStoreDoc.exists() && toStoreDoc.exists()) {
    const fromItems = fromStoreDoc.data()[fromStoreId] || [];
    const itemToMove = fromItems.find((item: any) => item.gotWhat === itemName);

    if (itemToMove) {
      const updatedFromItems = fromItems.filter(
        (item: any) => item.gotWhat !== itemName
      );

      await updateDoc(fromStoreRef, {
        [fromStoreId]: updatedFromItems,
      });

      await updateDoc(toStoreRef, {
        [toStoreId]: arrayUnion(itemToMove),
      });
    }
  }
};
