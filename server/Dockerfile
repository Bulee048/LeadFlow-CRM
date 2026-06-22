FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
# We use npm ci for reliable builds
RUN npm ci

# Copy Prisma schema and generate client before copying the rest of the code
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the remaining source code
COPY . .

# If you implemented the TypeScript build step, uncomment the line below:
# RUN npm run build

EXPOSE 5050

# Use the compiled js file if TypeScript was used, otherwise index.js
CMD ["node", "index.js"]
