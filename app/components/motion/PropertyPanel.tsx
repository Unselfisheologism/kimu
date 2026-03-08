import React from "react";
import type { FabricObject, EasingType } from "~/types/motion";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";

interface PropertyPanelProps {
  object: FabricObject | null;
  onUpdate: (updates: Partial<FabricObject>) => void;
  disabled?: boolean;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  object,
  onUpdate,
  disabled = false,
}) => {
  if (!object) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Select an object to edit its properties
      </div>
    );
  }

  const handleNumberChange = (
    field: keyof FabricObject,
    value: string,
    min?: number,
    max?: number
  ) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    let clamped = num;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    onUpdate({ [field]: clamped });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Transform
      </div>

      {/* Position */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">X</Label>
          <Input
            type="number"
            value={Math.round(object.left)}
            onChange={(e) => handleNumberChange("left", e.target.value, 0)}
            className="h-8 text-xs"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Y</Label>
          <Input
            type="number"
            value={Math.round(object.top)}
            onChange={(e) => handleNumberChange("top", e.target.value, 0)}
            className="h-8 text-xs"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Size */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Width</Label>
          <Input
            type="number"
            value={Math.round(object.width || 0)}
            onChange={(e) => handleNumberChange("width", e.target.value, 0)}
            className="h-8 text-xs"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Height</Label>
          <Input
            type="number"
            value={Math.round(object.height || 0)}
            onChange={(e) => handleNumberChange("height", e.target.value, 0)}
            className="h-8 text-xs"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Scale */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Scale X</Label>
          <Input
            type="number"
            step={0.1}
            value={(object.scaleX ?? 1).toFixed(2)}
            onChange={(e) => handleNumberChange("scaleX", e.target.value, 0.01, 10)}
            className="h-8 text-xs"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Scale Y</Label>
          <Input
            type="number"
            step={0.1}
            value={(object.scaleY ?? 1).toFixed(2)}
            onChange={(e) => handleNumberChange("scaleY", e.target.value, 0.01, 10)}
            className="h-8 text-xs"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Rotation</Label>
          <span className="text-xs text-muted-foreground">{Math.round(object.rotation || 0)}°</span>
        </div>
        <Slider
          value={[object.rotation || 0]}
          min={0}
          max={360}
          step={1}
          onValueChange={([v]) => onUpdate({ rotation: v })}
          disabled={disabled}
        />
      </div>

      {/* Opacity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Opacity</Label>
          <span className="text-xs text-muted-foreground">
            {Math.round((object.opacity ?? 1) * 100)}%
          </span>
        </div>
        <Slider
          value={[(object.opacity ?? 1) * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={([v]) => onUpdate({ opacity: v / 100 })}
          disabled={disabled}
        />
      </div>

      {/* Appearance */}
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2 border-t border-border">
        Appearance
      </div>

      {/* Fill Color */}
      <div className="space-y-1">
        <Label className="text-xs">Fill</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={object.fill || "#3b82f6"}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer"
            disabled={disabled}
          />
          <Input
            value={object.fill || "#3b82f6"}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="h-8 text-xs flex-1"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Stroke */}
      <div className="space-y-1">
        <Label className="text-xs">Stroke</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={object.stroke || "#000000"}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer"
            disabled={disabled}
          />
          <Input
            type="number"
            value={object.strokeWidth || 0}
            onChange={(e) => handleNumberChange("strokeWidth", e.target.value, 0)}
            className="h-8 text-xs flex-1"
            placeholder="Width"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Type-specific properties */}
      {(object.type === "text" || object.type === "textbox") && (
        <>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2 border-t border-border">
            Text
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Content</Label>
            <Input
              value={object.text || ""}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className="h-8 text-xs"
              disabled={disabled}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Font Size</Label>
            <Input
              type="number"
              value={object.fontSize || 48}
              onChange={(e) => handleNumberChange("fontSize", e.target.value, 1)}
              className="h-8 text-xs"
              disabled={disabled}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Font Family</Label>
            <select
              value={object.fontFamily || "Arial"}
              onChange={(e) => onUpdate({ fontFamily: e.target.value })}
              className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
              disabled={disabled}
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>
        </>
      )}

      {/* Object info */}
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2 border-t border-border">
        Info
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <div>Type: {object.type}</div>
        <div>ID: {object.id.slice(0, 8)}...</div>
        {object.keyframes && object.keyframes.length > 0 && (
          <div>Keyframes: {object.keyframes.length}</div>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;
