# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# next standalone (si lo activás) es aún mejor, pero así funciona igual:
COPY --from=build /app ./

EXPOSE 3000
CMD ["npm","run","start","--","-p","3000"]
