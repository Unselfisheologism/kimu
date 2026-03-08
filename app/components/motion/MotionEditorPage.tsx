import React from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { MotionGraphicsData } from "~/types/motion";
import { MotionEditor } from "./MotionEditor";

export default function MotionEditorPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [motionData, setMotionData] = React.useState<MotionGraphicsData | null>(null);
  const [hasChanges, setHasChanges] = React.useState(false);

  const handleMotionChange = (data: MotionGraphicsData) => {
    setMotionData(data);
    setHasChanges(true);
  };

  const handleSaveAndReturn = () => {
    // In a real implementation, this would save to the backend
    console.log("Saving motion data:", motionData);
    setHasChanges(false);
    navigate(`/project/${projectId}`);
  };

  if (!motionData) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Loading motion editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 p-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/project/${projectId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Motion Editor</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={hasChanges ? "default" : "ghost"}
            size="sm"
            onClick={handleSaveAndReturn}
            disabled={!hasChanges}
          >
            {hasChanges ? "Save & Return" : "Back"}
          </Button>
        </div>
      </div>

      {/* Motion Editor */}
      <div className="flex-1 overflow-hidden">
        <MotionEditor
          motionData={motionData}
          onChange={handleMotionChange}
        />
      </div>
    </div>
  );
}
