# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies (including dev deps for the dev image)
COPY package.json package-lock.json ./
RUN npm ci


FROM deps AS dev
WORKDIR /app
ENV NODE_ENV=development

COPY . .
RUN mkdir -p logs

EXPOSE 3000
CMD ["npm", "run", "dev"]


FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy runtime source
COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.js ./
RUN mkdir -p logs

EXPOSE 3000
CMD ["npm", "start"]
