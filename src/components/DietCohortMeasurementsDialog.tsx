
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useDietCohortMeasurements, useCreateDietCohortMeasurement, useDeleteDietCohortMeasurement } from "@/hooks/useDietCohortMeasurements";
import { format } from "date-fns";

interface DietCohortMeasurementsDialogProps {
  cohort: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DietCohortMeasurementsDialog = ({ cohort, open, onOpenChange }: DietCohortMeasurementsDialogProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    measurement_type: "",
    measurement_date: "",
    average_value: "",
    individual_values: "",
    unit: "",
    notes: ""
  });

  const { measurements, loading } = useDietCohortMeasurements(cohort?.id);
  const createMutation = useCreateDietCohortMeasurement();
  const deleteMutation = useDeleteDietCohortMeasurement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const measurementData = {
      cohort_id: cohort.id,
      measurement_type: formData.measurement_type,
      measurement_date: formData.measurement_date,
      average_value: formData.average_value ? parseFloat(formData.average_value) : null,
      individual_values: formData.individual_values ? 
        formData.individual_values.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v)) : null,
      unit: formData.unit || null,
      notes: formData.notes || null
    };

    await createMutation.mutateAsync(measurementData);
    setFormData({
      measurement_type: "",
      measurement_date: "",
      average_value: "",
      individual_values: "",
      unit: "",
      notes: ""
    });
    setShowAddForm(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Measurements - {cohort?.cohort_name}</DialogTitle>
          <DialogDescription>
            Track and record measurements for this diet cohort over time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recorded Measurements</h3>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Measurement
            </Button>
          </div>

          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">New Measurement</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="measurement_type">Measurement Type *</Label>
                      <Select 
                        value={formData.measurement_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, measurement_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select measurement type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight">Weight</SelectItem>
                          <SelectItem value="body_length">Body Length</SelectItem>
                          <SelectItem value="food_consumption">Food Consumption</SelectItem>
                          <SelectItem value="water_consumption">Water Consumption</SelectItem>
                          <SelectItem value="glucose_level">Glucose Level</SelectItem>
                          <SelectItem value="insulin_level">Insulin Level</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="measurement_date">Date *</Label>
                      <Input
                        id="measurement_date"
                        type="date"
                        value={formData.measurement_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, measurement_date: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="average_value">Average Value</Label>
                      <Input
                        id="average_value"
                        type="number"
                        step="0.01"
                        value={formData.average_value}
                        onChange={(e) => setFormData(prev => ({ ...prev, average_value: e.target.value }))}
                        placeholder="25.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                        placeholder="g, mg/dL, cm, etc."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="individual_values">Individual Values (comma-separated)</Label>
                    <Input
                      id="individual_values"
                      value={formData.individual_values}
                      onChange={(e) => setFormData(prev => ({ ...prev, individual_values: e.target.value }))}
                      placeholder="24.5, 25.2, 26.1, 24.8"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional observations or notes"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Adding..." : "Add Measurement"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading measurements...</div>
            ) : measurements && measurements.length > 0 ? (
              measurements.map((measurement: any) => (
                <Card key={measurement.id} className="relative">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h4 className="font-medium capitalize">{measurement.measurement_type.replace('_', ' ')}</h4>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(measurement.measurement_date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        
                        {measurement.average_value && (
                          <p className="text-sm">
                            <span className="font-medium">Average:</span> {measurement.average_value} {measurement.unit}
                          </p>
                        )}
                        
                        {measurement.individual_values && measurement.individual_values.length > 0 && (
                          <p className="text-sm">
                            <span className="font-medium">Individual values:</span> {measurement.individual_values.join(', ')} {measurement.unit}
                          </p>
                        )}
                        
                        {measurement.notes && (
                          <p className="text-sm text-muted-foreground">{measurement.notes}</p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(measurement.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No measurements recorded yet. Add your first measurement above.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
