
import { useState, useCallback } from 'react';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: string;
  user: string;
  ip_address: string;
  status: 'success' | 'warning' | 'error';
  details: string;
}

export const useSecurityLogs = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([
    {
      id: '1',
      timestamp: '2024-01-15T14:30:22Z',
      event: 'Login Attempt',
      user: 'john.doe@lab.com',
      ip_address: '192.168.1.100',
      status: 'success',
      details: 'Successful login with 2FA'
    },
    {
      id: '2',
      timestamp: '2024-01-15T14:25:15Z',
      event: 'Failed Login',
      user: 'unknown@external.com',
      ip_address: '203.0.113.45',
      status: 'error',
      details: 'Invalid credentials - 3rd attempt'
    },
    {
      id: '3',
      timestamp: '2024-01-15T13:45:30Z',
      event: 'Password Change',
      user: 'jane.smith@lab.com',
      ip_address: '192.168.1.102',
      status: 'success',
      details: 'Password changed successfully'
    },
    {
      id: '4',
      timestamp: '2024-01-15T12:30:45Z',
      event: 'Account Lockout',
      user: 'test.user@lab.com',
      ip_address: '192.168.1.105',
      status: 'warning',
      details: 'Account locked after 5 failed attempts'
    },
    {
      id: '5',
      timestamp: '2024-01-15T11:15:22Z',
      event: 'Admin Access',
      user: 'admin@lab.com',
      ip_address: '192.168.1.101',
      status: 'success',
      details: 'Admin panel accessed'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const refreshLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call to refresh logs
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Security logs refreshed');
    } catch (error) {
      console.error('Failed to refresh security logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportLogs = useCallback((format: 'csv' | 'json' | 'pdf' = 'csv') => {
    let content = '';
    let filename = `security_logs_${new Date().toISOString().split('T')[0]}`;
    let mimeType = '';

    switch (format) {
      case 'csv':
        content = 'Timestamp,Event,User,IP Address,Status,Details\n' +
          logs.map(log => 
            `"${log.timestamp}","${log.event}","${log.user}","${log.ip_address}","${log.status}","${log.details}"`
          ).join('\n');
        filename += '.csv';
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify(logs, null, 2);
        filename += '.json';
        mimeType = 'application/json';
        break;
      case 'pdf':
        // For PDF, we'll use a simple text format
        content = 'Security Logs Report\n' + 
          '===================\n\n' +
          logs.map(log => 
            `${log.timestamp} - ${log.event}\nUser: ${log.user}\nIP: ${log.ip_address}\nStatus: ${log.status}\nDetails: ${log.details}\n\n`
          ).join('');
        filename += '.txt';
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [logs]);

  return {
    logs,
    isLoading,
    refreshLogs,
    exportLogs
  };
};
