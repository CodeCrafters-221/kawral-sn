import {
	supabase,
	isSupabaseConfigured,
} from "../../lib/supabase";
import {
	Conversation,
	Message,
	Listing,
} from "../../types";
import {
	toValidUUID,
	isUUID,
} from "../../utils/uuid";

const MAX_MESSAGE_LENGTH = 2000;

export const messagesService = {
	/**
	 * Fetch conversations and messages from Supabase DB
	 */
	async fetchConversationsAndMessages(
		listingsMap: Record<string, Listing>,
		profilesMap: Record<string, any>,
		conversationId?: string,
		currentUserId?: string,
	) {
		if (!isSupabaseConfigured() || (!currentUserId && !conversationId)) {
			return { conversations: [], messages: {} };
		}

		try {
			let conversationsQuery = (supabase.from as any)(
				"conversations",
			)
				.select("*")
				.order("updated_at", { ascending: false })
				.limit(200);

			if (conversationId) {
				const validConvId = toValidUUID(conversationId);
				conversationsQuery = conversationsQuery.eq(
					"id",
					validConvId,
				);
			} else if (currentUserId && isUUID(currentUserId)) {
				conversationsQuery = conversationsQuery.or(
					`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`,
				);
			}

			const { data: convsData, error: conversationsError } =
				await conversationsQuery;
			if (conversationsError) throw conversationsError;

			const convIds: string[] = (convsData || [])
				.map((c: any) => c.id)
				.filter((id: string) => isUUID(id));

			if (convIds.length === 0) {
				return { conversations: [], messages: {} };
			}

			let messagesQuery = (supabase.from as any)("messages")
				.select("*")
				.order("created_at", { ascending: true })
				.limit(500);

			if (conversationId) {
				messagesQuery = messagesQuery.eq(
					"conversation_id",
					toValidUUID(conversationId),
				);
			} else {
				messagesQuery = messagesQuery.in(
					"conversation_id",
					convIds,
				);
			}

			const { data: msgsData, error: messagesError } =
				await messagesQuery;
			if (messagesError) throw messagesError;

			// S'assurer que tous les profils des participants (acheteurs, vendeurs, expéditeurs) sont chargés
			const participantIds = new Set<string>();
			(convsData || []).forEach((c: any) => {
				if (c.buyer_id && isUUID(c.buyer_id) && !profilesMap[c.buyer_id]?.full_name) {
					participantIds.add(c.buyer_id);
				}
				if (c.seller_id && isUUID(c.seller_id) && !profilesMap[c.seller_id]?.full_name) {
					participantIds.add(c.seller_id);
				}
			});
			(msgsData || []).forEach((m: any) => {
				if (m.sender_id && isUUID(m.sender_id) && !profilesMap[m.sender_id]?.full_name) {
					participantIds.add(m.sender_id);
				}
			});

			if (participantIds.size > 0) {
				const { data: missingProfiles } = await supabase
					.from("profiles")
					.select("id, full_name, phone, avatar_url")
					.in("id", Array.from(participantIds));
				missingProfiles?.forEach((p: any) => {
					profilesMap[p.id] = p;
				});
			}

			// Indexer les conversations par ID pour résoudre les noms dans les messages
			const convById: Record<string, any> = {};
			(convsData || []).forEach((c: any) => {
				convById[c.id] = c;
			});

			const groupedMessages: Record<string, Message[]> = {};
			if (msgsData && msgsData.length > 0) {
				msgsData.forEach((m: any) => {
					const convId = m.conversation_id;
					if (!groupedMessages[convId]) {
						groupedMessages[convId] = [];
					}
					const senderProfile = profilesMap[m.sender_id];
					const parentConv = convById[convId];
					const matchedListing = parentConv
						? listingsMap[parentConv.listing_id]
						: undefined;
					const fallbackSenderName =
						parentConv && m.sender_id === parentConv.seller_id
							? matchedListing?.owner?.name || "Vendeur"
							: "Client";

					groupedMessages[convId].push({
						id: m.id,
						conversationId: convId,
						senderId: m.sender_id,
						senderName:
							senderProfile?.full_name?.trim() || fallbackSenderName,
						text: m.content,
						createdAt: m.created_at,
					});
				});
			}

			const mappedConvs: Conversation[] = (
				convsData || []
			).map((c: any) => {
				const matchedListing = listingsMap[c.listing_id];
				const convMsgs = groupedMessages[c.id] || [];
				const lastMsgText =
					convMsgs.length > 0
						? convMsgs[convMsgs.length - 1].text
						: "Discussion";

				const buyerProfile = profilesMap[c.buyer_id];
				const sellerProfile = profilesMap[c.seller_id];
				const unreadCount = convMsgs.filter(
					(message) =>
						message.senderId !== currentUserId &&
						msgsData?.some(
							(row: any) =>
								row.id === message.id &&
								row.is_read === false,
						),
				).length;

				const resolvedBuyerName =
					buyerProfile?.full_name?.trim() || "Client";
				const resolvedSellerName =
					sellerProfile?.full_name?.trim() ||
					matchedListing?.owner?.name?.trim() ||
					"Vendeur";

				return {
					id: c.id,
					listingId: c.listing_id || "",
					listingTitle:
						matchedListing?.title || "Discussion annonce",
					listingImage:
						matchedListing?.images[0] ||
						"https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=300&q=80",
					listingPrice: matchedListing?.price || 0,
					buyerId: c.buyer_id,
					buyerName: resolvedBuyerName,
					sellerId: c.seller_id,
					sellerName: resolvedSellerName,
					lastMessage: lastMsgText,
					updatedAt: c.updated_at,
					unreadCount,
					unread: unreadCount > 0,
				};
			});

			return {
				conversations: mappedConvs,
				messages: groupedMessages,
			};
		} catch (err) {
			console.error("messagesService error:", err);
			return { conversations: [], messages: {} };
		}
	},

	async markConversationRead(
		conversationId: string,
		currentUserId: string,
	): Promise<boolean> {
		if (!isSupabaseConfigured()) return true;
		try {
			const { error } = await (supabase.from as any)(
				"messages",
			)
				.update({ is_read: true })
				.eq("conversation_id", toValidUUID(conversationId))
				.neq("sender_id", toValidUUID(currentUserId))
				.eq("is_read", false);
			if (error) throw error;
			return true;
		} catch (err) {
			console.error(
				"messagesService.markConversationRead error:",
				err,
			);
			return false;
		}
	},

	/**
	 * Send a message to an existing conversation
	 */
	async sendMessage(
		msgId: string,
		conversationId: string,
		senderId: string,
		text: string,
	): Promise<boolean> {
		if (!isSupabaseConfigured()) return true;
		const cleanText = (text || "").trim().slice(0, MAX_MESSAGE_LENGTH);
		if (!cleanText) return false;

		try {
			const convUuid = toValidUUID(conversationId);
			const senderUuid = toValidUUID(senderId);

			const { error: messageError } = await (
				supabase.from as any
			)("messages").insert({
				id: toValidUUID(msgId),
				conversation_id: convUuid,
				sender_id: senderUuid,
				content: cleanText,
			});

			if (messageError) throw messageError;
			const { error: conversationError } = await (
				supabase.from as any
			)("conversations")
				.update({ updated_at: new Date().toISOString() })
				.eq("id", convUuid);
			if (conversationError) throw conversationError;
			return true;
		} catch (err) {
			console.error(
				"messagesService.sendMessage error:",
				err,
			);
			return false;
		}
	},

	/**
	 * Delete a single message
	 */
	async deleteMessage(messageId: string): Promise<boolean> {
		if (!isSupabaseConfigured()) return true;
		try {
			const { error } = await (supabase.from as any)("messages")
				.delete()
				.eq("id", toValidUUID(messageId));
			if (error) throw error;
			return true;
		} catch (err) {
			console.error("messagesService.deleteMessage error:", err);
			return false;
		}
	},

	/**
	 * Edit an existing message content
	 */
	async updateMessage(
		messageId: string,
		newText: string,
	): Promise<boolean> {
		if (!isSupabaseConfigured()) return true;
		const cleanText = (newText || "").trim().slice(0, MAX_MESSAGE_LENGTH);
		if (!cleanText) return false;

		try {
			const { error } = await (supabase.from as any)("messages")
				.update({
					content: cleanText,
					updated_at: new Date().toISOString(),
				})
				.eq("id", toValidUUID(messageId));
			if (error) throw error;
			return true;
		} catch (err) {
			console.error("messagesService.updateMessage error:", err);
			return false;
		}
	},

	/**
	 * Delete a conversation and all its messages
	 */
	async deleteConversation(conversationId: string): Promise<boolean> {
		if (!isSupabaseConfigured()) return true;
		try {
			const convUuid = toValidUUID(conversationId);

			// Supprimer les messages en premier (contrainte FK)
			const { error: messagesError } = await (supabase.from as any)(
				"messages",
			)
				.delete()
				.eq("conversation_id", convUuid);
			if (messagesError) throw messagesError;

			const { error: conversationError } = await (
				supabase.from as any
			)("conversations")
				.delete()
				.eq("id", convUuid);
			if (conversationError) throw conversationError;

			return true;
		} catch (err) {
			console.error(
				"messagesService.deleteConversation error:",
				err,
			);
			return false;
		}
	},

	/**
	 * Start a new conversation for a listing
	 */
	async startConversation(
		convId: string,
		firstMsgId: string,
		listingId: string,
		buyerId: string,
		sellerId: string,
		initialMessage: string,
	) {
		if (!isSupabaseConfigured()) return;
		try {
			const convUuid = toValidUUID(convId);
			const listingUuid = toValidUUID(listingId);
			const buyerUuid = toValidUUID(buyerId);
			const sellerUuid = toValidUUID(sellerId);
			const cleanInitial = (initialMessage || "")
				.trim()
				.slice(0, MAX_MESSAGE_LENGTH);

			await (supabase.from as any)("conversations").insert({
				id: convUuid,
				listing_id: listingUuid,
				buyer_id: buyerUuid,
				seller_id: sellerUuid,
			});

			if (cleanInitial) {
				await (supabase.from as any)("messages").insert({
					id: toValidUUID(firstMsgId),
					conversation_id: convUuid,
					sender_id: buyerUuid,
					content: cleanInitial,
				});
			}
		} catch (err) {
			console.error(
				"messagesService.startConversation error:",
				err,
			);
		}
	},
};
