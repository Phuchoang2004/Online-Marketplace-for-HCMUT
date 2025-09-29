# TypeScript Frontend Template

A modern, production-ready React TypeScript template with multi-layer architecture, featuring authentication, routing, state management, and a beautiful UI built with Ant Design.

## 🚀 Features

### ✨ Core Features
- **🔐 Authentication System** - Complete login/logout with protected routes
- **🎨 Beautiful UI** - Ant Design components with custom theme tokens
- **🌙 Dark/Light Theme** - Toggle between themes with persistent storage
- **📱 Responsive Layout** - Mobile-friendly design with collapsible sidebar
- **🔄 State Management** - React Query for server state + Context API for client state
- **🛣️ Routing** - React Router with protected routes and navigation
- **🎯 TypeScript** - Full type safety throughout the application
- **⚡ Fast Development** - Vite for lightning-fast builds and HMR

### 🏗️ Architecture Layers
- **📁 Config Layer** - Environment variables, theme tokens, and app configuration
- **🔌 Service Layer** - API client with interceptors and error handling  
- **🎣 Hooks Layer** - Custom React hooks for data fetching and state management
- **🧱 Component Layer** - Reusable UI components organized by feature
- **📄 Page Layer** - Route-specific page components
- **🌐 Context Layer** - Global state management with React Context
- **⚠️ Error Handling** - Error boundaries and centralized error management

## 📸 Screenshots

### Login Page
![Login Page](https://github.com/user-attachments/assets/6757c768-a779-4270-b95a-28e6d3414762)

### Dashboard (Light Theme)
![Dashboard Light](https://github.com/user-attachments/assets/6df0baa6-9c91-47bd-a80c-1e72c5596b03)

### Dashboard (Collapsed Sidebar)
![Dashboard Collapsed](https://github.com/user-attachments/assets/fdc7f907-e55b-4234-9026-356618243dc9)

### Profile Page
![Profile Page](https://github.com/user-attachments/assets/79903eb8-82fc-4eea-9e7e-5bf0efee4732)

### Settings (Dark Theme)
![Settings Dark](https://github.com/user-attachments/assets/5316fa39-bf37-4580-b518-a6e2c93943de)

## 🛠️ Technology Stack

- **⚛️ React 18** - Latest React with hooks and concurrent features
- **🔷 TypeScript** - Type-safe JavaScript development
- **⚡ Vite** - Next generation frontend tooling
- **🎨 Ant Design 5** - Enterprise-class UI design language
- **🔄 TanStack Query** - Powerful data synchronization for React
- **🛣️ React Router 6** - Declarative routing for React
- **🍪 js-cookie** - Simple cookie handling
- **📡 Axios** - Promise-based HTTP client

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Phuchoang2004/Template.git
   cd Template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to configure your API endpoints and other settings.

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials
```
Email: admin@example.com
Password: admin123
```

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   ├── routing/        # Routing configuration
│   └── ui/             # Generic UI components
├── config/             # Configuration files
│   ├── env.ts          # Environment variables
│   ├── routes.ts       # Route constants
│   └── theme.ts        # Ant Design theme configuration
├── contexts/           # React Context providers
│   └── AppContext.tsx  # Global app state
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard page
│   ├── profile/        # Profile page
│   └── settings/       # Settings page
├── services/           # API services
│   ├── api.ts          # HTTP client configuration
│   └── auth.ts         # Authentication service
├── types/              # TypeScript type definitions
│   ├── api.ts          # API-related types
│   ├── auth.ts         # Authentication types
│   └── common.ts       # Common types
├── utils/              # Utility functions
│   └── error.ts        # Error handling utilities
├── App.tsx             # Main App component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Your App Name
NODE_ENV=development
```

### Theme Customization
Edit `src/config/theme.ts` to customize colors, fonts, and other design tokens:

```typescript
export const customTheme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    // ... other tokens
  },
};
```

## 🔐 Authentication

The template includes a complete authentication system:

- **Login/Logout** - Form-based authentication with validation
- **Protected Routes** - Automatic redirection for unauthorized users
- **Token Management** - Secure token storage and refresh
- **User Context** - Global user state management

### Implementing Real Authentication

Replace the mock authentication in `src/services/auth.ts` with your actual API calls:

```typescript
async login(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/auth/login', credentials);
}
```

## 🎨 UI Components

### Layout Components
- **Header** - Navigation bar with user menu and theme toggle
- **Sidebar** - Collapsible navigation menu
- **Footer** - Application footer
- **MainLayout** - Main layout wrapper

### Page Components
- **LoginPage** - Authentication form
- **DashboardPage** - Main dashboard with statistics
- **ProfilePage** - User profile management
- **SettingsPage** - Application settings

## 📡 API Integration

The template includes a configured HTTP client with:

- **Request/Response Interceptors** - Automatic token attachment and error handling
- **Error Handling** - Centralized error processing
- **TypeScript Support** - Fully typed API responses

### Making API Calls

```typescript
// Using the service layer
const user = await authService.getCurrentUser();

// Using React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['user'],
  queryFn: () => authService.getCurrentUser(),
});
```

## 🌙 Theme System

### Features
- **Light/Dark Mode** - Toggle between themes
- **Persistent Storage** - Theme preference saved to localStorage
- **Custom Tokens** - Easy customization of colors and design
- **Ant Design Integration** - Seamless theme switching

### Usage
```typescript
const { theme, toggleTheme } = useApp();

// Toggle theme
<Switch checked={theme === 'dark'} onChange={toggleTheme} />
```

## 🔄 State Management

### Server State (React Query)
- **Data Fetching** - Automatic caching and synchronization
- **Mutations** - Optimistic updates and error handling
- **Background Refetching** - Keep data fresh

### Client State (Context API)
- **App Settings** - Theme, sidebar state, user preferences
- **Global State** - Cross-component state sharing

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

The build files will be generated in the `dist/` directory.

### Deploy to Vercel
```bash
npx vercel --prod
```

### Deploy to Netlify
```bash
npm run build
npx netlify deploy --prod --dir=dist
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The library for web and native user interfaces
- [Ant Design](https://ant.design/) - The world's second most popular React UI framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [TanStack Query](https://tanstack.com/query) - Powerful data synchronization for React

## 📞 Support

If you have any questions or need help, please:

1. Check the [documentation](README.md)
2. Search existing [issues](https://github.com/Phuchoang2004/Template/issues)
3. Create a new [issue](https://github.com/Phuchoang2004/Template/issues/new)

---

Made with ❤️ using React, TypeScript & Ant Design