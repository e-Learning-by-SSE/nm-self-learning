# Runs as non-root, listens on 8080 by default
FROM nginxinc/nginx-unprivileged:alpine

# Copy your static files
COPY --chown=101:101 build /usr/share/nginx/html


# Copy our nginx server config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
# no CMD needed; base image starts nginx
