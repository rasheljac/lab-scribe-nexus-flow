
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Plus, 
  Edit2, 
  Trash2, 
  MessageSquare,
  Calendar,
  Tag,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useExperimentIdeas } from "@/hooks/useExperimentIdeas";
import { useIdeaNotes } from "@/hooks/useIdeaNotes";
import CreateIdeaNoteDialog from "@/components/CreateIdeaNoteDialog";
import EditIdeaNoteDialog from "@/components/EditIdeaNoteDialog";
import RichTextDisplay from "@/components/RichTextDisplay";
import { useToast } from "@/hooks/use-toast";

const IdeaNotes = () => {
  const { ideaId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [createNoteOpen, setCreateNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  
  const { ideas, isLoading: ideasLoading } = useExperimentIdeas();
  const { notes, isLoading: notesLoading, deleteNote } = useIdeaNotes(ideaId || '');
  
  const idea = ideas.find(i => i.id === ideaId);
  const isLoading = ideasLoading || notesLoading;

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote.mutateAsync(noteId);
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'brainstorming':
        return 'bg-purple-100 text-purple-800';
      case 'researching':
        return 'bg-yellow-100 text-yellow-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  if (!idea) {
    return (
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Experiment idea not found</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate('/experiment-ideas')}
            >
              Back to Ideas
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/experiment-ideas')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Ideas
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{idea.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getPriorityColor(idea.priority)}>
                  {idea.priority}
                </Badge>
                <Badge className={getStatusColor(idea.status)}>
                  {idea.status}
                </Badge>
              </div>
            </div>
          </div>
          <Button onClick={() => setCreateNoteOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Note
          </Button>
        </div>

        {/* Idea Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Idea Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {idea.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <div className="mt-1">
                    <RichTextDisplay content={idea.description} />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Created: {format(new Date(idea.created_at), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Updated: {format(new Date(idea.updated_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notes ({notes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{note.title}</h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingNote(note)}
                          className="p-1 h-6 w-6"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 p-1 h-6 w-6"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Note</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{note.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteNote(note.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    <div className="prose prose-sm max-w-none mb-3">
                      <RichTextDisplay content={note.content} />
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created: {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}</span>
                      <span>Updated: {format(new Date(note.updated_at), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-4">No notes yet</p>
                <Button onClick={() => setCreateNoteOpen(true)} variant="outline">
                  Add Your First Note
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateIdeaNoteDialog
        ideaId={ideaId || ''}
        open={createNoteOpen}
        onOpenChange={setCreateNoteOpen}
      />

      {editingNote && (
        <EditIdeaNoteDialog
          note={editingNote}
          open={!!editingNote}
          onOpenChange={() => setEditingNote(null)}
        />
      )}
    </main>
  );
};

export default IdeaNotes;
