
ARG NPM_TOKEN

# Base image
FROM node:alpine as build

ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}

# Create app directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY .npmrc.example .npmrc
RUN sed -i "s/\${NPM_TOKEN}/${NPM_TOKEN}/g" .npmrc
RUN npm install
RUN rm .npmrc

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

# Multistage build: Keep only result instead of all intermediate layers
FROM node:alpine
COPY --from=build /app /app

WORKDIR /app

# Missing packages
# * Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# * bash is needed for entry-script
# * postgresql-libs and postgresql-client are needed for pg_isready
# * diffutils is needed for cmp (needed for entry-script)
RUN apk add --no-cache libc6-compat bash postgresql-libs postgresql-client diffutils

# Environment
ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during build & runtime.
ENV NEXT_TELEMETRY_DISABLED 1

# Prepare startup script
COPY docker/entry.sh /entry.sh
RUN chmod +x /entry.sh

# Start the server using the production build
ENTRYPOINT ["/entry.sh"]
EXPOSE 3000
