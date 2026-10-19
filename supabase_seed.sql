-- Supabase Seed Data generated from mockData.ts

-- IMPORTANT: Requires pgcrypto extension for password hashing. Supabase has this by default.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. CATEGORIES
INSERT INTO categories (id, name, slug, parent_id) VALUES ('ba86c185-5280-49f1-af7d-8a2870c94059', 'Immobilier', 'immobilier', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, parent_id) VALUES ('f6990dc3-283f-4f15-8b90-eab904297fa9', 'Appartement', 'apartment', 'ba86c185-5280-49f1-af7d-8a2870c94059') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, parent_id) VALUES ('34907c10-5e20-4fad-aa9b-899863ee34e2', 'Maison', 'house', 'ba86c185-5280-49f1-af7d-8a2870c94059') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, parent_id) VALUES ('b246aac2-88b9-4491-be70-d432f05b89ff', 'Terrain', 'land', 'ba86c185-5280-49f1-af7d-8a2870c94059') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, parent_id) VALUES ('cabd5abb-a088-4728-9cc4-f5cb9a816c2e', 'Commercial', 'commercial', 'ba86c185-5280-49f1-af7d-8a2870c94059') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, parent_id) VALUES ('61264e46-4314-47e9-ba11-74056759771a', 'Chambre', 'room', 'ba86c185-5280-49f1-af7d-8a2870c94059') ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, parent_id) VALUES ('86d130d1-fb52-400d-af1d-e25d513c9a86', 'Véhicules', 'vehicle', NULL) ON CONFLICT (id) DO NOTHING;

-- 2. AUTH USERS (Allows profiles foreign key to succeed)
-- Passwords for all these mock users will be 'password123'

-- 3. PROFILES
-- We use DO UPDATE here in case you have a database trigger that auto-creates profiles on auth.users insert.

-- 4. AGENCIES

-- 5. LISTINGS

-- 6. LISTING IMAGES

