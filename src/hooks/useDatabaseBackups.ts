
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
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newBackup: DatabaseBackup = {
        id: Date.now().toString(),
        name: `manual_backup_${new Date().toISOString().split('T')[0]}.sql`,
        size: `${(40 + Math.random() * 10).toFixed(1)}MB`,
        created_at: new Date().toISOString(),
        type: 'manual',
        status: 'completed'
      };
      
      setBackups(prev => [newBackup, ...prev]);
      return newBackup;
    } catch (error) {
      console.error('Failed to create backup:', error);
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
