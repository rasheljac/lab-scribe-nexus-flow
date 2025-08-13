
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateDietCohort } from "@/hooks/useDietCohorts";

interface CreateDietCohortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateDietCohortDialog = ({ open, onOpenChange }: CreateDietCohortDialogProps) => {
  const [formData, setFormData] = useState({
    cohort_name: "",
    diet_type: "",
    diet_description: "",
    number_of_mice: "",
    sex: "",
    mouse_strain: "",
    start_date: "",
    end_date: "",
    duration_weeks: "",
    age_at_start_weeks: "",
    weight_at_start_grams: "",
    expected_weight_change_percent: "",
    cage_numbers: "",
    monitoring_frequency: "weekly",
    notes: "",
    status: "active"
  });

  const createMutation = useCreateDietCohort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cohortData = {
      ...formData,
      number_of_mice: parseInt(formData.number_of_mice) || 0,
      duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : null,
      age_at_start_weeks: formData.age_at_start_weeks ? parseInt(formData.age_at_start_weeks) : null,
      weight_at_start_grams: formData.weight_at_start_grams ? parseFloat(formData.weight_at_start_grams) : null,
      expected_weight_change_percent: formData.expected_weight_change_percent ? parseFloat(formData.expected_weight_change_percent) : null,
      cage_numbers: formData.cage_numbers ? formData.cage_numbers.split(',').map(s => s.trim()) : null,
      end_date: formData.end_date || null,
    };

    await createMutation.mutateAsync(cohortData);
    onOpenChange(false);
    setFormData({
      cohort_name: "",
      diet_type: "",
      diet_description: "",
      number_of_mice: "",
      sex: "",
      mouse_strain: "",
      start_date: "",
      end_date: "",
      duration_weeks: "",
      age_at_start_weeks: "",
      weight_at_start_grams: "",
      expected_weight_change_percent: "",
      cage_numbers: "",
      monitoring_frequency: "weekly",
      notes: "",
      status: "active"
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Diet Cohort</DialogTitle>
          <DialogDescription>
            Set up a new diet study cohort with mice tracking details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cohort_name">Cohort Name *</Label>
              <Input
                id="cohort_name"
                value={formData.cohort_name}
                onChange={(e) => handleInputChange("cohort_name", e.target.value)}
                placeholder="e.g., High Fat Diet Group A"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diet_type">Diet Type *</Label>
              <Input
                id="diet_type"
                value={formData.diet_type}
                onChange={(e) => handleInputChange("diet_type", e.target.value)}
                placeholder="e.g., High Fat Diet"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diet_description">Diet Description</Label>
            <Textarea
              id="diet_description"
              value={formData.diet_description}
              onChange={(e) => handleInputChange("diet_description", e.target.value)}
              placeholder="Detailed description of the diet composition and feeding protocol"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number_of_mice">Number of Mice *</Label>
              <Input
                id="number_of_mice"
                type="number"
                value={formData.number_of_mice}
                onChange={(e) => handleInputChange("number_of_mice", e.target.value)}
                placeholder="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex *</Label>
              <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mouse_strain">Mouse Strain</Label>
              <Input
                id="mouse_strain"
                value={formData.mouse_strain}
                onChange={(e) => handleInputChange("mouse_strain", e.target.value)}
                placeholder="C57BL/6J"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration_weeks">Duration (weeks)</Label>
              <Input
                id="duration_weeks"
                type="number"
                value={formData.duration_weeks}
                onChange={(e) => handleInputChange("duration_weeks", e.target.value)}
                placeholder="12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age_at_start_weeks">Age at Start (weeks)</Label>
              <Input
                id="age_at_start_weeks"
                type="number"
                value={formData.age_at_start_weeks}
                onChange={(e) => handleInputChange("age_at_start_weeks", e.target.value)}
                placeholder="8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight_at_start_grams">Start Weight (g)</Label>
              <Input
                id="weight_at_start_grams"
                type="number"
                step="0.1"
                value={formData.weight_at_start_grams}
                onChange={(e) => handleInputChange("weight_at_start_grams", e.target.value)}
                placeholder="25.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expected_weight_change_percent">Expected Weight Change (%)</Label>
              <Input
                id="expected_weight_change_percent"
                type="number"
                step="0.1"
                value={formData.expected_weight_change_percent}
                onChange={(e) => handleInputChange("expected_weight_change_percent", e.target.value)}
                placeholder="15.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monitoring_frequency">Monitoring Frequency</Label>
              <Select value={formData.monitoring_frequency} onValueChange={(value) => handleInputChange("monitoring_frequency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cage_numbers">Cage Numbers (comma-separated)</Label>
            <Input
              id="cage_numbers"
              value={formData.cage_numbers}
              onChange={(e) => handleInputChange("cage_numbers", e.target.value)}
              placeholder="101, 102, 103"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes about the cohort"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Cohort"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
