import React, { useState, useEffect } from "react";
import type { FabricObject, FilterConfig, FilterType } from "~/types/motion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Trash2, Plus, X } from "lucide-react";
import { cn } from "~/lib/utils";

interface PropertyPanelProps {
  selectedObjects: FabricObject[];
  onUpdateObject: (objectId: string, updates: Partial<FabricObject>) => void;
  onDeleteObjects: (objectIds: string[]) => void;
  className?: string;
}

export function PropertyPanel({
  selectedObjects,
  onUpdateObject,
  onDeleteObjects,
  className,
}: PropertyPanelProps) {
  const activeObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

  // State for object properties
  const [props, setProps] = useState<Partial<FabricObject>>({});

  // Sync with active object
  useEffect(() => {
    if (activeObject) {
      setProps(activeObject);
    }
  }, [activeObject]);

  // Update property
  const updateProp = (key: keyof FabricObject, value: any) => {
    const newProps = { ...props, [key]: value };
    setProps(newProps);
    if (activeObject) {
      onUpdateObject(activeObject.id, newProps);
    }
  };

  // Update filter
  const updateFilter = (index: number, updates: Partial<FilterConfig>) => {
    const newFilters = [...(props.filters || [])];
    newFilters[index] = { ...newFilters[index], ...updates };
    updateProp("filters", newFilters);
  };

  // Add filter
  const addFilter = (type: FilterType) => {
    const newFilter: FilterConfig = {
      type,
      value: type === "blur" ? { blur: 5 } : 50,
    };
    updateProp("filters", [...(props.filters || []), newFilter]);
  };

  // Remove filter
  const removeFilter = (index: number) => {
    const newFilters = (props.filters || []).filter((_, i) => i !== index);
    updateProp("filters", newFilters);
  };

  if (selectedObjects.length === 0) {
    return (
      <div className={cn("p-4 text-center text-sm text-muted-foreground", className)}>
        <p>No object selected</p>
        <p className="text-xs mt-2">
          Click on an object to edit its properties
        </p>
      </div>
    );
  }

  if (selectedObjects.length > 1) {
    return (
      <div className={cn("p-4 text-center text-sm text-muted-foreground", className)}>
        <p>{selectedObjects.length} objects selected</p>
        <p className="text-xs mt-2">
          Select a single object to edit properties
        </p>
      </div>
    );
  }

  return (
    <div className={cn("p-4 space-y-4 overflow-y-auto", className)}>
      {/* Header with delete button */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-semibold text-sm">
          {props.type?.toUpperCase()} Properties
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteObjects([activeObject.id])}
          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Position */}
      <div className="space-y-3">
        <Label className="text-xs font-medium">Position</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">X</Label>
            <Input
              type="number"
              value={props.left || 0}
              onChange={e => updateProp("left", parseFloat(e.target.value) || 0)}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Y</Label>
            <Input
              type="number"
              value={props.top || 0}
              onChange={e => updateProp("top", parseFloat(e.target.value) || 0)}
              className="h-8"
            />
          </div>
        </div>
      </div>

      {/* Size */}
      <div className="space-y-3">
        <Label className="text-xs font-medium">Size</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Width</Label>
            <Input
              type="number"
              value={props.width || 100}
              onChange={e => updateProp("width", parseFloat(e.target.value) || 100)}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Height</Label>
            <Input
              type="number"
              value={props.height || 100}
              onChange={e => updateProp("height", parseFloat(e.target.value) || 100)}
              className="h-8"
            />
          </div>
        </div>
      </div>

      {/* Scale */}
      <div className="space-y-3">
        <Label className="text-xs font-medium">Scale</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">X</Label>
            <Slider
              value={[props.scaleX || 1]}
              onValueChange={([v]) => updateProp("scaleX", v)}
              min={0.1}
              max={3}
              step={0.1}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Y</Label>
            <Slider
              value={[props.scaleY || 1]}
              onValueChange={([v]) => updateProp("scaleY", v)}
              min={0.1}
              max={3}
              step={0.1}
              className="h-8"
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Rotation</Label>
          <span className="text-xs text-muted-foreground">
            {Math.round(props.rotation || 0)}°
          </span>
        </div>
        <Slider
          value={[props.rotation || 0]}
          onValueChange={([v]) => updateProp("rotation", v)}
          min={0}
          max={360}
          step={1}
        />
      </div>

      {/* Opacity */}
      <div className="space-y-3">
        <Label className="text-xs font-medium">Opacity</Label>
        <div className="flex items-center gap-2">
          <Input
            type="range"
            min={0}
            max={100}
            step={1}
            value={(props.opacity || 1) * 100}
            onChange={e => updateProp("opacity", parseInt(e.target.value) / 100)}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-12">
            {Math.round((props.opacity || 1) * 100)}%
          </span>
        </div>
      </div>

      {/* Fill color (for shapes) */}
      {(props.type === "rect" ||
        props.type === "circle" ||
        props.type === "triangle" ||
        props.type === "text") && (
        <div className="space-y-3">
          <Label className="text-xs font-medium">Fill Color</Label>
          <Input
            type="color"
            value={props.fill || "#ffffff"}
            onChange={e => updateProp("fill", e.target.value)}
            className="h-8 w-full cursor-pointer"
          />
        </div>
      )}

      {/* Stroke (for shapes) */}
      {(props.type === "rect" ||
        props.type === "circle" ||
        props.type === "triangle") && (
        <div className="space-y-3">
          <Label className="text-xs font-medium">Stroke</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="color"
              value={props.stroke || "#000000"}
              onChange={e => updateProp("stroke", e.target.value)}
              className="h-8 cursor-pointer"
            />
            <Input
              type="number"
              value={props.strokeWidth || 0}
              onChange={e =>
                updateProp("strokeWidth", parseFloat(e.target.value) || 0)
              }
              placeholder="Width"
              className="h-8"
            />
          </div>
        </div>
      )}

      {/* Text-specific properties */}
      {props.type === "text" && (
        <>
          <div className="space-y-3">
            <Label className="text-xs font-medium">Text Content</Label>
            <Input
              value={props.text || ""}
              onChange={e => updateProp("text", e.target.value)}
              className="h-8"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-medium">Font Size</Label>
            <Input
              type="number"
              value={props.fontSize || 48}
              onChange={e =>
                updateProp("fontSize", parseFloat(e.target.value) || 48)
              }
              className="h-8"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-medium">Font Family</Label>
            <Select
              value={props.fontFamily || "Arial"}
              onValueChange={value => updateProp("fontFamily", value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-medium">Font Weight</Label>
            <Select
              value={props.fontWeight || "normal"}
              onValueChange={value =>
                updateProp("fontWeight", value as "normal" | "bold")
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Effects & Filters</Label>
          <Select onValueChange={addFilter}>
            <SelectTrigger className="h-7 w-7 p-0">
              <Plus className="h-3.5 w-3.5" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blur">Blur</SelectItem>
              <SelectItem value="brightness">Brightness</SelectItem>
              <SelectItem value="contrast">Contrast</SelectItem>
              <SelectItem value="grayscale">Grayscale</SelectItem>
              <SelectItem value="sepia">Sepia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {props.filters && props.filters.length > 0 && (
          <div className="space-y-2">
            {props.filters.map((filter, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted/50 rounded px-2 py-1"
              >
                <span className="text-xs capitalize flex-1">{filter.type}</span>
                <Slider
                  value={[typeof filter.value === "number" ? filter.value : 50]}
                  onValueChange={([v]) =>
                    updateFilter(index, { value: v })
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
