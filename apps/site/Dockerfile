# This template uses Automatically Copying Traced Files feature
# so you need to setup your Next Config file to use `output: 'standalone'`
# Please read this for more information https://nextjs.org/docs/pages/api-reference/next-config-js/output

# Production image, copy all the files and run next
FROM docker.io/node:lts-alpine AS runner
# RUN apk add --no-cache dumb-init
RUN apk add --no-cache tini
ENV NODE_ENV=production
ENV PORT=3000

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app/

COPY dist/apps/site/.next/standalone/ dist/apps/site/.next/standalone/

COPY dist/apps/site/next.config.js dist/apps/site/next.config.js

COPY dist/apps/site/public .dist/apps/site/public 
# COPY dist/apps/site/.next/standalone/apps/site ./
# COPY dist/apps/site/.next/standalone/package.json ./
# COPY dist/apps/site/.next/standalone/node_modules ./node_modules
COPY dist/apps/site/.next/static dist/apps/site/.next/static

# RUN npm i sharp
RUN chown -R node:node .
USER node
EXPOSE 3000
# COPY --chown=node:node ./tools/scripts/entrypoints/api.sh /usr/local/bin/docker-entrypoint.sh
# ENTRYPOINT [ "docker-entrypoint.sh" ]
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["tini", "node", "dist/apps/site/.next/standalone/apps/site/server.js"]
