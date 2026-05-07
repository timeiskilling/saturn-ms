FROM oven/bun:latest AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .

ARG VITE_PRICE_SERVICE_URL
ARG VITE_SESSION_URL
ARG VITE_GRPC_URL

ENV VITE_PRICE_SERVICE_URL=$VITE_PRICE_SERVICE_URL
ENV VITE_SESSION_URL=$VITE_SESSION_URL
ENV VITE_GRPC_URL=$VITE_GRPC_URL

RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 3030
