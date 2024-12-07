import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Store, StoreItem } from "@/components/store-list";

export const fetchStores = async (): Promise<Store[]> => {
  const querySnapshot = await getDocs(collection(db, "todo"));
  const storeMap = new Map<string, Store>();

  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    const storeName = data.storeName as string;

    if (storeMap.has(storeName)) {
      const store = storeMap.get(storeName)!;
      store.items.push({
        id: docSnapshot.id,
        text: data.itemName,
        completed: data.gotIt,
        documentId: docSnapshot.id,
      });
    } else {
      storeMap.set(storeName, {
        id: docSnapshot.id,
        name: storeName,
        items: [
          {
            id: docSnapshot.id,
            text: data.itemName,
            completed: data.gotIt,
            documentId: docSnapshot.id,
          },
        ],
        isCollapsed: false,
      });
    }
  });

  return Array.from(storeMap.values());
};

export const addItem = async (
  stores: Store[],
  storeId: string,
  itemText: string,
  setStores: React.Dispatch<React.SetStateAction<Store[]>>
) => {
  const store = stores.find((s) => s.id === storeId);
  if (!store) return;

  const docRef = await addDoc(collection(db, "todo"), {
    storeName: store.name,
    itemName: itemText,
    gotIt: false,
  });

  const newItem: StoreItem = {
    id: docRef.id,
    text: itemText,
    completed: false,
    documentId: docRef.id,
  };

  setStores((prev) =>
    prev.map((store) =>
      store.id === storeId
        ? { ...store, items: [...store.items, newItem] }
        : store
    )
  );
};

export const updateItem = async (
  stores: Store[],
  storeId: string,
  itemId: string,
  newText: string,
  setStores: React.Dispatch<React.SetStateAction<Store[]>>
) => {
  setStores((prev) =>
    prev.map((store) =>
      store.id === storeId
        ? {
            ...store,
            items: store.items.map((item) =>
              item.id === itemId ? { ...item, text: newText } : item
            ),
          }
        : store
    )
  );

  const item = stores
    .find((store) => store.id === storeId)
    ?.items.find((item) => item.id === itemId);

  if (item?.documentId) {
    await updateDoc(doc(db, "todo", item.documentId), { itemName: newText });
  }
};

export const toggleItem = async (
  stores: Store[],
  storeId: string,
  itemId: string,
  setStores: React.Dispatch<React.SetStateAction<Store[]>>
) => {
  setStores((prev) =>
    prev.map((store) =>
      store.id === storeId
        ? {
            ...store,
            items: store.items.map((item) =>
              item.id === itemId
                ? { ...item, completed: !item.completed }
                : item
            ),
          }
        : store
    )
  );

  const item = stores
    .find((store) => store.id === storeId)
    ?.items.find((item) => item.id === itemId);

  if (item?.documentId) {
    await updateDoc(doc(db, "todo", item.documentId), { gotIt: !item.completed });
  }
};

export const moveItem = async (
  stores: Store[],
  fromStoreId: string,
  toStoreId: string,
  itemId: string,
  setStores: React.Dispatch<React.SetStateAction<Store[]>>
) => {
  const fromStore = stores.find((store) => store.id === fromStoreId);
  const toStore = stores.find((store) => store.id === toStoreId);

  if (!fromStore || !toStore) return;

  const item = fromStore.items.find((i) => i.id === itemId);
  if (!item) return;

  await updateDoc(doc(db, "todo", item.documentId), { storeName: toStore.name });

  setStores((prev) =>
    prev.map((store) => {
      if (store.id === fromStoreId) {
        return { ...store, items: store.items.filter((i) => i.id !== itemId) };
      }

      if (store.id === toStoreId) {
        return { ...store, items: [...store.items, item] };
      }

      return store;
    })
  );
};

export const deleteItem = async (
  stores: Store[],
  storeId: string,
  itemId: string,
  setStores: React.Dispatch<React.SetStateAction<Store[]>>
) => {
  const store = stores.find((store) => store.id === storeId);
  if (!store) return;

  const item = store.items.find((item) => item.id === itemId);
  if (!item?.documentId) return;

  await deleteDoc(doc(db, "todo", item.documentId));
  setStores((prev) =>
    prev.map((store) =>
      store.id === storeId
        ? { ...store, items: store.items.filter((i) => i.id !== itemId) }
        : store
    )
  );
};

export const deleteStore = async (
  stores: Store[],
  storeId: string,
  setStores: React.Dispatch<React.SetStateAction<Store[]>>
) => {
  const store = stores.find((store) => store.id === storeId);
  if (!store) return;

  const deletePromises = store.items.map((item) =>
    deleteDoc(doc(db, "todo", item.documentId))
  );
  await Promise.all(deletePromises);

  setStores((prev) => prev.filter((store) => store.id !== storeId));
};
