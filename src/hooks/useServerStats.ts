
import { useState, useEffect } from 'react';

export interface ServerStats {
  uptime: string;
  activeUsers: number;
  memoryUsage: string;
  cpuUsage: string;
  diskSpace: string;
}

export const useServerStats = () => {
  const [stats, setStats] = useState<ServerStats>({
    uptime: "99.1%",
    activeUsers: 47,
    memoryUsage: "2.8GB",
    cpuUsage: "12%",
    diskSpace: "78%"
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServerStats = async () => {
      try {
        // Simulate fetching real server stats
        // In a real app, this would call your server monitoring API
        const mockStats: ServerStats = {
          uptime: `${(98.5 + Math.random() * 1.5).toFixed(1)}%`,
          activeUsers: Math.floor(35 + Math.random() * 25),
          memoryUsage: `${(2.1 + Math.random() * 1.8).toFixed(1)}GB`,
          cpuUsage: `${Math.floor(5 + Math.random() * 20)}%`,
          diskSpace: `${Math.floor(65 + Math.random() * 25)}%`
        };
        
        setStats(mockStats);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch server stats:', error);
        setIsLoading(false);
      }
    };

    fetchServerStats();
    
    // Update stats every 10 seconds
    const interval = setInterval(fetchServerStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return { stats, isLoading };
};
