# Environment Variables Setup

## Required Environment Variables

### NEXT_PUBLIC_APP_URL

This is the base URL of your application. It's used for:
- Password reset email redirects
- OAuth redirects (if implemented later)
- API callbacks

**Where to get it:**

1. **During Development:**
   \`\`\`
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   \`\`\`

2. **For Production (Vercel):**
   - After deploying to Vercel, your URL will be: `https://your-project-name.vercel.app`
   - Or if you have a custom domain: `https://yourdomain.com`

3. **For Production (Other platforms):**
   - Use your actual domain: `https://condoflow.yourdomain.com`

### Complete .env.local file example:

\`\`\`env
# Supabase Configuration (already provided)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database URLs (if using direct Postgres connection)
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
\`\`\`

## Setup Instructions:

1. Create a `.env.local` file in your project root
2. Add the environment variables above
3. Replace the placeholder values with your actual values
4. Restart your development server after adding new environment variables

## Important Notes:

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Never put sensitive keys (like service role keys) in `NEXT_PUBLIC_` variables
- The `NEXT_PUBLIC_APP_URL` should match exactly where your app is hosted
\`\`\`
</QuickEdit>
