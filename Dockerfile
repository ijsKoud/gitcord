FROM node:20-alpine
WORKDIR /gitcord

# Copy Existing Files
COPY package.json yarn.lock .yarnrc.yml tsconfig.json ./
COPY .yarn ./.yarn
COPY src ./src
COPY prisma ./prisma

# Install dependencies & build the application
RUN yarn install --immutable
RUN yarn prisma generate
RUN yarn build

# Register Environment Variables
ENV NODE_ENV="production"

# Run NodeJS script
CMD ["yarn", "run", "start:docker"]