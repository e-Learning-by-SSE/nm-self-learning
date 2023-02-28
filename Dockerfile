# Base image
FROM node:18-alpine

# Missing packages
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# Required for Prisma Client to work in container
RUN apk add --no-cache openssl1.1-compat
# Required for entry-script
RUN apk add --no-cache bash
# pg_isready to test if DB is up, bevor application starts
RUN apk add --no-cache postgresql-libs postgresql-client
# Add Diffutils (provides cmp)
RUN apk add --no-cache diffutils

# Create app directory
WORKDIR /app

# Install dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package.json package-lock.json ./
# Install app dependencies
RUN npm install

# Environment
ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during build & runtime.
ENV NEXT_TELEMETRY_DISABLED 1

#RUN addgroup --system --gid 1001 nodejs
#RUN adduser --system --uid 1001 nextjs

# Bundle app source
COPY . ./
# Use example as default configuration
RUN mv .env.example .env

# Generate Prisma client
RUN npm run prisma generate
# Allow runnig prisma commands, based on: https://stackoverflow.com/a/72602624
# RUN chown nextjs:nodejs -R node_modules/.prisma

# Prepare startup script
COPY docker/entry.sh /entry.sh
RUN chmod +x /entry.sh

# Start the server using the production build
ENTRYPOINT ["/entry.sh"]
EXPOSE 3000
