
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExperiments, Experiment } from "@/hooks/useExperiments";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/RichTextEditor";

interface EditExperimentDialogProps {
  experiment: Experiment;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const EditExperimentDialog = ({ 
  experiment, 
  children, 
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange 
}: EditExperimentDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: experiment.title,
    description: experiment.description || "",
    status: experiment.status,
    progress: experiment.progress,
    start_date: experiment.start_date,
    end_date: experiment.end_date || "",
    researcher: experiment.researcher,
    protocols: experiment.protocols,
    samples: experiment.samples,
    category: experiment.category,
  });

  const { updateExperiment } = useExperiments();
  const { toast } = useToast();

  // Use controlled or internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Experiment title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateExperiment.mutateAsync({
        id: experiment.id,
        ...formData,
      });
      toast({
        title: "Success",
        description: "Experiment updated successfully",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update experiment",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  // Prevent dialog from closing when clicking inside form elements
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const dialogContent = (
    <DialogContent 
      className="max-w-4xl max-h-[80vh] overflow-y-auto"
      onClick={handleContentClick}
    >
      <DialogHeader>
        <DialogTitle>Edit Experiment</DialogTitle>
        <DialogDescription>
          Update experiment details and settings.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4" onClick={handleContentClick}>
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            required
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <div onClick={(e) => e.stopPropagation()}>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => handleInputChange("description", value)}
              placeholder="Enter experiment description..."
              className="mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger onClick={(e) => e.stopPropagation()}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="progress">Progress (%)</Label>
          <Input
            id="progress"
            type="number"
            min="0"
            max="100"
            value={formData.progress}
            onChange={(e) => handleInputChange("progress", parseInt(e.target.value) || 0)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleInputChange("start_date", e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => handleInputChange("end_date", e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="researcher">Researcher</Label>
          <Input
            id="researcher"
            value={formData.researcher}
            onChange={(e) => handleInputChange("researcher", e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="protocols">Protocols</Label>
            <Input
              id="protocols"
              type="number"
              min="0"
              value={formData.protocols}
              onChange={(e) => handleInputChange("protocols", parseInt(e.target.value) || 0)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="samples">Samples</Label>
            <Input
              id="samples"
              type="number"
              min="0"
              value={formData.samples}
              onChange={(e) => handleInputChange("samples", parseInt(e.target.value) || 0)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            type="submit" 
            disabled={updateExperiment.isPending} 
            className="flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            {updateExperiment.isPending ? "Updating..." : "Update Experiment"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  if (children) {
    return (
      <>
        <div onClick={handleTriggerClick} className="w-full">
          {children}
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          {dialogContent}
        </Dialog>
      </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {dialogContent}
    </Dialog>
  );
};

export default EditExperimentDialog;
