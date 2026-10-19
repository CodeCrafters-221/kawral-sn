import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { uploadAvatar as storageUploadAvatar } from './storageService';
import { isUUID } from '../../utils/uuid';

export interface UserProfileData {
  id: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  role?: 'client' | 'vendeur' | 'agence' | 'admin';
}

export const profileService = {
  /**
   * Fetch profile from public.profiles table by userId
   */
  async getProfile(userId: string) {
    if (!isSupabaseConfigured() || !userId || !isUUID(userId)) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching profile from Supabase:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('getProfile exception:', err);
      return null;
    }
  },

  /**
   * Upsert profile data into public.profiles table
   */
  async saveProfile(userId: string, data: Partial<UserProfileData>) {
    if (!isSupabaseConfigured() || !userId) return null;

    try {
      const payload: Record<string, any> = {
        id: userId,
        updated_at: new Date().toISOString()
      };

      if (data.fullName !== undefined) payload.full_name = data.fullName;
      if (data.phone !== undefined) payload.phone = data.phone;
      if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl;
      if (data.bannerUrl !== undefined) payload.banner_url = data.bannerUrl;
      if (data.role !== undefined) payload.role = data.role;

      const { data: updated, error } = await (supabase.from as any)('profiles')
        .upsert(payload)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error saving profile to Supabase DB:', error.message);
        return null;
      }
      return updated;
    } catch (err) {
      console.error('saveProfile exception:', err);
      return null;
    }
  },

  /**
   * Upload user avatar to Supabase Storage bucket 'avatars'
   */
  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    return storageUploadAvatar(userId, file);
  }
};
