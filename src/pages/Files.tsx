import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileIcon, Trash2, Download, FolderIcon, CloudUpload, HardDrive } from "lucide-react";
import { useFiles } from "@/hooks/useFiles";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

const Files = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const { toast } = useToast();
  const { files, uploadFile, deleteFile, downloadFile, isLoading } = useFiles();

  const sortedFiles = [...files].sort((a, b) => {
    if (sortBy === 'name') return a.filename.localeCompare(b.filename);
    if (sortBy === 'size') return (b.file_size || 0) - (a.file_size || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      await uploadFile.mutateAsync({ file: selectedFile });
      setSelectedFile(null);
      // Reset the input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      toast({
        title: "Upload successful",
        description: `${selectedFile.name} has been uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string, filename: string) => {
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      try {
        await deleteFile.mutateAsync(fileId);
        toast({
          title: "File deleted",
          description: `${filename} has been deleted successfully.`,
        });
      } catch (error) {
        toast({
          title: "Delete failed",
          description: error instanceof Error ? error.message : "Failed to delete file",
          variant: "destructive",
        });
      }
    }
  };

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      await downloadFile(fileId, filename);
      toast({
        title: "Download started",
        description: `${filename} download has started.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalStorageUsed = files.reduce((acc, file) => acc + (file.file_size || 0), 0);
  const totalStorageGB = totalStorageUsed / (1024 * 1024 * 1024);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">File Manager</h1>
          <p className="text-muted-foreground">Upload and manage your files</p>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              Total Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStorageGB.toFixed(2)} GB</div>
            <p className="text-xs text-muted-foreground">Used storage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FolderIcon className="h-4 w-4 text-muted-foreground" />
              Total Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
            <p className="text-xs text-muted-foreground">Files uploaded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CloudUpload className="h-4 w-4 text-muted-foreground" />
              Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
              className="cursor-pointer"
            />
            {selectedFile && (
              <Button 
                onClick={handleUpload} 
                disabled={uploading}
                className="w-full mt-2"
                size="sm"
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Files</CardTitle>
              <CardDescription>
                Manage your uploaded files
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSortBy('name')}
                className={sortBy === 'name' ? 'bg-muted' : ''}
              >
                Name
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSortBy('date')}
                className={sortBy === 'date' ? 'bg-muted' : ''}
              >
                Date
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSortBy('size')}
                className={sortBy === 'size' ? 'bg-muted' : ''}
              >
                Size
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading files...</div>
          ) : files.length === 0 ? (
            <div className="py-8 text-center">
              <FolderIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No files uploaded yet</p>
              <p className="text-sm text-muted-foreground mt-1">Upload your first file to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{file.filename}</div>
                          {file.file_type && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {file.file_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>{formatFileSize(file.file_size || 0)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file.id, file.filename)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file.id, file.filename)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Files;