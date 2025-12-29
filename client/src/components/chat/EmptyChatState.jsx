function EmptyChatState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      </div>
      <h3 className="text-base font-semibold text-white mb-2">No conversation selected</h3>
      <p className="text-gray-400 text-sm max-w-sm">Choose a conversation from the sidebar to start messaging</p>
    </div>
  );
}

export default EmptyChatState;
