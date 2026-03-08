import React from "react";
import type { FabricObjectType } from "~/types/motion";
import { SHAPE_TOOLS } from "~/types/motion";
import {
  Square,
  Circle,
  Triangle,
  Type,
  Minus,
  Image,
  MousePointer2,
  Hand,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface ShapeToolsProps {
  activeTool: FabricObjectType | "select" | "hand" | null;
  onToolChange: (tool: FabricObjectType | "select" | "hand") => void;
  disabled?: boolean;
}

const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Square,
  Circle,
  Triangle,
  Type,
  Minus,
  Image,
  MousePointer2,
  Hand,
};

export const ShapeTools: React.FC<ShapeToolsProps> = ({
  activeTool,
  onToolChange,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-1 p-2 bg-muted/30 rounded-lg">
      {/* Selection tools */}
      <div className="flex flex-col gap-1 border-b border-border pb-2 mb-1">
        <ToolButton
          tool="select"
          icon={MousePointer2}
          label="Select"
          isActive={activeTool === "select"}
          onClick={() => onToolChange("select")}
          disabled={disabled}
        />
        <ToolButton
          tool="hand"
          icon={Hand}
          label="Pan"
          isActive={activeTool === "hand"}
          onClick={() => onToolChange("hand")}
          disabled={disabled}
        />
      </div>

      {/* Shape tools */}
      <div className="flex flex-col gap-1">
        <div className="text-[10px] text-muted-foreground px-2 py-1">Shapes</div>
        {SHAPE_TOOLS.map((tool) => {
          const IconComponent = TOOL_ICONS[tool.icon];
          return (
            <ToolButton
              key={tool.type}
              tool={tool.type}
              icon={IconComponent}
              label={tool.label}
              isActive={activeTool === tool.type}
              onClick={() => onToolChange(tool.type)}
              disabled={disabled}
            />
          );
        })}
      </div>

      {/* Import options */}
      <div className="flex flex-col gap-1 border-t border-border pt-2 mt-1">
        <div className="text-[10px] text-muted-foreground px-2 py-1">Import</div>
        <ToolButton
          tool="image"
          icon={Image}
          label="Image"
          isActive={activeTool === "image"}
          onClick={() => onToolChange("image")}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

interface ToolButtonProps {
  tool: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  icon: Icon,
  label,
  isActive,
  onClick,
  disabled,
}) => {
  return (
    <button
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors",
        "hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring",
        isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
      )}
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

export default ShapeTools;
