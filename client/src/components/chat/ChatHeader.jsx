import { Link } from 'react-router-dom';
import { getSelectedAvatar } from '../../utils/avatarHelper';
import ChatHeaderMenu from './ChatHeaderMenu';

function ChatHeader({ 
  participant, 
  headerMenuOpen, 
  setHeaderMenuOpen, 
  onBlockToggle, 
  onDeleteConversation,
  blockLoading,
  isBlocked 
}) {
  return (
    <div className="px-4 h-12 border-b border-neutral-700 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img 
            src={getSelectedAvatar(participant)} 
            alt={participant?.username} 
            className="w-8 h-8 rounded-full object-cover"
          />
          {participant?.isOnline && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-neutral-900"></div>
          )}
        </div>
        <div>
          <Link 
            to={`/user/${participant?._id}`}
            className="text-white font-semibold hover:text-primary transition-all text-sm block"
          >
            {participant?.username}
          </Link>
          {participant?.isOnline ? (
            <span className="text-xs text-green-400">Online</span>
          ) : (
            <span className="text-xs text-gray-500">Offline</span>
          )}
        </div>
      </div>

      <ChatHeaderMenu
        participant={participant}
        headerMenuOpen={headerMenuOpen}
        setHeaderMenuOpen={setHeaderMenuOpen}
        onBlockToggle={onBlockToggle}
        onDeleteConversation={onDeleteConversation}
        blockLoading={blockLoading}
        isBlocked={isBlocked}
      />
    </div>
  );
}

export default ChatHeader;
