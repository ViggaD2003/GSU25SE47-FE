# School Psychology Web Application

A modern React application built with Vite for school psychology management, featuring multi-language support, theme switching, and authentication.

## 🚀 Features

### ✅ Theme Configuration

- **Ant Design Theme**: Latest version with `ConfigProvider` support
- **Light/Dark Mode**: Toggle between themes using `theme.algorithm`
- **Persistent Storage**: Theme preference saved in localStorage
- **Tailwind Integration**: Dark mode support with `darkMode: 'class'`

### ✅ Internationalization (i18n)

- **react-i18next**: Full i18n support with language detection
- **Languages**: Vietnamese (default) and English
- **Persistent Storage**: Language preference saved in localStorage
- **Dynamic Switching**: Real-time language switching

### ✅ Routing & Authentication

- **react-router-dom**: Client-side routing with BrowserRouter
- **Protected Routes**: Authentication-based route protection
- **Login System**: Demo authentication (admin/admin)
- **Auto Redirect**: Redirect to dashboard after login

### ✅ Modern Development Setup

- **Vite**: Fast build tool and development server
- **ESLint**: Code linting with React hooks support
- **Prettier**: Code formatting with custom configuration
- **Tailwind CSS**: Utility-first CSS framework

## 📁 Project Structure

```
src/
├── components/          # Shared UI components
│   ├── ThemeSwitcher.jsx
│   ├── LanguageSwitcher.jsx
│   └── ProtectedRoute.jsx
├── contexts/           # React contexts
│   ├── ThemeContext.jsx
│   ├── LanguageContext.jsx
│   └── AuthContext.jsx
├── locales/           # Translation files
│   ├── vi/translation.json
│   └── en/translation.json
├── pages/             # Application pages
│   ├── Login.jsx
│   └── Dashboard.jsx
├── i18n.js           # i18n configuration
├── App.jsx           # Main app component
└── main.jsx          # Application entry point
```

## 🛠️ Installation & Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Build for production:**

   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## 🔧 Development Commands

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🔐 Demo Credentials

- **Username:** `admin`
- **Password:** `admin`

## 🎨 Theme & Language

- **Theme Toggle:** Available in header (sun/moon icon)
- **Language Switch:** Available in header (globe icon with dropdown)
- **Persistence:** Both preferences are saved in localStorage

## 🌐 Supported Languages

- 🇻🇳 **Vietnamese (vi)** - Default language
- 🇺🇸 **English (en)** - Secondary language

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile devices

## 🔧 Configuration Files

- `tailwind.config.js` - Tailwind CSS configuration
- `vite.config.js` - Vite build configuration
- `eslint.config.js` - ESLint rules and settings
- `prettier.config.js` - Code formatting rules

## 🚀 Deployment

The application can be deployed to any static hosting service:

1. Run `npm run build`
2. Deploy the `dist` folder to your hosting service

## 📝 License

This project is private and proprietary.
