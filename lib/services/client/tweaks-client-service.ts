import { DatabaseTweak } from '@/lib/services/tweaks-service';

export interface TweaksResponse {
  tweaks: DatabaseTweak[];
  count: number;
}

export interface DownloadResponse {
  fileName: string;
  content: string;
  mimeType: string;
  title: string;
  size: number;
}

export interface LikeResponse {
  success: boolean;
  likesCount: number;
  action: 'like' | 'unlike';
}

export interface ReportResponse {
  success: boolean;
  reportId: string;
  message: string;
}

export class TweaksClientService {
  private static baseUrl = '/api/tweaks';

  // Get all tweaks with optional filters
  static async getAllTweaks(filters?: {
    category?: string;
    search?: string;
    status?: string;
    riskLevel?: string;
    deviceType?: string;
    windowsVersion?: string;
    requiresAdmin?: boolean;
    limit?: number;
  }): Promise<TweaksResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch tweaks');
    }

    return response.json();
  }

  // Get featured tweaks
  static async getFeaturedTweaks(limit: number = 10): Promise<{ tweaks: any[], count: number }> {
    try {
      const response = await fetch(`/api/tweaks/featured?limit=${limit}`);

      if (!response.ok) {
        const error = await response.json();

        // Handle database not configured (503 Service Unavailable)
        if (response.status === 503) {
          throw new Error(error.error || 'Database not configured yet. Please run the SQL scripts in Supabase first, then add some sample tweaks.');
        }

        throw new Error(error.error || 'Failed to fetch featured tweaks');
      }

      const data = await response.json();

      // Handle empty results with helpful message
      if (data.count === 0 && data.message) {
        console.warn('No tweaks available:', data.message);
      }

      return data;
    } catch (error) {
      console.error('Error in getFeaturedTweaks client:', error);
      throw error;
    }
  }

  // Get tweaks count
  static async getTweaksCount(): Promise<number> {
    try {
      const response = await fetch('/api/tweaks/count');

      if (!response.ok) {
        const error = await response.json();

        // Handle database not configured (503 Service Unavailable)
        if (response.status === 503) {
          console.warn('Database not configured, returning count 0:', error.error);
          return 0;
        }

        // For other errors, still return 0 but log the error
        console.error('Error fetching tweaks count:', error.error);
        return 0;
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Error in getTweaksCount client:', error);
      return 0; // Return 0 instead of throwing to prevent UI breaks
    }
  }

  // Download tweak
  static async downloadTweak(tweakId: string): Promise<void> {
    try {
      // First get the file data
      const response = await fetch(`${this.baseUrl}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweakId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download tweak');
      }

      const data: DownloadResponse = await response.json();

      // Create blob and download
      const blob = new Blob([data.content], { type: data.mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading tweak:', error);
      throw error;
    }
  }

  // Like/Unlike tweak
  static async toggleLike(tweakId: string, action: 'like' | 'unlike'): Promise<LikeResponse> {
    const response = await fetch(`${this.baseUrl}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tweakId, action }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update like status');
    }

    return response.json();
  }

  // Submit report
  static async submitReport(report: {
    tweakId: string;
    reportType: string;
    title: string;
    description: string;
    userSystemInfo?: any;
  }): Promise<ReportResponse> {
    const response = await fetch(`${this.baseUrl}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit report');
    }

    return response.json();
  }

  // Search tweaks
  static async searchTweaks(searchTerm: string, limit: number = 50): Promise<TweaksResponse> {
    return this.getAllTweaks({ search: searchTerm, limit });
  }

  // Get tweaks by category
  static async getTweaksByCategory(category: string, limit: number = 20): Promise<TweaksResponse> {
    return this.getAllTweaks({ category, limit });
  }

  // Advanced filter tweaks
  static async filterTweaks(filters: {
    category?: string;
    riskLevel?: string;
    deviceType?: string;
    windowsVersion?: string;
    status?: string;
    requiresAdmin?: boolean;
    limit?: number;
  }): Promise<TweaksResponse> {
    return this.getAllTweaks(filters);
  }
}
