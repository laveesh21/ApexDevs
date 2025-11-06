export const threadsData = [
  {
    id: 1,
    type: 'Question',
    title: 'How to implement authentication in React with JWT?',
    content: `I'm building a React application and need to implement user authentication using JWT tokens. I've been reading various tutorials but I'm confused about the best practices.

Here are my main questions:

1. **Where should I store the JWT token?** - I've seen people use localStorage, sessionStorage, and cookies. What's the most secure approach?

2. **How do I handle token refresh?** - Should I implement a refresh token system or just make users re-login when the token expires?

3. **How do I protect routes?** - What's the best way to create protected routes that require authentication?

4. **State management** - Should I use Context API, Redux, or another solution to manage the authentication state across my app?

Here's what I have so far:

\`\`\`javascript
// api/auth.js
export const login = async (credentials) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};
\`\`\`

Is this approach secure? Any suggestions would be greatly appreciated!`,
    author: 'Sarah Chen',
    authorAvatar: '👩‍💻',
    votes: 45,
    views: 1234,
    tags: ['React', 'JavaScript', 'Authentication'],
    category: 'Questions',
    createdAt: '2 hours ago',
    answers: [
      {
        id: 101,
        author: 'David Martinez',
        authorAvatar: '👨‍💼',
        content: `Great question! Let me address each of your concerns:

**1. Token Storage:**
For web applications, **httpOnly cookies** are the most secure option. They're not accessible via JavaScript, which protects against XSS attacks. Here's why:

- ❌ localStorage: Vulnerable to XSS attacks
- ❌ sessionStorage: Same XSS vulnerability
- ✅ httpOnly cookies: Secure against XSS

**2. Token Refresh:**
Yes, implement a refresh token system. Here's a basic pattern:

\`\`\`javascript
const refreshAccessToken = async () => {
  const response = await fetch('/api/refresh', {
    method: 'POST',
    credentials: 'include' // sends httpOnly cookie
  });
  return response.json();
};
\`\`\`

**3. Protected Routes:**
Create a PrivateRoute component:

\`\`\`javascript
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};
\`\`\`

**4. State Management:**
Context API is sufficient for most apps. Only use Redux if you need complex state management elsewhere too.

Hope this helps!`,
        votes: 52,
        createdAt: '1 hour ago',
        isAccepted: true
      },
      {
        id: 102,
        author: 'Emma Wilson',
        authorAvatar: '👩‍🔬',
        content: `I'd also recommend checking out libraries like **Auth0** or **Firebase Authentication** if you want a managed solution. They handle all the security concerns for you and provide SDKs for React.

For learning purposes though, building it yourself is great! Just make sure to:
- Always use HTTPS in production
- Implement CSRF protection
- Set appropriate token expiration times
- Hash passwords with bcrypt on the backend`,
        votes: 23,
        createdAt: '45 minutes ago',
        isAccepted: false
      }
    ]
  },
  {
    id: 2,
    type: 'Discussion',
    title: 'Best practices for structuring a Node.js REST API',
    content: `I've been building Node.js APIs for a couple of years now, but I'm always curious about how others structure their projects. What are the current best practices for organizing a Node.js REST API?

**My current structure:**

\`\`\`
src/
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
└── config/
\`\`\`

**Questions I have:**

1. **Layer separation** - Do you use a service layer between controllers and models?
2. **Error handling** - What's your pattern for handling errors across the application?
3. **Validation** - Where do you validate request data? Middleware or controllers?
4. **Configuration** - How do you manage environment-specific configs?

Would love to hear different perspectives and learn from your experiences!`,
    author: 'Michael Torres',
    authorAvatar: '👨‍💻',
    votes: 78,
    views: 2456,
    tags: ['Node.js', 'JavaScript', 'API'],
    category: 'Discussions',
    createdAt: '5 hours ago',
    answers: [
      {
        id: 201,
        author: 'Rachel Green',
        authorAvatar: '👩‍🎨',
        content: `I strongly recommend adding a **service layer**. It helps separate business logic from HTTP concerns:

\`\`\`
src/
├── controllers/     # HTTP request/response handling
├── services/        # Business logic
├── repositories/    # Data access
├── models/          # Data models
├── routes/
├── middleware/
└── utils/
\`\`\`

This makes testing much easier and keeps your code organized. Controllers should be thin - just validate input and call services.`,
        votes: 45,
        createdAt: '4 hours ago',
        isAccepted: true
      },
      {
        id: 202,
        author: 'Kevin Zhang',
        authorAvatar: '👨‍🔧',
        content: `For error handling, I use a centralized error handler middleware:

\`\`\`javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
\`\`\`

Then create custom error classes for different scenarios.`,
        votes: 31,
        createdAt: '3 hours ago',
        isAccepted: false
      }
    ]
  },
  {
    id: 3,
    type: 'Show & Tell',
    title: 'Built a real-time collaborative code editor',
    content: `Hey everyone! I'm excited to share a project I've been working on for the past few months - a **real-time collaborative code editor** built with modern web technologies.

**🎯 Features:**
- Real-time collaborative editing (like Google Docs but for code)
- Syntax highlighting for 20+ languages
- Live cursors showing where other users are typing
- Integrated terminal
- File tree navigation
- Dark/Light themes
- User presence indicators

**🛠️ Tech Stack:**
- **Frontend:** React + Vite
- **Editor:** Monaco Editor (same as VS Code)
- **Real-time:** Socket.io
- **State sync:** Yjs (CRDT for conflict-free editing)
- **Backend:** Node.js + Express
- **Styling:** TailwindCSS

**🔗 Links:**
- **Live Demo:** https://collab-editor-demo.com
- **GitHub:** https://github.com/alexkim/collab-editor
- **Docs:** https://collab-editor-docs.com

**💭 Some interesting challenges I solved:**

1. **Conflict Resolution** - Using Yjs (a CRDT library) to handle simultaneous edits without conflicts
2. **Performance** - Optimized rendering to handle large files (10k+ lines) smoothly
3. **Cursor Sync** - Custom implementation to show remote cursors with user names

The codebase is fully open source and I've documented the architecture extensively. Would love to hear your feedback and answer any questions!

**What I learned:**
- WebSocket connections at scale need proper load balancing
- CRDT algorithms are fascinating but complex
- Monaco Editor's API is powerful but has a learning curve`,
    author: 'Alex Kim',
    authorAvatar: '👨‍🚀',
    votes: 156,
    views: 3892,
    tags: ['JavaScript', 'WebSockets', 'React'],
    category: 'Show & Tell',
    createdAt: '1 day ago',
    answers: [
      {
        id: 301,
        author: 'Tom Brown',
        authorAvatar: '👨‍🏫',
        content: `This is incredible! I've been wanting to build something similar. A few questions:

1. How do you handle authentication and room permissions?
2. What's your strategy for scaling WebSocket connections?
3. Did you consider using WebRTC for peer-to-peer instead of server-mediated?

Great work!`,
        votes: 42,
        createdAt: '20 hours ago',
        isAccepted: false
      },
      {
        id: 302,
        author: 'Lisa Wang',
        authorAvatar: '👩‍🚀',
        content: `Amazing project! The cursor sync feature is so smooth. I looked at your code and learned a lot about Yjs. One suggestion - you might want to add a "follow mode" where you can follow another user's cursor. I've seen that in Figma and it's super helpful for pair programming!`,
        votes: 28,
        createdAt: '18 hours ago',
        isAccepted: false
      }
    ]
  }
];
