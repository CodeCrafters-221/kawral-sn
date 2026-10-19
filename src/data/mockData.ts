import { Listing, Agency, User, Conversation, Message, Appointment, Report } from '../types';

// Pure empty initial state - all accounts and data come exclusively from Supabase DB & Auth
export const mockUsers: Record<string, User> = {};

export const mockAgencies: Agency[] = [];

export const mockListings: Listing[] = [];

export const mockConversations: Conversation[] = [];

export const mockMessages: Record<string, Message[]> = {};

export const mockAppointments: Appointment[] = [];

export const mockReports: Report[] = [];
