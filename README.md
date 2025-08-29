# Restaurant & Food Tracker App

A comprehensive food and restaurant tracking application that allows users to log their dining experiences, rate restaurants and dishes, track pricing, and maintain a personal food diary with detailed feedback.

![Login Page](https://github.com/user-attachments/assets/c93b8350-8e92-4060-8621-eb57998ee76f)

![Dashboard](https://github.com/user-attachments/assets/204fa03b-fc24-46ad-8f02-4d6508ba8a3b)

![Restaurants Page](https://github.com/user-attachments/assets/c23b16ab-9e73-4315-b9c0-9f619ef10687)

## Features

- **Restaurant Management**: Add, search, and rate restaurants with detailed information
- **User Authentication**: Secure JWT-based login and registration system
- **Food Item Tracking**: Log dishes with ratings, photos, and ingredients (coming soon)
- **Pricing & Budget Tracking**: Record costs and analyze spending patterns (coming soon)
- **Personal Feedback System**: Detailed reviews and ratings (coming soon)
- **Analytics & Insights**: Spending patterns and dining analytics (coming soon)
- **Mobile-First Design**: Responsive web application with clean, modern UI

## Tech Stack

- **Frontend**: React 18 with TypeScript, Styled Components, React Router
- **Backend**: Node.js with Express.js RESTful API
- **Database**: SQLite with comprehensive schema
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **UI/UX**: Mobile-first responsive design with gradient backgrounds and modern styling

## Project Structure

```
├── backend/                    # Node.js Express API
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Auth and other middleware
│   │   ├── routes/            # API routes
│   │   └── index.js          # Server entry point
│   └── package.json
├── frontend/                   # React TypeScript app
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts (Auth)
│   │   ├── pages/             # Route components
│   │   ├── services/          # API services
│   │   ├── types/             # TypeScript type definitions
│   │   └── App.tsx            # Main app component
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
   Backend will be available at `http://localhost:3001`

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```
   Frontend will be available at `http://localhost:3000`

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

#### Restaurants
- `GET /api/restaurants` - Get all restaurants (protected)
- `POST /api/restaurants` - Create restaurant (protected)
- `GET /api/restaurants/:id` - Get specific restaurant (protected)
- `PUT /api/restaurants/:id` - Update restaurant (protected)
- `DELETE /api/restaurants/:id` - Delete restaurant (protected)
- `GET /api/restaurants/cuisine-types` - Get cuisine types (protected)

#### Health Check
- `GET /api/health` - Server health check

## Database Schema

The application uses SQLite with the following main tables:

- **users** - User authentication and profile information
- **restaurants** - Restaurant details and metadata
- **categories** - Cuisine and dish categories
- **food_items** - Individual dishes and their properties
- **visits** - User restaurant visits with ratings and feedback
- **visit_food_items** - Many-to-many relationship for dishes per visit
- **restaurant_photos** - Photo uploads for restaurants

## Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT token authentication with 7-day expiration
- Request rate limiting (100 requests per 15 minutes)
- Input validation with Joi
- CORS protection
- Helmet.js security headers

## Responsive Design

The application features a mobile-first design approach with:

- Responsive navigation that adapts to screen size
- Touch-friendly interface elements
- Optimized layouts for mobile, tablet, and desktop
- Progressive Web App capabilities
- Clean, modern UI with gradient backgrounds

## Development Status

### ✅ Completed Features
- Complete backend API with authentication
- Restaurant CRUD operations
- User registration and login system
- Responsive React frontend
- Dashboard with welcome interface
- Restaurant listing and management
- Professional UI/UX design
- Database schema and migrations

### 🚧 In Progress / Coming Soon
- Food item tracking functionality
- Visit logging and rating system
- Image upload capabilities
- Analytics and insights dashboard
- Advanced search and filtering
- PWA features and offline mode
- Export functionality

## Contributing

Please follow the conventional commit format:
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Code formatting changes
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Build process or auxiliary tool changes

## License

MIT License