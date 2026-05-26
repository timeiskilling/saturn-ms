FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG VITE_PRICE_SERVICE_URL
ARG VITE_SESSION_URL
ARG VITE_GRPC_URL
ARG VITE_HELIUS_API_KEY


ENV VITE_PRICE_SERVICE_URL=$VITE_PRICE_SERVICE_URL
ENV VITE_SESSION_URL=$VITE_SESSION_URL
ENV VITE_GRPC_URL=$VITE_GRPC_URL
ENV VITE_HELIUS_API_KEY=$VITE_HELIUS_API_KEY

RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
