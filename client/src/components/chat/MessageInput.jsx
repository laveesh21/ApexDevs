function MessageInput({ 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  onKeyDown, 
  sending, 
  participantUsername 
}) {
  return (
    <form className="px-4 pb-6" onSubmit={onSendMessage}>
      <div className="flex items-center gap-3 bg-neutral-800 rounded-lg px-4 py-2.5 border border-neutral-700 focus-within:border-primary/50 transition-all">
        <textarea
          rows="1"
          className="flex-1 bg-transparent text-white text-sm outline-none resize-none max-h-32 placeholder-gray-500"
          placeholder={`Message @${participantUsername}`}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={sending}
          maxLength={2000}
        />
        <button
          type="submit"
          className={`flex-shrink-0 transition-all ${
            sending || !newMessage.trim()
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-gray-200 hover:text-gray-200/80'
          }`}
          disabled={sending || !newMessage.trim()}
          aria-label="Send message"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}

export default MessageInput;
