import fs from 'fs';
import crypto from 'crypto';
import { mockUsers, mockListings, mockAgencies } from '../src/data/mockData.js';

let sql = `-- Supabase Seed Data generated from mockData.ts\n\n`;
sql += `-- IMPORTANT: Requires pgcrypto extension for password hashing. Supabase has this by default.\n`;
sql += `CREATE EXTENSION IF NOT EXISTS pgcrypto;\n\n`;

const getUuid = () => crypto.randomUUID();

const catMap: Record<string, string> = {};
const userMap: Record<string, any> = {};
const agencyMap: Record<string, string> = {};
const listingMap: Record<string, string> = {};

// 1. Categories
const categories = [
  { id: 'cat-real-estate', name: 'Immobilier', slug: 'immobilier' },
  { id: 'cat-apartment', name: 'Appartement', slug: 'apartment', parent_id: 'cat-real-estate' },
  { id: 'cat-house', name: 'Maison', slug: 'house', parent_id: 'cat-real-estate' },
  { id: 'cat-land', name: 'Terrain', slug: 'land', parent_id: 'cat-real-estate' },
  { id: 'cat-commercial', name: 'Commercial', slug: 'commercial', parent_id: 'cat-real-estate' },
  { id: 'cat-room', name: 'Chambre', slug: 'room', parent_id: 'cat-real-estate' },
  { id: 'cat-vehicle', name: 'Véhicules', slug: 'vehicle' }
];

categories.forEach(c => { catMap[c.id] = getUuid(); });

sql += `-- 1. CATEGORIES\n`;
categories.forEach(c => {
  const parentUuid = c.parent_id ? `'${catMap[c.parent_id]}'` : 'NULL';
  sql += `INSERT INTO categories (id, name, slug, parent_id) VALUES ('${catMap[c.id]}', '${c.name.replace(/'/g, "''")}', '${c.slug}', ${parentUuid}) ON CONFLICT (id) DO NOTHING;\n`;
});
sql += `\n`;

// 2. Prepare Users
Object.values(mockUsers).forEach(user => {
  userMap[user.id] = {
    id: getUuid(),
    email: user.email,
    name: user.name,
    role: user.role === 'seller' ? 'vendeur' : user.role,
    avatar: user.avatar || '',
    phone: user.phone || ''
  };
});

let fallbackCounter = 1;
const getFallbackUser = (role: string) => {
  const id = getUuid();
  return {
    id,
    email: `fallback-${fallbackCounter++}@example.com`,
    name: 'Fallback User',
    role,
    avatar: '',
    phone: ''
  };
};

mockAgencies.forEach(agency => {
  agencyMap[agency.id] = getUuid();
  let ownerId = 'user-agency-1'; // Default owner for mock agencies
  if (!userMap[ownerId]) {
    userMap[ownerId] = getFallbackUser('agence');
  }
});

mockListings.forEach(listing => {
  listingMap[listing.id] = getUuid();
  if (!userMap[listing.ownerId]) {
    userMap[listing.ownerId] = getFallbackUser('vendeur');
  }
});

// 3. Write AUTH USERS
sql += `-- 2. AUTH USERS (Allows profiles foreign key to succeed)\n`;
sql += `-- Passwords for all these mock users will be 'password123'\n`;
Object.values(userMap).forEach(u => {
  sql += `INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
VALUES ('${u.id}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '${u.email}', crypt('password123', gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{}', current_timestamp, current_timestamp) 
ON CONFLICT (id) DO NOTHING;\n`;
});
sql += `\n`;

// 4. Write PROFILES
sql += `-- 3. PROFILES\n`;
sql += `-- We use DO UPDATE here in case you have a database trigger that auto-creates profiles on auth.users insert.\n`;
Object.values(userMap).forEach(u => {
  sql += `INSERT INTO profiles (id, full_name, avatar_url, phone, role) 
VALUES ('${u.id}', '${u.name.replace(/'/g, "''")}', '${u.avatar}', '${u.phone}', '${u.role}') 
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, avatar_url = EXCLUDED.avatar_url, phone = EXCLUDED.phone, role = EXCLUDED.role;\n`;
});
sql += `\n`;

// 5. Write AGENCIES
sql += `-- 4. AGENCIES\n`;
mockAgencies.forEach(agency => {
  const ownerId = 'user-agency-1';
  sql += `INSERT INTO agencies (id, user_id, agency_name, logo_url, description, address, verified) 
VALUES ('${agencyMap[agency.id]}', '${userMap[ownerId].id}', '${agency.name.replace(/'/g, "''")}', '${agency.logo}', '${agency.description.replace(/'/g, "''")}', '${agency.address.replace(/'/g, "''")}', ${agency.verified}) 
ON CONFLICT (id) DO NOTHING;\n`;
});
sql += `\n`;

// 6. Write LISTINGS
sql += `-- 5. LISTINGS\n`;
mockListings.forEach(listing => {
  const loc = `${listing.location.city}, ${listing.location.neighborhood}`;
  const categoryId = `cat-${listing.category}`;
  const ownerId = userMap[listing.ownerId].id;
  
  sql += `INSERT INTO listings (id, user_id, category_id, title, description, price, location, status, views_count) 
VALUES ('${listingMap[listing.id]}', '${ownerId}', '${catMap[categoryId] || catMap['cat-real-estate']}', '${listing.title.replace(/'/g, "''")}', '${listing.description.replace(/'/g, "''")}', ${listing.price}, '${loc.replace(/'/g, "''")}', 'published', ${listing.views}) 
ON CONFLICT (id) DO NOTHING;\n`;
});
sql += `\n`;

// 7. Write LISTING IMAGES
sql += `-- 6. LISTING IMAGES\n`;
mockListings.forEach(listing => {
  listing.images.forEach((img, idx) => {
    sql += `INSERT INTO listing_images (listing_id, image_url, is_cover, display_order) 
VALUES ('${listingMap[listing.id]}', '${img}', ${idx === 0}, ${idx});\n`;
  });
});
sql += `\n`;

fs.writeFileSync('supabase_seed.sql', sql);
console.log('✅ supabase_seed.sql generated with Auth Users!');
