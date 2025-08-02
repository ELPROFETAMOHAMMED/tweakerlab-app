import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Tweak, TweakInsert, TweakUpdate, TweakReport } from '@/types/tweak';

// Database types that match our SQL schema
export interface DatabaseTweak {
  id: string;
  title: string;
  description: string;
  detailed_description: string;
  category: string;
  icon_file_name: string;
  tweak_content: string;
  file_extension: string;
  file_size_bytes: number;
  windows_version: string;
  device_type: string;
  requires_admin: boolean;
  requires_restart: boolean;
  affects_battery: boolean;
  affects_performance: boolean;
  affects_security: boolean;
  risk_level: string;
  risk_description: string;
  reversal_method: string;
  downloads_count: number;
  likes_count: number;
  views_count: number;
  rating: number;
  reviews_count: number;
  success_rate: number;
  status: string;
  admin_notes: string | null;
  disable_reason: string | null;
  is_active: boolean;
  is_featured: boolean;
  featured_order: number | null;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_verified: boolean;
  conflicts_with: string[];
  requires_tweaks: string[];
  reports_count: number;
  last_report_date: string | null;
}

export interface DatabaseTweakReport {
  id: string;
  tweak_id: string;
  user_id: string;
  report_type: string;
  title: string;
  description: string;
  user_system_info: any;
  status: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export class TweaksService {
  private supabase: any; // More flexible typing to handle different Supabase client types

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  // Get all active tweaks
  async getAllTweaks(limit: number = 50): Promise<DatabaseTweak[]> {
    const { data, error } = await this.supabase
      .from('tweaks')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching tweaks:', error);
      throw new Error(`Failed to fetch tweaks: ${error.message}`);
    }

    return data || [];
  }

  // Get featured tweaks
  async getFeaturedTweaks(limit: number = 10): Promise<DatabaseTweak[]> {
    console.log('getFeaturedTweaks called with limit:', limit);

    try {
      // First try with RPC function
      console.log('Trying RPC function get_featured_tweaks...');
      const { data: rpcData, error: rpcError } = await this.supabase
        .rpc('get_featured_tweaks', { limit_count: limit });

      if (!rpcError && rpcData) {
        console.log('RPC function succeeded, returning', rpcData.length, 'tweaks');
        return rpcData;
      }

      console.warn('RPC function failed, trying direct query:', rpcError?.message);

      // Fallback: Direct SQL query if RPC function doesn't exist
      console.log('Trying direct query for featured tweaks...');
      const { data, error } = await this.supabase
        .from('tweaks')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('featured_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Direct featured query failed:', error);
        console.log('Trying to get any active tweaks instead...');

        // Try getting any active tweaks if featured query fails
        const { data: anyActiveData, error: anyActiveError } = await this.supabase
          .from('tweaks')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (anyActiveError) {
          console.error('Even basic query failed:', anyActiveError);
          throw new Error(`Database connection error: ${anyActiveError.message}`);
        }

        console.log('Fallback query succeeded, returning', (anyActiveData || []).length, 'tweaks');
        return anyActiveData || [];
      }

      console.log('Direct featured query succeeded, returning', (data || []).length, 'tweaks');
      return data || [];

    } catch (error) {
      console.error('Error in getFeaturedTweaks:', error);

      // Final fallback: Try basic table access
      try {
        console.log('Final fallback: trying basic table access...');
        const { data: basicData, error: basicError } = await this.supabase
          .from('tweaks')
          .select('id, title, description')
          .limit(1);

        if (basicError) {
          console.error('Basic table access failed:', basicError);
          throw new Error(`Database table access error: ${basicError.message}`);
        }

        console.log('Basic table access works, trying full query again...');
        const { data: fullData, error: fullError } = await this.supabase
          .from('tweaks')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (fullError) {
          throw new Error(`Full query error: ${fullError.message}`);
        }

        return fullData || [];
      } catch (finalError) {
        console.error('All fallbacks failed:', finalError);
        throw new Error(`Database not accessible: ${finalError instanceof Error ? finalError.message : 'Unknown error'}`);
      }
    }
  }

  // Get tweaks by category
  async getTweaksByCategory(category: string, limit: number = 20): Promise<DatabaseTweak[]> {
    try {
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await this.supabase
        .rpc('get_tweaks_by_category', { cat: category, limit_count: limit });

      if (!rpcError && rpcData) {
        return rpcData;
      }

      console.warn('RPC function failed, using direct query:', rpcError?.message);

      // Fallback to direct query
      const { data, error } = await this.supabase
        .from('tweaks')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('downloads_count', { ascending: false })
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching tweaks by category:', error);
        throw new Error(`Failed to fetch tweaks by category: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTweaksByCategory:', error);
      throw error;
    }
  }

  // Search tweaks
  async searchTweaks(searchTerm: string, limit: number = 50): Promise<DatabaseTweak[]> {
    try {
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await this.supabase
        .rpc('search_tweaks', { search_term: searchTerm, limit_count: limit });

      if (!rpcError && rpcData) {
        return rpcData;
      }

      console.warn('RPC function failed, using direct query:', rpcError?.message);

      // Fallback to direct query with basic search
      const { data, error } = await this.supabase
        .from('tweaks')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,detailed_description.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .order('downloads_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error searching tweaks:', error);
        throw new Error(`Failed to search tweaks: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchTweaks:', error);
      throw error;
    }
  }

  // Filter tweaks with advanced options
  async filterTweaks(filters: {
    category?: string;
    riskLevel?: string;
    deviceType?: string;
    windowsVersion?: string;
    status?: string;
    requiresAdmin?: boolean;
    limit?: number;
  }): Promise<DatabaseTweak[]> {
    let query = this.supabase.from('tweaks').select('*');

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters.riskLevel && filters.riskLevel !== 'all') {
      query = query.eq('risk_level', filters.riskLevel);
    }
    if (filters.deviceType && filters.deviceType !== 'all') {
      query = query.in('device_type', [filters.deviceType, 'both']);
    }
    if (filters.windowsVersion && filters.windowsVersion !== 'all') {
      query = query.in('windows_version', [filters.windowsVersion, 'both']);
    }
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.requiresAdmin !== undefined) {
      query = query.eq('requires_admin', filters.requiresAdmin);
    }

    // Always show active tweaks unless specifically filtering by status
    if (!filters.status || filters.status === 'all' || filters.status === 'active') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query
      .order('downloads_count', { ascending: false })
      .limit(filters.limit || 50);

    if (error) {
      console.error('Error filtering tweaks:', error);
      throw new Error(`Failed to filter tweaks: ${error.message}`);
    }

    return data || [];
  }

  // Get single tweak by ID
  async getTweakById(id: string): Promise<DatabaseTweak | null> {
    const { data, error } = await this.supabase
      .from('tweaks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching tweak by ID:', error);
      throw new Error(`Failed to fetch tweak: ${error.message}`);
    }

    return data;
  }

  // Get tweaks count
  async getTweaksCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('tweaks')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (error) {
      console.error('Error getting tweaks count:', error);
      throw new Error(`Failed to get tweaks count: ${error.message}`);
    }

    return count || 0;
  }

  // Increment download count
  async incrementDownloads(tweakId: string): Promise<number> {
    try {
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await this.supabase
        .rpc('increment_tweak_downloads', { tweak_uuid: tweakId });

      if (!rpcError && rpcData !== null) {
        return rpcData;
      }

      console.warn('RPC function failed, using direct update:', rpcError?.message);

      // Fallback: Get current count, increment, and update
      const { data: currentData, error: selectError } = await this.supabase
        .from('tweaks')
        .select('downloads_count')
        .eq('id', tweakId)
        .single();

      if (selectError) {
        throw new Error(`Failed to get current downloads count: ${selectError.message}`);
      }

      const newCount = (currentData?.downloads_count || 0) + 1;

      const { data, error } = await this.supabase
        .from('tweaks')
        .update({
          downloads_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', tweakId)
        .select('downloads_count')
        .single();

      if (error) {
        console.error('Error incrementing downloads:', error);
        throw new Error(`Failed to increment downloads: ${error.message}`);
      }

      return data?.downloads_count || 0;
    } catch (error) {
      console.error('Error in incrementDownloads:', error);
      throw error;
    }
  }

  // Increment likes count
  async incrementLikes(tweakId: string): Promise<number> {
    try {
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await this.supabase
        .rpc('increment_tweak_likes', { tweak_uuid: tweakId });

      if (!rpcError && rpcData !== null) {
        return rpcData;
      }

      console.warn('RPC function failed, using direct update:', rpcError?.message);

      // Fallback: Get current count, increment, and update
      const { data: currentData, error: selectError } = await this.supabase
        .from('tweaks')
        .select('likes_count')
        .eq('id', tweakId)
        .single();

      if (selectError) {
        throw new Error(`Failed to get current likes count: ${selectError.message}`);
      }

      const newCount = (currentData?.likes_count || 0) + 1;

      const { data, error } = await this.supabase
        .from('tweaks')
        .update({
          likes_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', tweakId)
        .select('likes_count')
        .single();

      if (error) {
        console.error('Error incrementing likes:', error);
        throw new Error(`Failed to increment likes: ${error.message}`);
      }

      return data?.likes_count || 0;
    } catch (error) {
      console.error('Error in incrementLikes:', error);
      throw error;
    }
  }

  // Decrement likes count
  async decrementLikes(tweakId: string): Promise<number> {
    try {
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await this.supabase
        .rpc('decrement_tweak_likes', { tweak_uuid: tweakId });

      if (!rpcError && rpcData !== null) {
        return rpcData;
      }

      console.warn('RPC function failed, using direct update:', rpcError?.message);

      // Fallback: Get current count, decrement, and update
      const { data: currentData, error: selectError } = await this.supabase
        .from('tweaks')
        .select('likes_count')
        .eq('id', tweakId)
        .single();

      if (selectError) {
        throw new Error(`Failed to get current likes count: ${selectError.message}`);
      }

      const newCount = Math.max((currentData?.likes_count || 0) - 1, 0);

      const { data, error } = await this.supabase
        .from('tweaks')
        .update({
          likes_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', tweakId)
        .select('likes_count')
        .single();

      if (error) {
        console.error('Error decrementing likes:', error);
        throw new Error(`Failed to decrement likes: ${error.message}`);
      }

      return data?.likes_count || 0;
    } catch (error) {
      console.error('Error in decrementLikes:', error);
      throw error;
    }
  }

  // Increment views count
  async incrementViews(tweakId: string): Promise<number> {
    try {
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await this.supabase
        .rpc('increment_tweak_views', { tweak_uuid: tweakId });

      if (!rpcError && rpcData !== null) {
        return rpcData;
      }

      console.warn('RPC function failed, using direct update:', rpcError?.message);

      // Fallback: Get current count, increment, and update
      const { data: currentData, error: selectError } = await this.supabase
        .from('tweaks')
        .select('views_count')
        .eq('id', tweakId)
        .single();

      if (selectError) {
        throw new Error(`Failed to get current views count: ${selectError.message}`);
      }

      const newCount = (currentData?.views_count || 0) + 1;

      const { data, error } = await this.supabase
        .from('tweaks')
        .update({
          views_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', tweakId)
        .select('views_count')
        .single();

      if (error) {
        console.error('Error incrementing views:', error);
        throw new Error(`Failed to increment views: ${error.message}`);
      }

      return data?.views_count || 0;
    } catch (error) {
      console.error('Error in incrementViews:', error);
      throw error;
    }
  }

  // Submit a report
  async submitReport(report: {
    tweakId: string;
    userId: string;
    reportType: string;
    title: string;
    description: string;
    userSystemInfo?: any;
  }): Promise<DatabaseTweakReport> {
    const { data, error } = await this.supabase
      .from('tweak_reports')
      .insert({
        tweak_id: report.tweakId,
        user_id: report.userId,
        report_type: report.reportType,
        title: report.title,
        description: report.description,
        user_system_info: report.userSystemInfo,
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting report:', error);
      throw new Error(`Failed to submit report: ${error.message}`);
    }

    return data;
  }

  // Get reports for a tweak
  async getTweakReports(tweakId: string): Promise<DatabaseTweakReport[]> {
    const { data, error } = await this.supabase
      .from('tweak_reports')
      .select('*')
      .eq('tweak_id', tweakId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tweak reports:', error);
      throw new Error(`Failed to fetch tweak reports: ${error.message}`);
    }

    return data || [];
  }
}
