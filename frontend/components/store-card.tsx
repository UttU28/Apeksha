"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2, MoveRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StoreItem, Store } from "./store-list";

interface StoreCardProps {
  store: Store;
  allStores: Store[];
  onAddItem: (storeId: string, itemText: string) => void;
  onUpdateItem: (storeId: string, itemId: string, newText: string) => void;
  onToggleItem: (storeId: string, itemId: string) => void;
  onToggleCollapse: (storeId: string) => void;
  onDeleteRequest: (storeId: string, itemId?: string) => void;
  onMoveItem: (fromStoreId: string, toStoreId: string, itemId: string) => void;
}

export default function StoreCard({
  store,
  allStores,
  onAddItem,
  onUpdateItem,
  onToggleItem,
  onToggleCollapse,
  onDeleteRequest,
  onMoveItem,
}: StoreCardProps) {
  const [newItem, setNewItem] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    if (editingItem) {
      onUpdateItem(store.id, editingItem, newItem);
      setEditingItem(null);
    } else {
      onAddItem(store.id, newItem);
    }
    setNewItem("");
  };

  const handleEdit = (item: StoreItem) => {
    setEditingItem(item.id);
    setNewItem(item.text);
  };

  const handleMoveItem = (itemId: string, toStoreId: string) => {
    if (toStoreId !== store.id) {
      onMoveItem(store.id, toStoreId, itemId);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onToggleCollapse(store.id)}
            className="flex items-center gap-2 text-lg font-semibold hover:text-primary transition-colors"
          >
            {store.isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
            {store.name}
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteRequest(store.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {!store.isCollapsed && (
          <>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add item..."
                className="flex-1"
              />
              <Button type="submit">
                {editingItem ? "Update" : <Plus className="h-4 w-4" />}
              </Button>
            </form>

            <div className="space-y-2">
              {store.items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50"
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => onToggleItem(store.id, item.id)}
                  />
                  <div className="flex-1">
                    <p className={item.completed ? "text-muted-foreground line-through" : ""}>
                      {item.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select onValueChange={(value) => handleMoveItem(item.id, value)}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Move to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allStores
                          .filter(s => s.id !== store.id)
                          .map(s => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteRequest(store.id, item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}