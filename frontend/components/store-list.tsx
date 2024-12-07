'use client'

import { useState, useEffect } from 'react'
import {
  fetchStores,
  addItem,
  updateItem,
  toggleItem,
  moveItem,
  deleteItem,
  deleteStore,
} from '@/lib/storeHandlers'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import StoreCard from '@/components/store-card'
import { Plus } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface Store {
  id: string
  name: string
  items: StoreItem[]
  isCollapsed: boolean
}

export interface StoreItem {
  id: string
  text: string
  completed: boolean
  documentId: string
}

export default function StoreList() {
  const [stores, setStores] = useState<Store[]>([])
  const [storeName, setStoreName] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    storeId: string
  }>({
    isOpen: false,
    storeId: '',
  })

  useEffect(() => {
    fetchStores().then(setStores)
  }, [])

  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeName.trim()) return

    const newStore: Store = {
      id: `${Date.now()}`,
      name: storeName,
      items: [],
      isCollapsed: false,
    }

    setStores((prev) => [...prev, newStore])
    setStoreName('')
  }

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
        {stores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            allStores={stores}
            onAddItem={(storeId, itemText) =>
              addItem(stores, storeId, itemText, setStores)
            }
            onUpdateItem={(storeId, itemId, newText) =>
              updateItem(stores, storeId, itemId, newText, setStores)
            }
            onToggleItem={(storeId, itemId) =>
              toggleItem(stores, storeId, itemId, setStores)
            }
            onToggleCollapse={(id) =>
              setStores((prev) =>
                prev.map((store) =>
                  store.id === id
                    ? { ...store, isCollapsed: !store.isCollapsed }
                    : store,
                ),
              )
            }
            onDeleteItem={(storeId, itemId) =>
              deleteItem(stores, storeId, itemId, setStores)
            }
            onMoveItem={(fromStoreId, toStoreId, itemId) =>
              moveItem(stores, fromStoreId, toStoreId, itemId, setStores)
            }
            onDeleteStoreRequest={(id) =>
              setDeleteDialog({ isOpen: true, storeId: id })
            }
          />
        ))}
      </div>

      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteDialog((prev) => ({ ...prev, isOpen }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the store and all its items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteStore(stores, deleteDialog.storeId, setStores)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
