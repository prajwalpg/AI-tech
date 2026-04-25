# Deployment Guide

## Database Migration
Since Sahayak now uses PostgreSQL (e.g., Neon free tier) instead of SQLite, you need to run an initial migration when deploying or setting up locally:

```bash
npx prisma migrate dev --name init
```

## Setup Neon PostgreSQL
1. Go to [Neon.tech](https://neon.tech/) and create a free project.
2. Select PostgreSQL 15+.
3. Copy the pooled connection string (with `?pgbouncer=true` if using Prisma, or the direct one depending on your setup).
4. Add it to your Vercel or local `.env` as `DATABASE_URL`.
