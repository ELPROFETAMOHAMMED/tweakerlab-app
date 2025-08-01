export interface GameConfig {
  id: number;
  title: string;
  description: string;
  image_url: string;
  badge: string;
  category: string;
  settings_file_name: string;
  ini_content: string;
  downloads_count: number;
  rating: number;
  file_size: string;
  is_active: boolean;
  featured_order: number;
  created_at: string;
  updated_at: string;
}

export interface GameConfigInsert {
  title: string;
  description?: string;
  image_url?: string;
  badge?: string;
  category?: string;
  settings_file_name: string;
  ini_content: string;
  downloads_count?: number;
  rating?: number;
  file_size?: string;
  is_active?: boolean;
  featured_order?: number;
}

export interface GameConfigUpdate {
  title?: string;
  description?: string;
  image_url?: string;
  badge?: string;
  category?: string;
  settings_file_name?: string;
  ini_content?: string;
  downloads_count?: number;
  rating?: number;
  file_size?: string;
  is_active?: boolean;
  featured_order?: number;
}
