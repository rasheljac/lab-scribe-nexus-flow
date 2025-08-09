
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserPlus, Users, Edit, Trash2, Plus } from "lucide-react";
import { useContacts, Contact } from "@/hooks/useContacts";

const ContactsDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({ name: '', mobile_number: '' });

  const { contacts, isLoading, createContact, updateContact, deleteContact } = useContacts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission attempted:', formData);
    
    // Basic validation
    if (!formData.name.trim()) {
      console.error('Name is required');
      return;
    }
    
    if (!formData.mobile_number.trim()) {
      console.error('Mobile number is required');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(formData.mobile_number.trim())) {
      console.error('Invalid phone number format');
      return;
    }

    try {
      if (editingContact) {
        console.log('Updating contact:', editingContact.id, formData);
        await updateContact.mutateAsync({ 
          id: editingContact.id, 
          name: formData.name.trim(),
          mobile_number: formData.mobile_number.trim()
        });
        setEditingContact(null);
      } else {
        console.log('Creating new contact:', formData);
        await createContact.mutateAsync({
          name: formData.name.trim(),
          mobile_number: formData.mobile_number.trim()
        });
        setIsAddingContact(false);
      }
      setFormData({ name: '', mobile_number: '' });
    } catch (error) {
      console.error('Failed to save contact:', error);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({ name: contact.name, mobile_number: contact.mobile_number });
    setIsAddingContact(false);
  };

  const handleDelete = async (contactId: string) => {
    try {
      await deleteContact.mutateAsync(contactId);
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', mobile_number: '' });
    setIsAddingContact(false);
    setEditingContact(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          Manage Contacts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            SMS Contacts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add/Edit Contact Form */}
          {(isAddingContact || editingContact) && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="contact-name">Name *</Label>
                  <Input
                    id="contact-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contact name"
                    required
                    minLength={1}
                  />
                </div>
                <div>
                  <Label htmlFor="contact-mobile">Mobile Number *</Label>
                  <Input
                    id="contact-mobile"
                    type="tel"
                    value={formData.mobile_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
                    placeholder="+1234567890"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include country code (e.g., +1 for US numbers)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={createContact.isPending || updateContact.isPending || !formData.name.trim() || !formData.mobile_number.trim()}
                  >
                    {editingContact ? 'Update' : 'Add'} Contact
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Add Contact Button */}
          {!isAddingContact && !editingContact && (
            <Button 
              onClick={() => setIsAddingContact(true)} 
              className="w-full gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Add New Contact
            </Button>
          )}

          {/* Contacts List */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-4">Loading contacts...</div>
            ) : contacts.length > 0 ? (
              contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{contact.name}</h4>
                    <p className="text-sm text-gray-600">{contact.mobile_number}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(contact)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{contact.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(contact.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No contacts saved yet</p>
                <p className="text-sm">Add contacts to quickly send SMS messages</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactsDialog;
