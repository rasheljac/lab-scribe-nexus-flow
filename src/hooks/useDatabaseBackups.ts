
import { useState, useCallback } from 'react';

export interface DatabaseBackup {
  id: string;
  name: string;
  size: string;
  created_at: string;
  type: 'automatic' | 'manual';
  status: 'completed' | 'in_progress' | 'failed';
}

export const useDatabaseBackups = () => {
  const [backups, setBackups] = useState<DatabaseBackup[]>([
    {
      id: '1',
      name: 'db_backup_2024_01_15.sql',
      size: '45.2MB',
      created_at: '2024-01-15T10:30:00Z',
      type: 'automatic',
      status: 'completed'
    },
    {
      id: '2',
      name: 'db_backup_2024_01_14.sql',
      size: '44.8MB',
      created_at: '2024-01-14T10:30:00Z',
      type: 'automatic',
      status: 'completed'
    },
    {
      id: '3',
      name: 'manual_backup_2024_01_13.sql',
      size: '43.9MB',
      created_at: '2024-01-13T15:45:00Z',
      type: 'manual',
      status: 'completed'
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const createBackup = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const newBackupId = `backup-${Date.now()}`;
      const backupName = `manual_backup_${new Date().toISOString().split('T')[0]}.sql`;
      
      // Create a backup entry with in_progress status
      const inProgressBackup: DatabaseBackup = {
        id: newBackupId,
        name: backupName,
        size: 'Calculating...',
        created_at: new Date().toISOString(),
        type: 'manual',
        status: 'in_progress'
      };
      
      // Add the in-progress backup to the list immediately
      setBackups(prev => [inProgressBackup, ...prev]);
      
      // Simulate backup creation with progress
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update the backup with completed status and final size
      const finalSize = `${(40 + Math.random() * 10).toFixed(1)}MB`;
      
      setBackups(prev => prev.map(backup => 
        backup.id === newBackupId 
          ? { ...backup, status: 'completed' as const, size: finalSize }
          : backup
      ));
      
      return { ...inProgressBackup, status: 'completed' as const, size: finalSize };
    } catch (error) {
      console.error('Failed to create backup:', error);
      
      // Update the backup status to failed
      setBackups(prev => prev.map(backup => 
        backup.id.startsWith('backup-') && backup.status === 'in_progress'
          ? { ...backup, status: 'failed' as const, size: 'Failed' }
          : backup
      ));
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadBackup = useCallback((backup: DatabaseBackup) => {
    // Simulate file download
    const blob = new Blob([`-- Database Backup: ${backup.name}\n-- Created: ${backup.created_at}\n-- This is a simulated backup file`], {
      type: 'application/sql'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backup.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const deleteBackup = useCallback((backupId: string) => {
    setBackups(prev => prev.filter(backup => backup.id !== backupId));
  }, []);

  return {
    backups,
    isLoading,
    createBackup,
    downloadBackup,
    deleteBackup
  };
};
