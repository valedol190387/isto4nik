# Environment Variables Setup

## 🔐 Security Warning
**NEVER commit real API keys or secrets to the repository!**

## 🛠️ Local Development Setup

1. Create `.env.local` file in the project root:
```bash
cp .env.example .env.local  # If .env.example exists
```

2. Add the following environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Panel Authentication
ADMIN_USERNAME=Isto4nik
ADMIN_PASSWORD=Isto4nik2024_$ecur3!

# NextAuth Configuration  
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

3. Get the actual values from:
   - Supabase Dashboard → Project Settings → API
   - Or ask the project maintainer securely

## 🚀 Deployment Setup

For production deployment, set these environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Railway: Project → Variables
- Netlify: Site Settings → Environment Variables

## 📁 Files Overview

- `.env.local` - Local development (gitignored)
- `.env.example` - Template without real values (can be committed)
- `ENV_SETUP.md` - This instruction file
