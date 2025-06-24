# Source Code Structure

This document outlines the organization of the `/src` directory for the School Psychology Management System.

## 📁 Directory Structure

```
src/
├── assets/          # Static assets
│   ├── icons/       # SVG icons, favicons
│   └── images/      # Images, logos, backgrounds
├── components/      # Reusable React components
│   ├── auth/        # Authentication related components
│   ├── common/      # Common/shared UI components
│   ├── layout/      # Layout and navigation components
│   └── index.js     # Component exports
├── constants/       # Application constants and configuration
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── locales/         # Internationalization files
│   ├── en/          # English translations
│   └── vi/          # Vietnamese translations
├── pages/           # Page components (route components)
│   └── auth/        # Authentication pages
├── routes/          # Routing configuration
├── services/        # API services and external integrations
├── store/           # Redux store configuration
│   ├── actions/     # Redux actions
│   └── slices/      # Redux slices
└── utils/           # Utility functions and helpers
```

## 🔄 Import Aliases

Path aliases are configured for cleaner imports:

- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@pages/*` → `./src/pages/*`
- `@hooks/*` → `./src/hooks/*`
- `@utils/*` → `./src/utils/*`
- `@constants/*` → `./src/constants/*`
- `@services/*` → `./src/services/*`
- `@store/*` → `./src/store/*`
- `@assets/*` → `./src/assets/*`

### Usage Examples:

```javascript
// Instead of: import { Layout } from '../../../components/layout/Layout'
import { Layout } from '@components'

// Instead of: import { API_BASE_URL } from '../../constants'
import { API_BASE_URL } from '@constants'
```

## 📋 Guidelines

### Components

- **common/**: Reusable UI components (buttons, inputs, modals)
- **layout/**: Layout components (header, sidebar, footer)
- **auth/**: Authentication specific components (login forms, guards)

### Pages

- Each page should be in its own file
- Group related pages in subdirectories
- Use PascalCase for component names

### Services

- API calls and external service integrations
- Each service should have a clear, single responsibility
- Use proper error handling

### Store

- Use Redux Toolkit for state management
- Organize by feature slices
- Keep actions and reducers co-located

### Utils

- Pure functions only
- Well-tested utility functions
- Group related utilities together

## 🛠️ Development

The project uses:

- **Vite** for build tooling
- **React 19** for UI
- **Ant Design** for UI components
- **Redux Toolkit** for state management
- **React Router** for routing
- **i18next** for internationalization
- **Tailwind CSS** for styling
