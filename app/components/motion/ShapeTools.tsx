import React from "react";
import type { FabricObject } from "~/types/motion";
import { Button } from "~/components/ui/button";
import { Square, Circle, Triangle, Type, Minus } from "lucide-react";
import { cn } from "~/lib/utils";

interface ShapeToolsProps {
  onAddShape: (type: FabricObject["type"]) => void;
  selectedTool?: string;
  className?: string;
}

const tools = [
  { id: "select", label: "Select", icon: null },
  { id: "rect", label: "Rectangle", icon: Square },
  { id: "circle", label: "Circle", icon: Circle },
  { id: "triangle", label: "Triangle", icon: Triangle },
  { id: "text", label: "Text", icon: Type },
  { id: "line", label: "Line", icon: Minus },
];

export function ShapeTools({
  onAddShape,
  selectedTool,
  className,
}: ShapeToolsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-background border border-border",
        className
      )}
    >
      {tools.map(tool => {
        const Icon = tool.icon;
        return (
          <Button
            key={tool.id}
            variant={selectedTool === tool.id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onAddShape(tool.id as FabricObject["type"])}
            className="h-8 w-8 p-0"
            title={tool.label}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {!Icon && <span className="text-xs">S</span>}
          </Button>
        );
      })}
    </div>
  );
}
