ARG BASE_IMAGE=node:20-bullseye-slim
FROM $BASE_IMAGE AS install

WORKDIR /opt/openbmclapi
RUN apt update && \
    apt install -y build-essential python3
COPY package-lock.json package.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

FROM $BASE_IMAGE AS build

RUN apt-get update && \
    apt-get install -y nginx tini

ARG USER=${USER:-root}

RUN chown -R $USER /var/log/nginx /var/lib/nginx

USER $USER

WORKDIR /opt/openbmclapi
COPY package-lock.json package.json ./
RUN npm ci --omit=dev

COPY --from=install /opt/openbmclapi/dist ./dist
COPY nginx/ /opt/openbmclapi/nginx


ENV CLUSTER_PORT=4000
EXPOSE $CLUSTER_PORT
VOLUME /opt/openbmclapi/cache
CMD ["tini", "--", "node", "--enable-source-maps", "dist/index.js"]
