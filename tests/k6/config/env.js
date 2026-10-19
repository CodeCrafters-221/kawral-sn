/**
 * k6 Environment Configuration
 * Permet de basculer entre environnement de production (Vercel + Supabase Cloud)
 * et environnement local selon la variable __ENV.TARGET_ENV.
 */

const TARGET_ENV = __ENV.TARGET_ENV || 'production';

export const ENV = {
  name: TARGET_ENV,
  
  // URLs des cibles
  frontendUrl: TARGET_ENV === 'local' 
    ? 'http://localhost:3000' 
    : (__ENV.APP_URL || 'https://kawral.vercel.app'),
    
  supabaseUrl: __ENV.SUPABASE_URL || 'https://osrjeifsmhwvlfsfiggx.supabase.co',
  
  supabaseAnonKey: __ENV.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zcmplaWZzbWh3dmxmc2ZpZ2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1Mzk3NjgsImV4cCI6MjEwMjExNTc2OH0.YTDXf_YbvLyQ9NeQaTAK6jlG2TTeKsL2MMcJFlb99OQ',
  
  // Headers standard pour requêtes Supabase REST PostgREST
  get supabaseHeaders() {
    return {
      'apikey': this.supabaseAnonKey,
      'Authorization': `Bearer ${this.supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };
  },
  
  // Headers standard pour requêtes web navigateur
  get browserHeaders() {
    return {
      'User-Agent': 'k6-load-test/kawral-scalability-suite',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    };
  },
};
