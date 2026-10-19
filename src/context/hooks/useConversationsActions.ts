import { Conversation, Message, Listing } from "../../types";
import { generateUUID } from "../../utils/uuid";
import { messagesService } from "../../services/supabase/messagesService";

interface UseConversationsActionsParams {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  messages: Record<string, Message[]>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  currentUserId: string | undefined;
  currentUserName: string | undefined;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export function useConversationsActions({
  conversations,
  setConversations,
  messages,
  setMessages,
  currentUserId,
  currentUserName,
  addToast,
}: UseConversationsActionsParams) {
  const sendMessage = async (conversationId: string, text: string) => {
    if (!text.trim()) return;
    if (!currentUserId) {
      addToast("Veuillez vous connecter pour envoyer un message.", "error");
      return;
    }
    const msgId = generateUUID();
    const newMsg: Message = {
      id: msgId,
      conversationId,
      senderId: currentUserId,
      senderName: currentUserName || "Utilisateur",
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, lastMessage: text, updatedAt: new Date().toISOString() }
          : conv,
      ),
    );
    const sent = await messagesService.sendMessage(
      msgId,
      conversationId,
      currentUserId,
      text,
    );
    if (!sent) {
      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).filter(
          (message) => message.id !== msgId,
        ),
      }));
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, lastMessage: "Discussion" }
            : conv,
        ),
      );
      addToast("Impossible d’envoyer le message.", "error");
    }
  };

  const startConversation = (
    listing: Listing,
    initialMessage: string,
  ): string => {
    if (!currentUserId) {
      addToast("Veuillez vous connecter pour contacter le vendeur.", "error");
      return "";
    }

    const existing = conversations.find(
      (c) =>
        c.listingId === listing.id &&
        c.buyerId === currentUserId,
    );
    if (existing) {
      if (initialMessage.trim()) sendMessage(existing.id, initialMessage);
      return existing.id;
    }

    const convId = generateUUID();
    const firstMsgId = generateUUID();

    const newConv: Conversation = {
      id: convId,
      listingId: listing.id,
      listingTitle: listing.title,
      listingImage: listing.images[0] || "",
      listingPrice: listing.price,
      buyerId: currentUserId,
      buyerName: currentUserName || "Utilisateur",
      sellerId: listing.ownerId,
      sellerName: listing.owner.name,
      lastMessage: initialMessage,
      updatedAt: new Date().toISOString(),
      unread: false,
    };
    setConversations((prev) => [newConv, ...prev]);

    const firstMsg: Message = {
      id: firstMsgId,
      conversationId: convId,
      senderId: currentUserId,
      senderName: currentUserName || "Utilisateur",
      text: initialMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => ({ ...prev, [convId]: [firstMsg] }));

    messagesService.startConversation(
      convId,
      firstMsgId,
      listing.id,
      currentUserId,
      listing.ownerId,
      initialMessage,
    );
    addToast("Message envoyé au vendeur !", "success");
    return convId;
  };

  const deleteConversation = async (conversationId: string) => {
    // Optimistic : retirer du state immédiatement
    setConversations((prev) =>
      prev.filter((c) => c.id !== conversationId),
    );
    setMessages((prev) => {
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });

    const ok = await messagesService.deleteConversation(conversationId);
    if (!ok) {
      addToast("Impossible de supprimer la conversation.", "error");
    } else {
      addToast("Conversation supprimée.", "info");
    }
  };

  const updateMessage = async (
    conversationId: string,
    messageId: string,
    newText: string,
  ) => {
    if (!newText.trim()) return;

    // Optimistic update
    setMessages((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map((m) =>
        m.id === messageId ? { ...m, text: newText } : m,
      ),
    }));

    const ok = await messagesService.updateMessage(messageId, newText);
    if (!ok) {
      addToast("Impossible de modifier le message.", "error");
    }
  };

  const deleteMessage = async (
    conversationId: string,
    messageId: string,
  ) => {
    // Optimistic : retirer du state immédiatement
    setMessages((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).filter(
        (m) => m.id !== messageId,
      ),
    }));

    const ok = await messagesService.deleteMessage(messageId);
    if (!ok) {
      addToast("Impossible de supprimer le message.", "error");
    }
  };

  return { sendMessage, startConversation, deleteConversation, updateMessage, deleteMessage };
}
