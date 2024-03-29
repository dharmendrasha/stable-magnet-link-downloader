FROM node:21.5-slim as base

WORKDIR /app

ARG TZ='Asia/Kolkata'

COPY .npmrc .

ENV TZ=${TZ}
ENV color=0
ENV DEBIAN_FRONTEND=noninteractive

RUN echo ${TZ} >  /etc/timezone

RUN apt update \
   && apt install -y python-is-python3 python3 make g++ 

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

## small production image
FROM base as prod

WORKDIR /prod

COPY --from=base /app/node_modules node_modules
COPY --from=base /app/dist dist
COPY --from=base /app/package.json package.json 
COPY --from=base /app/package-lock.json package-lock.json
COPY --from=base /app/.firebase.json .firebase.json

ENV PORT=80
ENV IS_DOCKER=true
ENV NODE_OPTIONS="--trace-warnings --trace-deprecation"
ENV DOWNLOAD_PATH="/downloads"

RUN apt update -y && \
    apt install curl -y

HEALTHCHECK --interval=5s --timeout=2s --start-period=5s --retries=3 \
    CMD curl --location --request GET "http://0.0.0.0:80/health" || exit 1

EXPOSE 80

CMD [ "node", "dist/index.js" ]