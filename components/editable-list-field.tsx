"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import {
  createRecursiveListItem,
  RecursiveList,
  type RecursiveListItem,
} from "@/components/recursive-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";

type EditableListFieldProps = {
  value: RecursiveListItem[];
  isEditing: boolean;
  onChange: (value: RecursiveListItem[]) => void;
  className?: string;
  placeholder?: string;
};

function normalizeItems(items: RecursiveListItem[]): RecursiveListItem[] {
  return items
    .map((item) => ({
      title: item.title,
      description: item.description,
      children: normalizeItems(item.children),
    }))
    .filter((item) => item.title.length > 0);
}

function updateItemAtPath(
  items: RecursiveListItem[],
  path: number[],
  updater: (item: RecursiveListItem) => RecursiveListItem,
): RecursiveListItem[] {
  if (path.length === 0) return items;

  const [head, ...rest] = path;
  return items.map((item, index) => {
    if (index !== head) return item;
    if (rest.length === 0) return updater(item);
    return {
      ...item,
      children: updateItemAtPath(item.children, rest, updater),
    };
  });
}

function removeItemAtPath(
  items: RecursiveListItem[],
  path: number[],
): RecursiveListItem[] {
  if (path.length === 0) return items;
  const [head, ...rest] = path;

  if (rest.length === 0) {
    return items.filter((_, index) => index !== head);
  }

  return items.map((item, index) =>
    index === head
      ? {
          ...item,
          children: removeItemAtPath(item.children, rest),
        }
      : item,
  );
}

export function EditableListField({
  value,
  isEditing,
  onChange,
  className,
  placeholder = "Add item...",
}: EditableListFieldProps) {
  const [items, setItems] = useState<RecursiveListItem[]>(() =>
    normalizeItems(value),
  );
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");

  useEffect(() => {
    setItems(normalizeItems(value));
  }, [value]);

  const commitItems = (nextItems: RecursiveListItem[]) => {
    const normalized = normalizeItems(nextItems);
    setItems(normalized);
    onChange(normalized);
  };

  const addRootItem = () => {
    const title = draftTitle.trim();
    if (!title) return;

    commitItems([
      ...items,
      createRecursiveListItem(title, draftDescription.trim(), []),
    ]);
    setDraftTitle("");
    setDraftDescription("");
  };

  const updateFieldAtPath = (
    path: number[],
    field: "title" | "description",
    fieldValue: string,
  ) => {
    const nextItems = updateItemAtPath(items, path, (item) => ({
      ...item,
      [field]: fieldValue,
    }));
    setItems(nextItems);
    onChange(normalizeItems(nextItems));
  };

  const addChildAtPath = (path: number[]) => {
    const nextItems = updateItemAtPath(items, path, (item) => ({
      ...item,
      children: [...item.children, createRecursiveListItem("New Item", "", [])],
    }));
    commitItems(nextItems);
  };

  const removeAtPath = (path: number[]) => {
    commitItems(removeItemAtPath(items, path));
  };

  const renderEditor = (
    item: RecursiveListItem,
    path: number[],
  ): React.ReactNode => {
    return (
      <div key={path.join("-")} className="space-y-2 rounded-md border p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={item.title}
            onChange={(event) =>
              updateFieldAtPath(path, "title", event.target.value)
            }
            placeholder="Title"
          />
          <Textarea
            value={item.description}
            onChange={(event) =>
              updateFieldAtPath(path, "description", event.target.value)
            }
            placeholder="Tooltip description"
          />
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Add child item"
              onClick={() => addChildAtPath(path)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove list item"
              onClick={() => removeAtPath(path)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {item.children.length > 0 && (
          <div className="ml-4 space-y-2 border-l pl-3">
            {item.children.map((child, childIndex) =>
              renderEditor(child, [...path, childIndex]),
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isEditing) {
    return <RecursiveList items={items} className={className} />;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        {items.map((item, index) => renderEditor(item, [index]))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addRootItem();
            }
          }}
          placeholder={placeholder}
        />
        <Input
          value={draftDescription}
          onChange={(event) => setDraftDescription(event.target.value)}
          placeholder="Tooltip description"
        />
        <Button type="button" onClick={addRootItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}
