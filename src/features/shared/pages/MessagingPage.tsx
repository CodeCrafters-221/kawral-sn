import React, { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { useAuth } from "../../../context/AuthContext";
import { formatPriceFCFA } from "../../../utils/formatters";
import {
	Send,
	Phone,
	Trash2,
	Pencil,
	Check,
	X,
	ArrowLeft,
	MessageSquare,
	CheckCheck,
} from "lucide-react";

export const MessagingPage: React.FC = () => {
	const {
		conversations,
		messages,
		sendMessage,
		markConversationRead,
		deleteConversation,
		updateMessage,
		deleteMessage,
		currentUser,
	} = useApp();
	const { session, loading } = useAuth();
	const navigate = useNavigate();

	const [activeConvId, setActiveConvId] = useState<string>("");
	const [text, setText] = useState("");
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
	const [showMobileChat, setShowMobileChat] = useState<boolean>(false);

	// Édition inline
	const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
	const [editText, setEditText] = useState("");
	const editInputRef = useRef<HTMLInputElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Suppression message individuel (double-clic)
	const [confirmDeleteMsgId, setConfirmDeleteMsgId] = useState<string | null>(null);

	const myConversations = conversations.filter(
		(conv) =>
			currentUser &&
			(conv.buyerId === currentUser.id || conv.sellerId === currentUser.id),
	);

	const activeConv =
		myConversations.find((c) => c.id === activeConvId) ??
		myConversations[0] ??
		null;
	const activeMessages = activeConv ? messages[activeConv.id] || [] : [];

	useEffect(() => {
		if (!currentUser) return;
		const firstConversation = conversations.find(
			(conversation) =>
				conversation.buyerId === currentUser.id ||
				conversation.sellerId === currentUser.id,
		);
		if (firstConversation && !activeConvId) {
			setActiveConvId(firstConversation.id);
		}
		const activeConversation = conversations.find(
			(conversation) => conversation.id === activeConvId,
		);
		if (activeConversation?.unread) {
			void markConversationRead(activeConvId);
		}
	}, [
		activeConvId,
		conversations,
		currentUser,
		markConversationRead,
	]);

	// Auto-scroll en bas de discussion à chaque nouveau message ou ouverture de conv
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [activeMessages.length, activeConvId, showMobileChat]);

	// Focus automatique sur l'input d'édition quand il s'ouvre
	useEffect(() => {
		if (editingMsgId && editInputRef.current) {
			editInputRef.current.focus();
			editInputRef.current.select();
		}
	}, [editingMsgId]);

	if (loading) return null;
	if (!session || !currentUser)
		return <Navigate to="/auth/login" replace />;

	const handleSend = (e: React.FormEvent) => {
		e.preventDefault();
		if (!text.trim() || !activeConv) return;
		const isParticipant =
			activeConv.buyerId === currentUser.id ||
			activeConv.sellerId === currentUser.id;
		if (!isParticipant) return;
		sendMessage(activeConv.id, text.trim());
		setText("");
	};

	const handleOpenListing = () => {
		if (activeConv) {
			navigate(`/listings/${activeConv.listingId}`);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const handleDeleteConversation = async (convId: string) => {
		if (activeConvId === convId) {
			const next = myConversations.find((c) => c.id !== convId);
			setActiveConvId(next?.id ?? "");
			if (!next) setShowMobileChat(false);
		}
		setConfirmDeleteId(null);
		await deleteConversation(convId);
	};

	const EDIT_LIMIT_MS = 15 * 60 * 1000; // 15 minutes
	const DELETE_MSG_LIMIT_MS = 60 * 60 * 1000; // 1 heure (comme WhatsApp)

	const canEditMessage = (createdAt: string) => {
		return Date.now() - new Date(createdAt).getTime() < EDIT_LIMIT_MS;
	};

	const canDeleteMessage = (createdAt: string) => {
		return Date.now() - new Date(createdAt).getTime() < DELETE_MSG_LIMIT_MS;
	};

	const handleDoubleClickMsg = (msgId: string, createdAt: string) => {
		if (!canDeleteMessage(createdAt)) return;
		setConfirmDeleteMsgId(msgId);
	};

	const handleConfirmDeleteMsg = async (msgId: string) => {
		if (!activeConv) return;
		setConfirmDeleteMsgId(null);
		await deleteMessage(activeConv.id, msgId);
	};

	const handleStartEdit = (msgId: string, currentText: string) => {
		setEditingMsgId(msgId);
		setEditText(currentText);
	};

	const handleCancelEdit = () => {
		setEditingMsgId(null);
		setEditText("");
	};

	const handleConfirmEdit = async (msgId: string) => {
		if (!editText.trim() || !activeConv) return;
		await updateMessage(activeConv.id, msgId, editText.trim());
		setEditingMsgId(null);
		setEditText("");
	};

	const handleEditKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
		msgId: string,
	) => {
		if (e.key === "Enter") {
			e.preventDefault();
			void handleConfirmEdit(msgId);
		}
		if (e.key === "Escape") {
			handleCancelEdit();
		}
	};

	const handleSelectConversation = (convId: string) => {
		setActiveConvId(convId);
		setShowMobileChat(true);
	};

	return (
		<div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8 pb-16 min-h-0">
			<div className="bg-white rounded-2xl md:rounded-3xl border border-kawral-border shadow-lg overflow-hidden flex flex-col md:grid md:grid-cols-3 h-[calc(100dvh-12.5rem)] min-h-[500px] max-h-[840px]">
				{/* ════════════════════════════════════════════════════════════════
				    Left Col: Conversations List (Pleine largeur sur mobile quand chat fermé)
				    ════════════════════════════════════════════════════════════════ */}
				<div
					className={`md:border-r border-kawral-border flex-col min-h-0 h-full bg-kawral-ivory w-full ${
						showMobileChat ? "hidden md:flex" : "flex"
					}`}
				>
					<div className="p-3.5 sm:p-4 border-b border-kawral-border flex items-center justify-between shrink-0 bg-white/70 backdrop-blur-xs">
						<div>
							<h2 className="font-extrabold text-sm sm:text-base text-kawral-dark flex items-center gap-2">
								<MessageSquare className="w-4 h-4 text-kawral-green" />
								<span>Discussions Kawral</span>
							</h2>
							<p className="text-[11px] text-kawral-muted mt-0.5">
								Échanges directs vendeurs & clients
							</p>
						</div>
						<span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
							{myConversations.length} {myConversations.length > 1 ? "échanges" : "échange"}
						</span>
					</div>

					<div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-200/60">
						{myConversations.length === 0 ? (
							<div className="p-8 text-center space-y-3">
								<div className="w-12 h-12 rounded-full bg-emerald-50 text-kawral-green flex items-center justify-center mx-auto">
									<MessageSquare className="w-6 h-6" />
								</div>
								<h3 className="font-bold text-sm text-kawral-dark">Aucune conversation</h3>
								<p className="text-xs text-kawral-muted max-w-xs mx-auto">
									Contactez un vendeur depuis une annonce pour démarrer une discussion instantanée.
								</p>
								<button
									type="button"
									onClick={() => navigate("/explorer")}
									className="text-xs font-bold text-kawral-green hover:underline cursor-pointer"
								>
									Explorer les annonces →
								</button>
							</div>
						) : (
							myConversations.map((conv) => {
								const isSelected = activeConv?.id === conv.id;
								const avatar =
									conv.listingImage ||
									"https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80";
								const isConfirming = confirmDeleteId === conv.id;
								const contactName =
									currentUser.id === conv.sellerId
										? conv.buyerName
										: conv.sellerName;
								const contactRole =
									currentUser.id === conv.sellerId ? "Client" : "Vendeur";
								const hasUnread = (conv.unreadCount ?? 0) > 0;

								return (
									<div
										key={conv.id}
										className={`relative group flex items-start gap-3 p-3 sm:p-4 transition-colors cursor-pointer ${
											isSelected
												? "bg-white font-bold md:border-l-4 md:border-kawral-green"
												: "hover:bg-slate-100/80 bg-kawral-ivory"
										}`}
									>
										{/* Zone cliquable principale */}
										<button
											type="button"
											onClick={() => handleSelectConversation(conv.id)}
											className="flex items-start gap-3 flex-1 min-w-0 text-left cursor-pointer"
										>
											<div className="relative shrink-0">
												<img
													src={avatar}
													alt=""
													className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border border-slate-200"
												/>
												{hasUnread && (
													<span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-kawral-orange text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-sm">
														{conv.unreadCount}
													</span>
												)}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between gap-1">
													<div className="flex items-center gap-1.5 min-w-0">
														<h4 className={`text-xs truncate ${hasUnread ? "font-extrabold text-kawral-dark" : "font-bold text-kawral-dark"}`}>
															{contactName}
														</h4>
														<span className="text-[9px] font-bold text-kawral-muted bg-slate-200/80 px-1.5 py-0.2 rounded-md shrink-0">
															{contactRole}
														</span>
													</div>
													<span className="text-[10px] text-kawral-muted shrink-0 ml-1">
														{conv.updatedAt
															? new Date(
																	conv.updatedAt,
																).toLocaleTimeString([], {
																	hour: "2-digit",
																	minute: "2-digit",
																})
															: ""}
													</span>
												</div>
												<p title={conv.listingTitle} className="text-[11px] font-semibold text-kawral-green truncate mt-0.5">
													{conv.listingTitle}
												</p>
												<p className={`text-[11px] truncate mt-0.5 ${hasUnread ? "font-bold text-kawral-dark" : "text-kawral-muted"}`}>
													{conv.lastMessage || "Début de la discussion"}
												</p>
											</div>
										</button>

										{/* Bouton supprimer */}
										{isConfirming ? (
											<div className="flex items-center gap-1 shrink-0 self-center">
												<button
													type="button"
													onClick={() => handleDeleteConversation(conv.id)}
													className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg transition-colors cursor-pointer"
												>
													Confirmer
												</button>
												<button
													type="button"
													onClick={() => setConfirmDeleteId(null)}
													className="text-[10px] font-bold text-kawral-muted hover:text-kawral-dark px-2 py-1 rounded-lg transition-colors cursor-pointer"
												>
													Annuler
												</button>
											</div>
										) : (
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													setConfirmDeleteId(conv.id);
												}}
												className="shrink-0 self-center p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
												title="Supprimer la conversation"
											>
												<Trash2 className="w-3.5 h-3.5" />
											</button>
										)}
									</div>
								);
							})
						)}
					</div>
				</div>

				{/* ════════════════════════════════════════════════════════════════
				    Right 2 Cols: Active Chat Window (Pleine largeur sur mobile quand chat actif)
				    ════════════════════════════════════════════════════════════════ */}
				{activeConv ? (
					<div
						className={`md:col-span-2 flex-col min-h-0 h-full bg-white w-full ${
							showMobileChat ? "flex" : "hidden md:flex"
						}`}
					>
						{/* WhatsApp-Style Chat Header */}
						<div className="p-2.5 sm:p-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-2 shrink-0 shadow-2xs z-10">
							<div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
								{/* Bouton Retour sur Mobile */}
								<button
									type="button"
									onClick={() => setShowMobileChat(false)}
									className="md:hidden p-2 -ml-1 text-slate-600 hover:text-kawral-green hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
									title="Retour à la liste des discussions"
									aria-label="Retour"
								>
									<ArrowLeft className="w-5 h-5" />
								</button>

								<div
									onClick={handleOpenListing}
									className="flex items-center gap-2.5 cursor-pointer group min-w-0 flex-1"
								>
									<img
										src={
											activeConv.listingImage ||
											"https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=300&q=80"
										}
										alt=""
										className="w-10 h-10 sm:w-11 sm:h-11 rounded-full sm:rounded-xl object-cover group-hover:opacity-85 transition-opacity shrink-0 border border-slate-200"
									/>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-1.5 min-w-0">
											<h3 className="font-extrabold text-xs sm:text-sm text-kawral-dark truncate">
												{currentUser.id === activeConv.sellerId
													? activeConv.buyerName
													: activeConv.sellerName}
											</h3>
											<span className="text-[9px] font-bold text-kawral-green bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full shrink-0">
												{currentUser.id === activeConv.sellerId ? "Client" : "Vendeur"}
											</span>
										</div>
										<p
											title={activeConv.listingTitle}
											className="text-[11px] font-medium text-slate-500 group-hover:text-kawral-green transition-colors truncate"
										>
											{activeConv.listingTitle} · <span className="font-bold text-kawral-green">{formatPriceFCFA(activeConv.listingPrice)}</span>
										</p>
									</div>
								</div>
							</div>

							<div className="flex items-center gap-1.5 shrink-0">
								<button
									type="button"
									onClick={handleOpenListing}
									className="px-2.5 sm:px-3 py-1.5 bg-kawral-green hover:bg-kawral-darkgreen text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
									title="Voir l'annonce / Détails"
								>
									<Phone className="w-3.5 h-3.5 text-kawral-orange" />
									<span className="hidden sm:inline">Appeler</span>
								</button>
							</div>
						</div>

						{/* Chat Messages Stream Log */}
						<div className="flex-1 min-h-0 p-3 sm:p-5 overflow-y-auto space-y-3 sm:space-y-3.5 bg-[#efeae2]/30 bg-radial from-slate-50 to-slate-100/60">
							<div className="text-center my-1.5">
								<span className="bg-white/90 backdrop-blur-xs text-kawral-muted text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
									Début de la conversation concernant cette annonce
								</span>
							</div>

							{activeMessages.map((msg) => {
								const isMe = msg.senderId === currentUser.id;
								const isEditing = editingMsgId === msg.id;
								const isConfirmingDelete = confirmDeleteMsgId === msg.id;
								const editable = isMe && canEditMessage(msg.createdAt);
								const deletable = isMe && canDeleteMessage(msg.createdAt);
								const timeString = msg.createdAt
									? new Date(msg.createdAt).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})
									: "";

								return (
									<div
										key={msg.id}
										className={`flex items-end gap-1.5 sm:gap-2 ${isMe ? "justify-end" : "justify-start"}`}
									>
										{/* Bouton modifier — uniquement pour ses propres messages */}
										{isMe && !isEditing && !isConfirmingDelete && (
											<button
												type="button"
												onClick={() =>
													editable
														? handleStartEdit(msg.id, msg.text)
														: undefined
												}
												disabled={!editable}
												className={`p-1 rounded-lg transition-colors mb-1 shrink-0 ${
													editable
														? "text-slate-400 hover:text-kawral-green hover:bg-emerald-50 cursor-pointer"
														: "text-slate-200 cursor-not-allowed"
												}`}
												title={
													editable
														? "Modifier le message (15 min)"
														: "Modification expirée"
												}
											>
												<Pencil className="w-3 h-3" />
											</button>
										)}

										<div
											className={`max-w-[85%] sm:max-w-md rounded-2xl text-xs leading-relaxed shadow-xs transition-all ${
												isMe
													? "bg-kawral-green text-white rounded-tr-xs"
													: "bg-white text-kawral-dark border border-slate-200/90 rounded-tl-xs"
											} ${deletable && isMe && !isEditing ? "cursor-pointer select-none" : ""}`}
											onDoubleClick={() =>
												isMe && !isEditing
													? handleDoubleClickMsg(msg.id, msg.createdAt)
													: undefined
											}
										>
											{isConfirmingDelete ? (
												/* Confirmation suppression */
												<div className="p-3 flex flex-col gap-2">
													<p className="text-[11px] font-semibold text-center text-white">
														Supprimer ce message ?
													</p>
													<div className="flex gap-2 justify-center">
														<button
															type="button"
															onClick={() => void handleConfirmDeleteMsg(msg.id)}
															className="text-[10px] font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors text-white cursor-pointer"
														>
															Supprimer
														</button>
														<button
															type="button"
															onClick={() => setConfirmDeleteMsgId(null)}
															className="text-[10px] font-bold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors text-white cursor-pointer"
														>
															Annuler
														</button>
													</div>
												</div>
											) : isEditing ? (
												/* Mode édition inline */
												<div className="p-2 flex items-center gap-1.5">
													<input
														ref={editInputRef}
														type="text"
														value={editText}
														onChange={(e) => setEditText(e.target.value)}
														onKeyDown={(e) => handleEditKeyDown(e, msg.id)}
														className="flex-1 bg-white/20 text-white placeholder-white/60 rounded-lg px-2 py-1 text-xs outline-none border border-white/30 focus:border-white/60 min-w-0"
													/>
													<button
														type="button"
														onClick={() => void handleConfirmEdit(msg.id)}
														className="p-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors shrink-0 cursor-pointer"
														title="Valider"
													>
														<Check className="w-3 h-3 text-white" />
													</button>
													<button
														type="button"
														onClick={handleCancelEdit}
														className="p-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors shrink-0 cursor-pointer"
														title="Annuler"
													>
														<X className="w-3 h-3 text-white" />
													</button>
												</div>
											) : (
												/* Affichage normal d'une bulle WhatsApp */
												<div className="px-3.5 py-2.5">
													{!isMe && (
														<span className="block text-[10px] font-extrabold text-kawral-green mb-0.5 truncate">
															{msg.senderName}
														</span>
													)}
													<p className="font-normal text-xs sm:text-[13px] leading-relaxed break-words whitespace-pre-wrap">
														{msg.text}
													</p>
													<div
														className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-medium ${
															isMe ? "text-emerald-100" : "text-slate-400"
														}`}
													>
														<span>{timeString}</span>
														{isMe && <CheckCheck className="w-3.5 h-3.5 text-white/90" />}
													</div>
												</div>
											)}
										</div>
									</div>
								);
							})}
							<div ref={messagesEndRef} />
						</div>

						{/* WhatsApp-Style Input Message Form */}
						<form
							onSubmit={handleSend}
							className="p-2.5 sm:p-3.5 border-t border-slate-200/90 bg-white/95 backdrop-blur-md flex items-center gap-2 shrink-0"
						>
							<div className="flex-1 relative flex items-center">
								<input
									type="text"
									placeholder="Écrivez un message..."
									value={text}
									onChange={(e) => setText(e.target.value)}
									className="w-full py-2.5 sm:py-3 px-4 bg-kawral-ivory border border-slate-200 focus:border-kawral-green focus:bg-white rounded-full text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-slate-400"
								/>
							</div>
							<button
								type="submit"
								disabled={!text.trim()}
								className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-kawral-green hover:bg-kawral-darkgreen disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 shadow-md active:scale-95 transition-all cursor-pointer"
								title="Envoyer le message"
							>
								<Send className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white ml-0.5" />
							</button>
						</form>
					</div>
				) : (
					<div
						className={`md:col-span-2 items-center justify-center p-8 text-center text-xs text-kawral-muted ${
							showMobileChat ? "flex" : "hidden md:flex"
						}`}
					>
						{myConversations.length === 0
							? "Aucune conversation disponible."
							: "Sélectionnez une discussion pour démarrer."}
					</div>
				)}
			</div>
		</div>
	);
};
