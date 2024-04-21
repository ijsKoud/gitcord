FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# --- Builder ---
FROM base AS builder
WORKDIR /gitcord

RUN apk add --no-cache libc6-compat
RUN apk update

# Copy obly the needed files
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm add turbo --global
COPY . .
RUN turbo prune --scope=api --docker


# --- Installer ---
FROM base AS installer
WORKDIR /gitcord

RUN apk add --no-cache libc6-compat
RUN apk update

# Install dependencies
COPY .gitignore .gitignore
COPY --from=builder /gitcord/out/json/ .
COPY pnpm-lock.yaml ./pnpm-lock.yaml

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /gitcord/out/full/ .
COPY --from=builder /gitcord/tsconfig.json tsconfig.json
RUN pnpm turbo build --filter=api

# Remove dev-dependencies from node_modules
RUN pnpm pinst --disable
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod


# --- Runner ---
FROM base AS runner

WORKDIR /gitcord

ENV NODE_ENV="production"

# Set the user
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app

# Copy over the application
COPY --from=installer --chown=app:app /gitcord/apps/api/dist ./apps/api/dist
COPY --from=installer --chown=app:app /gitcord/apps/api/node_modules ./apps/api/node_modules
COPY --from=installer --chown=app:app /gitcord/apps/api/package.json ./apps/api/package.json

# Copy over the packages
COPY --from=installer --chown=app:app /gitcord/package.json package.json
COPY --from=installer --chown=app:app /gitcord/node_modules node_modules

# @/database
COPY --from=installer --chown=app:app /gitcord/packages/database/dist ./packages/database/dist
COPY --from=installer --chown=app:app /gitcord/packages/database/node_modules ./packages/database/node_modules
COPY --from=installer --chown=app:app /gitcord/packages/database/package.json ./packages/database/package.json

# @/shared
COPY --from=installer --chown=app:app /gitcord/packages/shared/dist ./packages/shared/dist
COPY --from=installer --chown=app:app /gitcord/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=installer --chown=app:app /gitcord/packages/shared/package.json ./packages/shared/package.json

CMD node ./apps/api/dist/index.js