import * as React from "react";

import { cn } from "@/lib/utils";

type SidebarProps = React.ComponentProps<"aside"> & {
  side?: "left" | "right";
};

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, side = "left", ...props }, ref) => (
    <aside
      ref={ref}
      data-side={side}
      data-slot="sidebar"
      className={cn(
        "bg-background text-foreground flex h-full w-full max-w-sm flex-col border",
        side === "right" ? "border-l" : "border-r",
        className,
      )}
      {...props}
    />
  ),
);
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sidebar-header"
    className={cn("border-b p-4", className)}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sidebar-content"
    className={cn("flex-1 overflow-auto p-4", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sidebar-footer"
    className={cn("border-t p-3", className)}
    {...props}
  />
));
SidebarFooter.displayName = "SidebarFooter";

export { Sidebar, SidebarContent, SidebarFooter, SidebarHeader };
