# Chat Components

This folder contains all modular components for the chat feature, organized for maintainability and reusability.

## Structure

```
chat/
├── index.js                 # Export all components
├── ChatSidebar.jsx          # Left sidebar with conversations list
├── ConversationItem.jsx     # Individual conversation in sidebar
├── ChatHeader.jsx           # Chat header with participant info
├── ChatHeaderMenu.jsx       # Dropdown menu in chat header
├── MessagesList.jsx         # Container for all messages
├── MessageItem.jsx          # Individual message component
├── MessageInput.jsx         # Input box for sending messages
├── UserAvatar.jsx           # Reusable avatar component with fallback
└── EmptyChatState.jsx       # Empty state when no chat selected
```

## Custom Hook

**`/hooks/useChat.js`** - Contains all chat logic:
- State management (conversations, messages, loading states)
- API calls (fetch conversations, send messages, etc.)
- Real-time polling for new messages
- Online status updates
- Block/unblock functionality
- Message scrolling logic

## Components Overview

### ChatSidebar
Displays the list of conversations with:
- User's avatar with online status
- Conversation items
- Empty state for no conversations

**Props:**
- `user` - Current user object
- `conversations` - Array of conversation objects
- `selectedConversation` - Currently selected conversation
- `onSelectConversation` - Handler for selecting a conversation
- `formatTime` - Time formatting function

### ConversationItem
Individual conversation in the sidebar with:
- Participant avatar and online status
- Last message preview
- Unread count badge
- Timestamp

**Props:**
- `conversation` - Conversation object
- `isSelected` - Boolean for active state
- `onSelect` - Click handler
- `formatTime` - Time formatting function

### ChatHeader
Header section showing:
- Participant avatar and name
- Online/offline status
- Menu button

**Props:**
- `participant` - Participant user object
- `headerMenuOpen` - Menu open state
- `setHeaderMenuOpen` - Menu state setter
- `onBlockToggle` - Block/unblock handler
- `onDeleteConversation` - Delete handler
- `blockLoading` - Loading state
- `isBlocked` - Block status

### ChatHeaderMenu
Dropdown menu with options:
- View profile
- Block/unblock user
- Delete conversation

### MessagesList
Container for rendering messages with:
- Empty state for no messages
- Message grouping logic
- Scroll reference

**Props:**
- `messages` - Array of message objects
- `currentUser` - Current user object
- `selectedConversation` - Current conversation
- `formatTime` - Time formatting function
- `messagesEndRef` - Ref for auto-scrolling

### MessageItem
Individual message display with:
- Avatar (Discord-style grouping)
- Username and timestamp
- Message content
- Hover timestamp

**Props:**
- `message` - Message object
- `isOwnMessage` - Boolean for own/other message
- `showAvatar` - Boolean for avatar display
- `currentUser` - Current user object
- `participant` - Other participant object
- `formatTime` - Time formatting function

### MessageInput
Input area for sending messages with:
- Auto-expanding textarea
- Send button with loading state
- Enter to send, Shift+Enter for new line
- Character limit (2000)

**Props:**
- `newMessage` - Message text state
- `setNewMessage` - State setter
- `onSendMessage` - Submit handler
- `onKeyDown` - Keyboard handler
- `sending` - Loading state
- `participantUsername` - For placeholder

### UserAvatar
Reusable avatar component with:
- Size variants (sm, md, lg)
- Fallback icon if no avatar
- Optional online status indicator
- Error handling

**Props:**
- `user` - User object
- `size` - 'sm' | 'md' | 'lg' (default: 'md')
- `showOnlineStatus` - Boolean for status dot

### EmptyChatState
Placeholder when no conversation is selected.

## Usage Example

```jsx
import Chat from './pages/Chat';

// The Chat component handles everything internally
<Route path="/chat/:userId?" element={<Chat />} />
```

## Features

✅ **Modular Architecture** - Each component has a single responsibility
✅ **Custom Hook** - All business logic separated from UI
✅ **Reusable Components** - UserAvatar can be used anywhere
✅ **Type Safety Ready** - Easy to add PropTypes or TypeScript
✅ **Easy to Test** - Components and logic are separated
✅ **Easy to Extend** - Add new features without touching existing code

## Future Enhancements

- Add TypeScript interfaces
- Implement WebSocket for real-time messages
- Add message reactions
- Add file/image sharing
- Add typing indicators
- Add message search
- Add conversation pinning
