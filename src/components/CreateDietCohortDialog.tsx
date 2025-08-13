
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDietCohorts } from "@/hooks/useDietCohorts";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface CreateDietCohortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateDietCohortDialog = ({ open, onOpenChange }: CreateDietCohortDialogProps) => {
  const [formData, setFormData] = useState({
    cohort_name: "",
    diet_type: "",
    diet_description: "",
    number_of_mice: 0,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: "",
    duration_weeks: null as number | null,
    cage_numbers: [] as string[],
    mouse_strain: "",
    sex: "mixed" as "male" | "female" | "mixed",
    age_at_start_weeks: null as number | null,
    weight_at_start_grams: null as number | null,
    expected_weight_change_percent: null as number | null,
    monitoring_frequency: "weekly",
    notes: "",
    status: "active" as "active" | "completed" | "terminated" | "on_hold",
    display_order: 0,
  });

  const { createCohort } = useDietCohorts();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cohort_name || !formData.diet_type || formData.number_of_mice <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCohort.mutateAsync(formData);
      toast({
        title: "Success",
        description: "Diet cohort created successfully",
      });
      onOpenChange(false);
      setFormData({
        cohort_name: "",
        diet_type: "",
        diet_description: "",
        number_of_mice: 0,
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: "",
        duration_weeks: null,
        cage_numbers: [],
        mouse_strain: "",
        sex: "mixed",
        age_at_start_weeks: null,
        weight_at_start_grams: null,
        expected_weight_change_percent: null,
        monitoring_frequency: "weekly",
        notes: "",
        status: "active",
        display_order: 0,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create diet cohort",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Diet Cohort</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cohort_name">Cohort Name *</Label>
              <Input
                id="cohort_name"
                value={formData.cohort_name}
                onChange={(e) => setFormData(prev => ({ ...prev, cohort_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diet_type">Diet Type *</Label>
              <Input
                id="diet_type"
                value={formData.diet_type}
                onChange={(e) => setFormData(prev => ({ ...prev, diet_type: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diet_description">Diet Description</Label>
            <Textarea
              id="diet_description"
              value={formData.diet_description}
              onChange={(e) => setFormData(prev => ({ ...prev, diet_description: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number_of_mice">Number of Mice *</Label>
              <Input
                id="number_of_mice"
                type="number"
                min="1"
                value={formData.number_of_mice || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, number_of_mice: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select value={formData.sex} onValueChange={(value: "male" | "female" | "mixed") => setFormData(prev => ({ ...prev, sex: value }))}>
                <SelectTrigger>
                  <SelectValue />
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
                onChange={(e) => setFormData(prev => ({ ...prev, mouse_strain: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_weeks">Duration (weeks)</Label>
              <Input
                id="duration_weeks"
                type="number"
                min="1"
                value={formData.duration_weeks || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_weeks: parseInt(e.target.value) || null }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age_at_start_weeks">Age at Start (weeks)</Label>
              <Input
                id="age_at_start_weeks"
                type="number"
                min="0"
                value={formData.age_at_start_weeks || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, age_at_start_weeks: parseInt(e.target.value) || null }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight_at_start_grams">Initial Weight (grams)</Label>
              <Input
                id="weight_at_start_grams"
                type="number"
                min="0"
                step="0.1"
                value={formData.weight_at_start_grams || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, weight_at_start_grams: parseFloat(e.target.value) || null }))}
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
                value={formData.expected_weight_change_percent || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_weight_change_percent: parseFloat(e.target.value) || null }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monitoring_frequency">Monitoring Frequency</Label>
              <Select value={formData.monitoring_frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, monitoring_frequency: value }))}>
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCohort.isPending}>
              {createCohort.isPending ? "Creating..." : "Create Cohort"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDietCohortDialog;
