FROM oven/bun:latest
WORKDIR /app
COPY package.json ./
RUN bun install
COPY index.ts ./
EXPOSE 3030
CMD ["bun", "run", "index.ts"]
