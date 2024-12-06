"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StoreCard from "@/components/store-card";
import { Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface Store {
  id: string;
  name: string;
  items: StoreItem[];
  isCollapsed: boolean;
}

export interface StoreItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function StoreList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [storeName, setStoreName] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    storeId: string;
    itemId: string | null;
  }>({
    isOpen: false,
    storeId: "",
    itemId: null,
  });

  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    const newStore: Store = {
      id: Date.now().toString(),
      name: storeName,
      items: [],
      isCollapsed: false,
    };

    setStores(prev => [...prev, newStore]);
    setStoreName("");
  };

  const handleAddItem = (storeId: string, itemText: string) => {
    setStores(prev => prev.map(store => {
      if (store.id === storeId) {
        return {
          ...store,
          items: [...store.items, {
            id: Date.now().toString(),
            text: itemText,
            completed: false,
          }],
        };
      }
      return store;
    }));
  };

  const handleUpdateItem = (storeId: string, itemId: string, newText: string) => {
    setStores(prev => prev.map(store => {
      if (store.id === storeId) {
        return {
          ...store,
          items: store.items.map(item => 
            item.id === itemId ? { ...item, text: newText } : item
          ),
        };
      }
      return store;
    }));
  };

  const handleToggleItem = (storeId: string, itemId: string) => {
    setStores(prev => prev.map(store => {
      if (store.id === storeId) {
        return {
          ...store,
          items: store.items.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        };
      }
      return store;
    }));
  };

  const handleToggleCollapse = (storeId: string) => {
    setStores(prev => prev.map(store => 
      store.id === storeId ? { ...store, isCollapsed: !store.isCollapsed } : store
    ));
  };

  const handleDeleteConfirm = () => {
    const { storeId, itemId } = deleteDialog;
    
    if (itemId) {
      // Delete item
      setStores(prev => prev.map(store => {
        if (store.id === storeId) {
          return {
            ...store,
            items: store.items.filter(item => item.id !== itemId),
          };
        }
        return store;
      }));
    } else {
      // Delete store
      setStores(prev => prev.filter(store => store.id !== storeId));
    }
    
    setDeleteDialog({ isOpen: false, storeId: "", itemId: null });
  };

  const handleDeleteRequest = (storeId: string, itemId?: string) => {
    setDeleteDialog({
      isOpen: true,
      storeId,
      itemId: itemId || null,
    });
  };

  const handleMoveItem = (fromStoreId: string, toStoreId: string, itemId: string) => {
    setStores(prev => {
      const fromStore = prev.find(s => s.id === fromStoreId);
      if (!fromStore) return prev;

      const item = fromStore.items.find(i => i.id === itemId);
      if (!item) return prev;

      return prev.map(store => {
        if (store.id === fromStoreId) {
          return {
            ...store,
            items: store.items.filter(i => i.id !== itemId),
          };
        }
        if (store.id === toStoreId) {
          return {
            ...store,
            items: [...store.items, item],
          };
        }
        return store;
      });
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <form onSubmit={handleAddStore} className="flex gap-4">
          <Input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Enter store name..."
            className="flex-1"
          />
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" />
            Add Store
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        {stores.map(store => (
          <StoreCard
            key={store.id}
            store={store}
            allStores={stores}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onToggleItem={handleToggleItem}
            onToggleCollapse={handleToggleCollapse}
            onDeleteRequest={handleDeleteRequest}
            onMoveItem={handleMoveItem}
          />
        ))}
      </div>

      <AlertDialog 
        open={deleteDialog.isOpen} 
        onOpenChange={(isOpen) => 
          setDeleteDialog(prev => ({ ...prev, isOpen }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              {deleteDialog.itemId ? ' item' : ' store and all its items'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}