import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateDietCohort, useDeleteDietCohort } from "@/hooks/useDietCohorts";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface EditDietCohortDialogProps {
  cohort: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditDietCohortDialog = ({ cohort, open, onOpenChange }: EditDietCohortDialogProps) => {
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

  const updateMutation = useUpdateDietCohort();
  const deleteMutation = useDeleteDietCohort();

  useEffect(() => {
    if (cohort) {
      setFormData({
        cohort_name: cohort.cohort_name || "",
        diet_type: cohort.diet_type || "",
        diet_description: cohort.diet_description || "",
        number_of_mice: cohort.number_of_mice?.toString() || "",
        sex: cohort.sex || "",
        mouse_strain: cohort.mouse_strain || "",
        start_date: cohort.start_date || "",
        end_date: cohort.end_date || "",
        duration_weeks: cohort.duration_weeks?.toString() || "",
        age_at_start_weeks: cohort.age_at_start_weeks?.toString() || "",
        weight_at_start_grams: cohort.weight_at_start_grams?.toString() || "",
        expected_weight_change_percent: cohort.expected_weight_change_percent?.toString() || "",
        cage_numbers: cohort.cage_numbers?.join(", ") || "",
        monitoring_frequency: cohort.monitoring_frequency || "weekly",
        notes: cohort.notes || "",
        status: cohort.status || "active"
      });
    }
  }, [cohort]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      ...formData,
      number_of_mice: parseInt(formData.number_of_mice) || 0,
      duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : null,
      age_at_start_weeks: formData.age_at_start_weeks ? parseInt(formData.age_at_start_weeks) : null,
      weight_at_start_grams: formData.weight_at_start_grams ? parseFloat(formData.weight_at_start_grams) : null,
      expected_weight_change_percent: formData.expected_weight_change_percent ? parseFloat(formData.expected_weight_change_percent) : null,
      cage_numbers: formData.cage_numbers ? formData.cage_numbers.split(',').map(s => s.trim()) : null,
      end_date: formData.end_date || null,
    };

    await updateMutation.mutateAsync({ id: cohort.id, ...updates });
    onOpenChange(false);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(cohort.id);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Diet Cohort</DialogTitle>
          <DialogDescription>
            Update the diet cohort details and tracking information.
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diet_type">Diet Type *</Label>
              <Input
                id="diet_type"
                value={formData.diet_type}
                onChange={(e) => handleInputChange("diet_type", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number_of_mice">Number of Mice *</Label>
              <Input
                id="number_of_mice"
                type="number"
                value={formData.number_of_mice}
                onChange={(e) => handleInputChange("number_of_mice", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Diet Cohort</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this diet cohort? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
