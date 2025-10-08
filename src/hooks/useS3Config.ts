import { useEffect, useState } from "react";
import { useUserPreferences } from "@/hooks/useUserPreferences";

export interface S3Config {
  endpoint: string;
  bucket_name: string;
  region: string;
  access_key_id: string;
  secret_access_key: string;
}

export const useS3Config = () => {
  const { preferences } = useUserPreferences();
  const [s3Config, setS3Config] = useState<S3Config | null>(null);

  useEffect(() => {
    if (preferences?.preferences && typeof preferences.preferences === 'object') {
      const prefs = preferences.preferences as any;
      if (prefs.idrive_e2) {
        setS3Config(prefs.idrive_e2 as S3Config);
      }
    }
  }, [preferences]);

  return {
    s3Config,
    hasConfig: !!s3Config?.endpoint && !!s3Config?.access_key_id,
  };
};
