import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createPCInfoService } from "@/lib/services/pc-info-service";
import type { PCInfo, CompletePCInfo } from "@/types/pc-info";
import { useAuth } from "./use-auth";

export interface PCInfoStats {
  deviceType: string;
  totalRAM: string;
  processor: string;
  networkAdapters: number;
  disks: number;
  problemDevices: number;
}

export interface UsePCInfoResult {
  pcInfo: PCInfo | null;
  completePCInfo: CompletePCInfo | null;
  stats: PCInfoStats | null;
  loading: boolean;
  error: string | null;
  hasScanned: boolean;
  refetch: () => Promise<void>;
  deletePCInfo: () => Promise<boolean>;
}

export function usePCInfo(): UsePCInfoResult {
  const { user } = useAuth();
  const [pcInfo, setPCInfo] = useState<PCInfo | null>(null);
  const [completePCInfo, setCompletePCInfo] = useState<CompletePCInfo | null>(null);
  const [stats, setStats] = useState<PCInfoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  const supabase = createClient();
  const pcInfoService = createPCInfoService(supabase);

  const fetchPCInfo = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if user has scanned PC
      const hasScannedResult = await pcInfoService.hasUserScannedPC(user.id);
      setHasScanned(hasScannedResult);

      if (hasScannedResult) {
        // Fetch basic PC info
        const { data: basicInfo, error: basicError } = await pcInfoService.getUserPCInfo(user.id);
        if (basicError) {
          throw new Error(basicError.message || "Failed to fetch PC info");
        }
        setPCInfo(basicInfo);

        // Fetch stats
        const { data: statsData, error: statsError } = await pcInfoService.getPCStats(user.id);
        if (statsError) {
          console.warn("Failed to fetch PC stats:", statsError);
        } else {
          setStats(statsData);
        }
      }
    } catch (err) {
      console.error("Error fetching PC info:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch PC info");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletePCInfo = async () => {
    if (!user || !hasScanned) return;

    try {
      const { data: completeInfo, error: completeError } = await pcInfoService.getCompletePCInfo(user.id);
      if (completeError) {
        throw new Error(completeError.message || "Failed to fetch complete PC info");
      }
      setCompletePCInfo(completeInfo);
    } catch (err) {
      console.error("Error fetching complete PC info:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch complete PC info");
    }
  };

  const deletePCInfo = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const result = await pcInfoService.deletePCInfo(user.id);
      if (result.success) {
        setPCInfo(null);
        setCompletePCInfo(null);
        setStats(null);
        setHasScanned(false);
        return true;
      } else {
        setError(result.error?.message || "Failed to delete PC info");
        return false;
      }
    } catch (err) {
      console.error("Error deleting PC info:", err);
      setError(err instanceof Error ? err.message : "Failed to delete PC info");
      return false;
    }
  };

  // Fetch basic info when user changes
  useEffect(() => {
    fetchPCInfo();
  }, [user]);

  // Fetch complete info when needed
  useEffect(() => {
    if (hasScanned && !completePCInfo) {
      fetchCompletePCInfo();
    }
  }, [hasScanned, completePCInfo]);

  return {
    pcInfo,
    completePCInfo,
    stats,
    loading,
    error,
    hasScanned,
    refetch: fetchPCInfo,
    deletePCInfo,
  };
}
