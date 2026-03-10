"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Dot } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type RecursiveListItem = {
  title: string;
  description: string;
  children: RecursiveListItem[];
};

export class RecursiveListNode implements RecursiveListItem {
  title: string;
  description: string;
  children: RecursiveListNode[];

  constructor(
    title: string,
    description: string,
    children: RecursiveListNode[] = [],
  ) {
    this.title = title;
    this.description = description;
    this.children = children;
  }

  addChild(child: RecursiveListNode) {
    this.children.push(child);
    return this;
  }
}

export function createRecursiveListItem(
  title: string,
  description: string,
  children: RecursiveListItem[] = [],
): RecursiveListItem {
  return { title, description, children };
}

type RecursiveListProps = {
  items: RecursiveListItem[];
  className?: string;
};

type RecursiveListNodeProps = {
  item: RecursiveListItem;
  itemKey: string;
};

function RecursiveListNodeItem({ item, itemKey }: RecursiveListNodeProps) {
  const hasChildren = item.children.length > 0;
  const [isOpen, setIsOpen] = useState(hasChildren);

  return (
    <li className="leading-7">
      <div className="flex  items-center gap-1">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-stone-400 transition-colors hover:bg-stone-700 hover:text-stone-100"
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.title}`}
            aria-expanded={isOpen}
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-stone-500">
            <Dot size={14} />
          </span>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer rounded-md text-md hover:bg-stone-600">
              {item.title}
            </span>
          </TooltipTrigger>
          {item.description.length > 0 && (
            <TooltipContent side="top" className="max-w-96 w-full">
              <p className="text-sm w-full">{item.description}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      {hasChildren && (
        <div
          className={cn(
            "grid overflow-hidden transition-all duration-300 ease-out",
            isOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0">
            <ul className="mt-1 list-none list-inside border-l-2 border-solid border-l-red-200 pl-2">
              {item.children.map((child, index) => (
                <RecursiveListNodeItem
                  key={`${itemKey}-${index}-${child.title}`}
                  item={child}
                  itemKey={`${itemKey}-${index}-${child.title}`}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}

export function RecursiveList({ items, className }: RecursiveListProps) {
  return (
    <TooltipProvider>
      <div className={className}>
        <ul className="space-y-1">
          {items.map((item, index) => (
            <RecursiveListNodeItem
              key={`0-${index}-${item.title}`}
              item={item}
              itemKey={`0-${index}-${item.title}`}
            />
          ))}
        </ul>
      </div>
    </TooltipProvider>
  );
}
