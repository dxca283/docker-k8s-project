# Docker + Neon Database Project

A Node.js/Express application with PostgreSQL database support, dockerized with separate configurations for local development (using Neon Local) and production (using Neon Cloud).

## Architecture

### Development Environment

- Uses **Neon Local** Docker proxy to create ephemeral database branches
- Each `docker compose up` creates a fresh database branch from your Neon project
- Branch is automatically deleted when containers stop (configurable)
- Supports per-git-branch database persistence

### Production Environment

- Connects directly to **Neon Cloud** database
- No local proxy needed
- Environment variables injected at runtime

## Prerequisites

- Docker and Docker Compose installed
- A Neon account and project ([sign up here](https://neon.tech))
- Your Neon API key and project ID

## Quick Start

### 1. Get Your Neon Credentials

1. Create a Neon project at [console.neon.tech](https://console.neon.tech)
2. Get your **API Key** from [Neon Console → Account Settings → API Keys](https://neon.tech/docs/manage/api-keys)
3. Get your **Project ID** from Neon Console → Project Settings → General

### 2. Configure Development Environment

Copy the development environment template:

```bash
cp .env.development .env.development.local
```

Edit `.env.development.local` and add your credentials:

```env
NEON_API_KEY=your_api_key_here
NEON_PROJECT_ID=your_project_id_here
PARENT_BRANCH_ID=main
DATABASE_NAME=neondb
```

### 3. Run Development Environment

Start the app with Neon Local:

```bash
docker compose -f docker-compose.dev.yml --env-file .env.development.local up --build
```

The application will:

- Create a new ephemeral Neon database branch from `main`
- Connect to it via the Neon Local proxy
- Be available at `http://localhost:3000`
- Auto-reload on code changes

To stop and clean up (deletes the ephemeral branch):

```bash
docker compose -f docker-compose.dev.yml down
```

### 4. Run Database Migrations

While containers are running, run migrations:

```bash
# Generate migrations (if schema changed)
docker compose -f docker-compose.dev.yml exec app npm run db:generate

# Apply migrations
docker compose -f docker-compose.dev.yml exec app npm run db:migrate

# Open Drizzle Studio (database GUI)
docker compose -f docker-compose.dev.yml exec app npm run db:studio
```

## Production Deployment

### 1. Configure Production Environment

Create `.env.production` with your Neon Cloud connection string:

```env
NODE_ENV=production
DATABASE_URL=postgres://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_secure_secret_here
ARCJET_KEY=your_arcjet_key_here
```

Get your `DATABASE_URL` from Neon Console → Connection Details.

### 2. Build and Run Production Container

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up --build
```

Or using Docker directly:

```bash
docker build --target prod -t my-app:prod .
docker run -p 3000:3000 --env-file .env.production my-app:prod
```

### 3. Production Deployment Tips

- **Never commit** `.env.production` or any file with real secrets
- Use secrets management in your production environment (AWS Secrets Manager, Kubernetes Secrets, etc.)
- Inject `DATABASE_URL` and other secrets via environment variables
- Run database migrations before deploying new code

## Environment Variables

### Development (Neon Local)

| Variable           | Description                              | Required               |
| ------------------ | ---------------------------------------- | ---------------------- |
| `NEON_API_KEY`     | Your Neon API key                        | ✅ Yes                 |
| `NEON_PROJECT_ID`  | Your Neon project ID                     | ✅ Yes                 |
| `PARENT_BRANCH_ID` | Branch to create ephemeral branches from | No (default: `main`)   |
| `DATABASE_NAME`    | Database name in your Neon project       | No (default: `neondb`) |
| `DELETE_BRANCH`    | Delete branch on container stop          | No (default: `true`)   |

### Production (Neon Cloud)

| Variable       | Description                       | Required |
| -------------- | --------------------------------- | -------- |
| `DATABASE_URL` | Full Neon Cloud connection string | ✅ Yes   |
| `JWT_SECRET`   | Secret for JWT signing            | ✅ Yes   |
| `ARCJET_KEY`   | Arcjet API key                    | No       |

### Common Variables

| Variable    | Description                              | Default |
| ----------- | ---------------------------------------- | ------- |
| `PORT`      | Server port                              | `3000`  |
| `NODE_ENV`  | Environment (`development`/`production`) | -       |
| `LOG_LEVEL` | Logging level (`debug`/`info`/`error`)   | `info`  |

## How It Works

### Neon Local (Development)

The app connects to Neon Local proxy at `neon-local:5432`. The proxy:

1. Creates an ephemeral branch of your Neon database when containers start
2. Routes all database queries to that branch in Neon Cloud
3. Deletes the branch when containers stop (unless `DELETE_BRANCH=false`)

In `src/config/database.js`, when `NEON_LOCAL_HOST` is set:

```javascript
neonConfig.fetchEndpoint = `http://neon-local:5432/sql`;
neonConfig.useSecureWebSocket = false;
neonConfig.poolQueryViaFetch = true;
```

### Neon Cloud (Production)

The app connects directly to your Neon Cloud database using `DATABASE_URL`. No proxy is used.

## Persistent Branches per Git Branch

To keep a separate Neon branch for each Git branch (useful for feature development):

1. Set `DELETE_BRANCH=false` in `.env.development.local`
2. The compose file already mounts `.neon_local/` and `.git/HEAD`
3. Each Git branch will have its own persistent Neon database branch

Add `.neon_local/` to `.gitignore` (already configured).

## Troubleshooting

### "DATABASE_URL is not set" error

Make sure you're passing the correct env file:

```bash
docker compose -f docker-compose.dev.yml --env-file .env.development.local up
```

### Neon Local can't create branches

- Verify your `NEON_API_KEY` has the correct permissions
- Check that `NEON_PROJECT_ID` matches your project
- Ensure the `PARENT_BRANCH_ID` branch exists in your Neon project

### Port 5432 already in use

If you have PostgreSQL running locally:

```bash
# Stop local PostgreSQL, or change the port in docker-compose.dev.yml:
# ports:
#   - "15432:5432"
```

### Docker on Mac: Git branch detection not working

Ensure Docker Desktop uses **gRPC FUSE** instead of VirtioFS (Docker Settings → General).

## Project Structure

```
.
├── src/
│   ├── config/
│   │   └── database.js       # Database connection (Neon serverless driver)
│   ├── models/               # Drizzle ORM models
│   ├── services/             # Business logic
│   ├── app.js                # Express app setup
│   └── index.js              # Entry point
├── drizzle/                  # Database migrations
├── logs/                     # Application logs
├── Dockerfile                # Multi-stage build (dev + prod)
├── docker-compose.dev.yml    # Development with Neon Local
├── docker-compose.prod.yml   # Production with Neon Cloud
├── .env.development          # Dev environment template
└── .env.production           # Prod environment template
```

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Local Guide](https://neon.tech/docs/local/neon-local)
- [Drizzle ORM](https://orm.drizzle.team)
- [Docker Compose](https://docs.docker.com/compose)

## License

ISC
