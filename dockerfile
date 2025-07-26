FROM node:22.17.0-alpine AS deps
RUN corepack enable pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22.17.0-alpine
RUN corepack enable pnpm
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./
COPY . .
CMD ["pnpm", "start"]
