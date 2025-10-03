# Todo Vue App

A modern Vue 3 + TypeScript + Vite todo application with a Go backend.

## Environment Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=10000
```

### Environment Variables

- `VITE_API_BASE_URL`: The base URL for the API backend (default: `http://localhost:3000/api/v1`)
- `VITE_API_TIMEOUT`: Request timeout in milliseconds (default: `10000`)

### Development vs Production

- **Development**: Uses `http://localhost:3000/api/v1` by default
- **Production**: Set `VITE_API_BASE_URL` to your production API URL

### Environment Examples

**Development (.env):**
```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=10000
```

**Production (.env.production):**
```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_API_TIMEOUT=15000
```

**Staging (.env.staging):**
```bash
VITE_API_BASE_URL=https://staging-api.yourdomain.com/api/v1
VITE_API_TIMEOUT=12000
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   npm run setup-env
   ```
   
   Or manually:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your configuration

4. Start the development server:
   ```bash
   npm run dev
   ```

## Build and Deployment

### Build for Production

```bash
npm run build
```

### Environment-specific Builds

Vite automatically loads environment files based on the mode:

- `.env` - loaded in all cases
- `.env.local` - loaded in all cases, ignored by git
- `.env.[mode]` - only loaded in specified mode
- `.env.[mode].local` - only loaded in specified mode, ignored by git

**Build for staging:**
```bash
npm run build -- --mode staging
```

**Build for production:**
```bash
npm run build -- --mode production
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables in Production

For production deployments, set environment variables in your deployment platform:

- **Vercel**: Add environment variables in project settings
- **Netlify**: Add environment variables in site settings
- **Docker**: Use `-e` flag or docker-compose environment section
