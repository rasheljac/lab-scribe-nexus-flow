
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DietCohort, useDietMeasurements } from "@/hooks/useDietCohorts";
import { Plus, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface DietCohortDetailsDialogProps {
  cohort: DietCohort | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DietCohortDetailsDialog = ({ cohort, open, onOpenChange }: DietCohortDetailsDialogProps) => {
  const [newMeasurement, setNewMeasurement] = useState({
    measurement_date: format(new Date(), 'yyyy-MM-dd'),
    measurement_type: 'weight' as 'weight' | 'food_intake' | 'water_intake' | 'behavior' | 'other',
    average_value: null as number | null,
    unit: 'g',
    notes: '',
  });

  const { measurements, addMeasurement } = useDietMeasurements(cohort?.id || '');
  const { toast } = useToast();

  const handleAddMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cohort || !newMeasurement.average_value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await addMeasurement.mutateAsync({
        cohort_id: cohort.id,
        ...newMeasurement,
        individual_values: null,
      });
      toast({
        title: "Success",
        description: "Measurement added successfully",
      });
      setNewMeasurement({
        measurement_date: format(new Date(), 'yyyy-MM-dd'),
        measurement_type: 'weight',
        average_value: null,
        unit: 'g',
        notes: '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add measurement",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!cohort) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{cohort.cohort_name}</DialogTitle>
            <Badge className={getStatusColor(cohort.status)}>
              {cohort.status.replace('_', ' ')}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
            <TabsTrigger value="tracking">Add Measurement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Diet Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Type:</span> {cohort.diet_type}
                  </div>
                  {cohort.diet_description && (
                    <div>
                      <span className="font-medium">Description:</span> {cohort.diet_description}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Monitoring:</span> {cohort.monitoring_frequency}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cohort Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Mice Count:</span> {cohort.number_of_mice}
                  </div>
                  <div>
                    <span className="font-medium">Sex:</span> {cohort.sex}
                  </div>
                  {cohort.mouse_strain && (
                    <div>
                      <span className="font-medium">Strain:</span> {cohort.mouse_strain}
                    </div>
                  )}
                  {cohort.age_at_start_weeks && (
                    <div>
                      <span className="font-medium">Starting Age:</span> {cohort.age_at_start_weeks} weeks
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Start Date:</span> {format(new Date(cohort.start_date), 'MMM dd, yyyy')}
                  </div>
                  {cohort.end_date && (
                    <div>
                      <span className="font-medium">End Date:</span> {format(new Date(cohort.end_date), 'MMM dd, yyyy')}
                    </div>
                  )}
                  {cohort.duration_weeks && (
                    <div>
                      <span className="font-medium">Duration:</span> {cohort.duration_weeks} weeks
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Baseline Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {cohort.weight_at_start_grams && (
                    <div>
                      <span className="font-medium">Initial Weight:</span> {cohort.weight_at_start_grams}g
                    </div>
                  )}
                  {cohort.expected_weight_change_percent && (
                    <div>
                      <span className="font-medium">Expected Change:</span> {cohort.expected_weight_change_percent}%
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {cohort.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{cohort.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="measurements" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Measurement History
              </h3>
            </div>

            {measurements.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No measurements yet</h3>
                  <p className="text-gray-500 text-center">
                    Start tracking measurements for this cohort.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {measurements.map((measurement) => (
                  <Card key={measurement.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">
                            {measurement.measurement_type.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {format(new Date(measurement.measurement_date), 'MMM dd, yyyy')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {measurement.average_value} {measurement.unit}
                          </div>
                          {measurement.notes && (
                            <div className="text-sm text-gray-600">{measurement.notes}</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Measurement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMeasurement} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="measurement_date">Date</Label>
                      <Input
                        id="measurement_date"
                        type="date"
                        value={newMeasurement.measurement_date}
                        onChange={(e) => setNewMeasurement(prev => ({ ...prev, measurement_date: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="measurement_type">Type</Label>
                      <Select 
                        value={newMeasurement.measurement_type} 
                        onValueChange={(value: 'weight' | 'food_intake' | 'water_intake' | 'behavior' | 'other') => 
                          setNewMeasurement(prev => ({ ...prev, measurement_type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight">Weight</SelectItem>
                          <SelectItem value="food_intake">Food Intake</SelectItem>
                          <SelectItem value="water_intake">Water Intake</SelectItem>
                          <SelectItem value="behavior">Behavior</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="average_value">Average Value</Label>
                      <Input
                        id="average_value"
                        type="number"
                        step="0.1"
                        value={newMeasurement.average_value || ""}
                        onChange={(e) => setNewMeasurement(prev => ({ ...prev, average_value: parseFloat(e.target.value) || null }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={newMeasurement.unit}
                        onChange={(e) => setNewMeasurement(prev => ({ ...prev, unit: e.target.value }))}
                        placeholder="e.g., g, mL, score"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newMeasurement.notes}
                      onChange={(e) => setNewMeasurement(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <Button type="submit" disabled={addMeasurement.isPending} className="w-full">
                    {addMeasurement.isPending ? "Adding..." : "Add Measurement"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DietCohortDetailsDialog;
