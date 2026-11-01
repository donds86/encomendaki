FROM node:24.22.2-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY backend ./backend
COPY scripts ./scripts
COPY crm-ui.js recovery-ui.js audit-ui.js appearance.js brand-icon.svg server.cjs index.html style.css app.js platform.js tenancy.js client.js operations.js commerce.js growth.js ./
ENV NODE_ENV=production
USER node
CMD ["npm", "start"]
