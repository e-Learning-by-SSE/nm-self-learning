FROM node:22-slim AS build

WORKDIR /app

# Build dependencies as they may contain native libraries which must be built for target environment
#RUN apk add --no-cache bash python3 make g++ libc6-compat gcompat libstdc++ libgcc
RUN apt-get update && apt-get install -y --no-install-recommends \
  bash \
  python3 \
  make \
  g++ \
  ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY .npmrc.example ./.npmrc
RUN --mount=type=secret,id=NPM_TOKEN,required=true \
    sh -c 'TOKEN="$(cat /run/secrets/NPM_TOKEN)" && \
    printf "@e-learning-by-sse:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=%s\n" "$TOKEN" > .npmrc && \
    npm ci && \
    rm -f .npmrc'

COPY . ./
RUN mv .env.example .env

# Generate Prisma client
RUN npm run prisma generate
# Allow runnig prisma commands, based on: https://stackoverflow.com/a/72602624
# RUN chown nextjs:nodejs -R node_modules/.prisma

RUN npm run build

FROM node:22-slim
# org image node:alpine - temporary fix https://github.com/vercel/next.js/discussions/69326

COPY --from=build /app /app

WORKDIR /app

# Missing packages
# * Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# * bash is needed for entry-script
# * postgresql-libs and postgresql-client are needed for pg_isready
# * diffutils is needed for cmp (needed for entry-script)
# * libc6-compat gcompat libstdc++ libgcc for onnxruntime (RAG / xenova/transformers)
RUN apt-get update && apt-get install -y --no-install-recommends \
  bash \
  postgresql-client \
  diffutils \
  ca-certificates \
 && rm -rf /var/lib/apt/lists/*
# RUN apk add --no-cache libc6-compat bash postgresql-libs postgresql-client diffutils gcompat libstdc++ libgcc

# Uncomment the following line in case you want to disable telemetry during build & runtime.
ENV NEXT_TELEMETRY_DISABLED 1

# Prepare startup script
COPY docker/entry.sh /entry.sh
RUN chmod +x /entry.sh

# Start the server using the production build
ENTRYPOINT ["/entry.sh"]
CMD [ "start:prod" ]
EXPOSE 3000
