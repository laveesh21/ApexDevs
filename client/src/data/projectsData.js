// Shared project data for the application
export const projectsData = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce platform with user authentication, product management, and payment integration.',
    author: 'Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop'
    ],
    techStack: ['React', 'Node.js', 'MongoDB', 'Express'],
    longDescription: `This comprehensive e-commerce platform provides a complete shopping experience for users and powerful management tools for administrators. Built with modern web technologies, it offers a seamless, responsive interface that works perfectly on all devices.

The platform includes user authentication with JWT tokens, allowing customers to create accounts, save their preferences, and track their order history. The product catalog is dynamic and easily manageable through an admin dashboard.

Key features include a shopping cart with real-time updates, multiple payment gateway integrations, order tracking, inventory management, and detailed analytics for business insights. The application is built with scalability in mind, using MongoDB for flexible data storage and Node.js for high-performance backend operations.`,
    features: [
      'User authentication and authorization',
      'Product catalog with search and filters',
      'Shopping cart and checkout process',
      'Payment gateway integration (Stripe, PayPal)',
      'Order tracking and history',
      'Admin dashboard for product management',
      'Inventory management system',
      'Email notifications',
      'Responsive design for all devices',
      'Analytics and reporting'
    ],
    links: {
      demo: 'https://demo-ecommerce.example.com',
      github: 'https://github.com/sarahjohnson/ecommerce-platform',
      youtube: 'https://youtube.com/watch?v=example',
      documentation: 'https://docs.example.com'
    },
    releaseDate: 'October 2025',
    lastUpdated: 'November 2025',
    license: 'MIT'
  },
  {
    id: 2,
    title: 'Social Media Dashboard',
    description: 'An analytics dashboard for tracking social media metrics and engagement across multiple platforms.',
    author: 'Michael Chen',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&h=500&fit=crop'
    ],
    techStack: ['Vue.js', 'Python', 'Django', 'PostgreSQL'],
    longDescription: `A powerful analytics dashboard that aggregates data from multiple social media platforms to provide comprehensive insights into your online presence. Track engagement, followers, post performance, and more across Twitter, Instagram, Facebook, and LinkedIn.

The dashboard features real-time data visualization with interactive charts and graphs, making it easy to understand trends and patterns in your social media activity. Set custom goals and receive notifications when milestones are reached.

Built with Vue.js for a reactive user interface and Django for robust backend operations, this application handles large amounts of data efficiently while providing a smooth user experience.`,
    features: [
      'Multi-platform integration (Twitter, Instagram, Facebook, LinkedIn)',
      'Real-time analytics and metrics',
      'Interactive data visualization',
      'Custom reporting and exports',
      'Engagement tracking',
      'Follower growth analytics',
      'Post scheduling capability',
      'Sentiment analysis',
      'Competitor comparison',
      'Automated insights and recommendations'
    ],
    links: {
      demo: 'https://demo-dashboard.example.com',
      github: 'https://github.com/michaelchen/social-dashboard',
      youtube: 'https://youtube.com/watch?v=example2'
    },
    releaseDate: 'September 2025',
    lastUpdated: 'October 2025',
    license: 'Apache 2.0'
  },
  {
    id: 3,
    title: 'Task Management App',
    description: 'A collaborative task management tool with real-time updates and team features.',
    author: 'Emily Davis',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=500&fit=crop'
    ],
    techStack: ['React', 'Firebase', 'Tailwind CSS', 'TypeScript'],
    longDescription: `A modern task management application designed for teams to collaborate effectively. Create projects, assign tasks, set deadlines, and track progress all in one place. Real-time synchronization ensures everyone stays updated.

The application uses Firebase for real-time database capabilities, allowing instant updates across all connected devices. Built with TypeScript for type safety and Tailwind CSS for a beautiful, responsive design.

Perfect for remote teams, freelancers, or anyone looking to organize their work more efficiently.`,
    features: [
      'Real-time task synchronization',
      'Team collaboration features',
      'Project organization and categorization',
      'Deadline tracking and reminders',
      'File attachments support',
      'Comments and discussions',
      'Progress visualization',
      'Mobile responsive design',
      'Customizable task priorities',
      'Activity history and audit logs'
    ],
    links: {
      demo: 'https://demo-taskmanager.example.com',
      github: 'https://github.com/emilydavis/task-manager'
    },
    releaseDate: 'August 2025',
    lastUpdated: 'November 2025',
    license: 'MIT'
  },
  {
    id: 4,
    title: 'Weather Forecast App',
    description: 'A beautiful weather application with 7-day forecasts and location-based predictions.',
    author: 'David Martinez',
    image: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1561553543-4e08065c8b25?w=800&h=500&fit=crop'
    ],
    techStack: ['JavaScript', 'HTML', 'CSS', 'React'],
    longDescription: `Get accurate weather forecasts with beautiful visualizations and an intuitive interface. This weather app provides current conditions, hourly forecasts, and 7-day predictions for any location worldwide.

Uses multiple weather APIs to ensure accuracy and reliability. Features include radar maps, severe weather alerts, and detailed meteorological data for weather enthusiasts.`,
    features: [
      'Current weather conditions',
      '7-day weather forecast',
      'Hourly predictions',
      'Location-based weather',
      'Weather radar maps',
      'Severe weather alerts',
      'UV index and air quality',
      'Wind speed and direction',
      'Sunrise/sunset times',
      'Favorite locations'
    ],
    links: {
      demo: 'https://demo-weather.example.com',
      github: 'https://github.com/davidmartinez/weather-app',
      youtube: 'https://youtube.com/watch?v=weather-demo'
    },
    releaseDate: 'July 2025',
    lastUpdated: 'October 2025',
    license: 'MIT'
  },
  {
    id: 5,
    title: 'Fitness Tracker',
    description: 'Track your workouts, calories, and fitness goals with detailed analytics and progress charts.',
    author: 'Jessica Lee',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=500&fit=crop'
    ],
    techStack: ['React Native', 'Node.js', 'MongoDB', 'GraphQL'],
    longDescription: `A comprehensive fitness tracking application that helps you achieve your health and fitness goals. Track workouts, monitor nutrition, and visualize your progress with detailed charts and statistics.

Built as a mobile-first application using React Native, it works seamlessly on both iOS and Android devices. The GraphQL API provides efficient data fetching and real-time updates.`,
    features: [
      'Workout tracking and logging',
      'Calorie and nutrition monitoring',
      'Progress charts and analytics',
      'Custom workout plans',
      'Exercise library with demonstrations',
      'Goal setting and tracking',
      'Social features and challenges',
      'Integration with fitness devices',
      'Personal records tracking',
      'Workout reminders and notifications'
    ],
    links: {
      demo: 'https://demo-fitness.example.com',
      github: 'https://github.com/jessicalee/fitness-tracker',
      youtube: 'https://youtube.com/watch?v=fitness-demo'
    },
    releaseDate: 'June 2025',
    lastUpdated: 'November 2025',
    license: 'MIT'
  },
  {
    id: 6,
    title: 'Portfolio Website Builder',
    description: 'Create stunning portfolio websites with drag-and-drop interface and customizable templates.',
    author: 'Alex Thompson',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=500&fit=crop'
    ],
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
    longDescription: `Build professional portfolio websites without writing code. Choose from beautiful templates, customize colors and layouts, and publish your portfolio in minutes.

Perfect for designers, developers, photographers, and creatives who want to showcase their work online. Features custom domain support and SEO optimization.`,
    features: [
      'Drag-and-drop website builder',
      'Professional templates',
      'Customizable themes and colors',
      'Portfolio project showcase',
      'Contact form integration',
      'SEO optimization',
      'Custom domain support',
      'Analytics dashboard',
      'Mobile responsive designs',
      'Easy content management'
    ],
    links: {
      demo: 'https://demo-portfolio-builder.example.com',
      github: 'https://github.com/alexthompson/portfolio-builder',
      documentation: 'https://docs.portfolio-builder.example.com'
    },
    releaseDate: 'May 2025',
    lastUpdated: 'October 2025',
    license: 'Commercial'
  },
  {
    id: 7,
    title: 'Recipe Sharing Platform',
    description: 'Share and discover recipes from around the world with ratings, comments, and cooking tips.',
    author: 'Olivia Brown',
    image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=500&fit=crop'
    ],
    techStack: ['Angular', 'Spring Boot', 'MySQL', 'Docker'],
    longDescription: `A community-driven platform for food lovers to share and discover recipes from around the world. Rate recipes, leave comments, save favorites, and create your own cookbook collection.

Built with Angular and Spring Boot for a robust, scalable application. Docker containerization ensures easy deployment and consistent environments.`,
    features: [
      'Recipe creation and sharing',
      'Advanced search and filters',
      'Ratings and reviews',
      'Comments and cooking tips',
      'Save favorite recipes',
      'Create custom cookbooks',
      'Ingredient scaling',
      'Nutritional information',
      'Shopping list generation',
      'Recipe recommendations'
    ],
    links: {
      demo: 'https://demo-recipes.example.com',
      github: 'https://github.com/oliviabrown/recipe-platform'
    },
    releaseDate: 'April 2025',
    lastUpdated: 'September 2025',
    license: 'GPL-3.0'
  },
  {
    id: 8,
    title: 'Blog CMS',
    description: 'A content management system for bloggers with markdown support and SEO optimization.',
    author: 'James Wilson',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop'
    ],
    techStack: ['React', 'Express', 'MongoDB', 'Redux'],
    longDescription: `A powerful content management system designed specifically for bloggers. Write posts in markdown, organize with tags and categories, and optimize for search engines automatically.

Features a clean, distraction-free writing interface and powerful admin tools for managing your blog content.`,
    features: [
      'Markdown editor with preview',
      'Post scheduling',
      'Categories and tags',
      'SEO optimization tools',
      'Media library',
      'Comments moderation',
      'User management',
      'Analytics integration',
      'Custom themes',
      'RSS feed generation'
    ],
    links: {
      demo: 'https://demo-blog-cms.example.com',
      github: 'https://github.com/jameswilson/blog-cms'
    },
    releaseDate: 'March 2025',
    lastUpdated: 'November 2025',
    license: 'MIT'
  },
  {
    id: 9,
    title: 'Real Estate Marketplace',
    description: 'Browse, list, and manage property listings with advanced search and filtering options.',
    author: 'Sophia Garcia',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=500&fit=crop'
    ],
    techStack: ['Vue.js', 'Flask', 'PostgreSQL', 'Bootstrap'],
    longDescription: `A comprehensive real estate marketplace connecting buyers, sellers, and agents. Search properties by location, price, features, and more. Virtual tours and detailed property information make finding your dream home easier.`,
    features: [
      'Property listings with photos',
      'Advanced search filters',
      'Interactive map view',
      'Virtual property tours',
      'Agent profiles',
      'Favorite listings',
      'Price alerts',
      'Mortgage calculator',
      'Neighborhood information',
      'Contact and inquiry system'
    ],
    links: {
      demo: 'https://demo-realestate.example.com',
      github: 'https://github.com/sophiagarcia/real-estate'
    },
    releaseDate: 'February 2025',
    lastUpdated: 'October 2025',
    license: 'Commercial'
  },
  {
    id: 10,
    title: 'Music Streaming App',
    description: 'Stream your favorite music with playlists, recommendations, and offline mode.',
    author: 'Daniel Kim',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=500&fit=crop'
    ],
    techStack: ['React', 'Node.js', 'MongoDB', 'Redux'],
    longDescription: `A modern music streaming application with millions of songs at your fingertips. Create playlists, discover new artists, and enjoy music offline.

Built with React and Node.js for optimal performance and smooth playback experience.`,
    features: [
      'Music streaming library',
      'Playlist creation and management',
      'Personalized recommendations',
      'Offline download mode',
      'Artist and album pages',
      'Search functionality',
      'Social sharing',
      'Queue management',
      'Lyrics display',
      'Audio quality settings'
    ],
    links: {
      demo: 'https://demo-music.example.com',
      github: 'https://github.com/danielkim/music-streaming'
    },
    releaseDate: 'January 2025',
    lastUpdated: 'November 2025',
    license: 'MIT'
  },
  {
    id: 11,
    title: 'Online Learning Platform',
    description: 'Educational platform with video courses, quizzes, and progress tracking for students.',
    author: 'Rachel Anderson',
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=500&fit=crop'
    ],
    techStack: ['Next.js', 'Python', 'Django', 'PostgreSQL'],
    longDescription: `An interactive learning platform offering courses on various topics. Watch video lectures, take quizzes, and track your progress as you learn new skills.

Perfect for students, professionals, and lifelong learners looking to expand their knowledge.`,
    features: [
      'Video course library',
      'Interactive quizzes',
      'Progress tracking',
      'Certificates of completion',
      'Discussion forums',
      'Instructor profiles',
      'Course ratings and reviews',
      'Learning paths',
      'Mobile app support',
      'Bookmarking and notes'
    ],
    links: {
      demo: 'https://demo-learning.example.com',
      github: 'https://github.com/rachelanderson/learning-platform',
      youtube: 'https://youtube.com/watch?v=learning-demo'
    },
    releaseDate: 'December 2024',
    lastUpdated: 'October 2025',
    license: 'MIT'
  },
  {
    id: 12,
    title: 'Crypto Portfolio Tracker',
    description: 'Track your cryptocurrency investments with real-time prices and portfolio analytics.',
    author: 'Kevin White',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=500&fit=crop'
    ],
    techStack: ['React', 'TypeScript', 'GraphQL', 'Tailwind CSS'],
    longDescription: `Keep track of your cryptocurrency investments with real-time price updates and detailed analytics. Monitor your portfolio performance, set price alerts, and stay informed about market trends.

Supports all major cryptocurrencies and exchanges with automatic portfolio syncing.`,
    features: [
      'Real-time price tracking',
      'Portfolio analytics',
      'Price alerts',
      'Historical data charts',
      'Multiple portfolio support',
      'Exchange integration',
      'Profit/loss calculations',
      'Market news feed',
      'Watchlist functionality',
      'Tax reporting tools'
    ],
    links: {
      demo: 'https://demo-crypto-tracker.example.com',
      github: 'https://github.com/kevinwhite/crypto-tracker',
      documentation: 'https://docs.crypto-tracker.example.com'
    },
    releaseDate: 'November 2024',
    lastUpdated: 'November 2025',
    license: 'MIT'
  }
];
