FROM node:21-alpine AS base


# --- Installer ---
FROM base AS installer
WORKDIR /gitcord

RUN apk add --no-cache libc6-compat
RUN apk update

# Install dependencies
COPY . .
RUN yarn --immutable
RUN yarn prisma generate
RUN yarn build

# Remove dev-dependencies from node_modules
RUN yarn pinst --disable
RUN yarn workspaces focus --production --all


# --- Runner ---
FROM base AS runner
WORKDIR /gitcord

ENV NODE_ENV="production"

# Set the user
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app

# Copy over the application
COPY --from=installer --chown=app:app /gitcord/dist ./dist
COPY --from=installer --chown=app:app /gitcord/prisma ./prisma

# Copy over the packages
COPY --from=installer --chown=app:app /gitcord/yarn.lock yarn.lock
COPY --from=installer --chown=app:app /gitcord/package.json package.json
COPY --from=installer --chown=app:app /gitcord/node_modules node_modules

CMD yarn start