# ── Stage 1: Build landing SPA ─────────────────────────────────────────────────
FROM node:20-alpine AS landing-build
WORKDIR /src
COPY landing/package*.json ./
RUN npm install --no-audit --no-fund
COPY landing/ ./
RUN npm run build

# ── Stage 2: Build app SPA ─────────────────────────────────────────────────────
FROM node:20-alpine AS app-build
WORKDIR /src
COPY app/package*.json ./
RUN npm install --no-audit --no-fund
COPY app/ ./
RUN npm run build

# ── Stage 3: Build client portal SPA ───────────────────────────────────────────
FROM node:20-alpine AS client-portal-build
ARG VITE_BASE=/client-portal/
ENV VITE_BASE=${VITE_BASE}
WORKDIR /src
COPY client-portal/package*.json ./
RUN npm install --no-audit --no-fund
COPY client-portal/ ./
RUN npm run build

# ── Stage 4: Build queue service SPA ──────────────────────────────────────────
FROM node:20-alpine AS queue-client-build
WORKDIR /src
COPY services/queue-service/client/package*.json ./
RUN npm install --no-audit --no-fund
COPY services/queue-service/client/ ./
RUN npm run build

# ── Stage 5: Build booking service SPA ────────────────────────────────────────
FROM node:20-alpine AS booking-client-build
WORKDIR /src
COPY services/booking-service/client/package*.json ./
RUN npm install --no-audit --no-fund
COPY services/booking-service/client/ ./
RUN npm run build

# ── Stage 6: Build CRM service SPA ──────────────────────────────────────────
FROM node:20-alpine AS crm-client-build
WORKDIR /src
COPY services/crm-service/client/package*.json ./
RUN npm install --no-audit --no-fund
COPY services/crm-service/client/ ./
RUN npm run build

# ── Stage 6b: Build ERP service SPA ─────────────────────────────────────────
FROM node:20-alpine AS erp-client-build
ARG CACHEBUST=1
WORKDIR /src
COPY services/erp-service/client/package*.json ./
RUN npm install --no-audit --no-fund
COPY services/erp-service/client/ ./
RUN npm run build

# ── Stage 6c: Build store service SPA ───────────────────────────────────────
FROM node:20-alpine AS store-client-build
WORKDIR /src
COPY services/store-service/client/package*.json ./
RUN npm install --no-audit --no-fund
COPY services/store-service/client/ ./
RUN npm run build

# ── Stage 7: Production image ─────────────────────────────────────────────────
FROM node:20-alpine

RUN apk add --no-cache nginx poppler-utils tesseract-ocr tesseract-ocr-data-eng tesseract-ocr-data-rus font-liberation fontconfig

WORKDIR /repo

# Install root dependencies used by shared modules.
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund --workspaces=false

# Copy shared modules
COPY shared/ shared/

# Install all microservices
COPY services/auth-service/package*.json services/auth-service/
RUN cd services/auth-service && npm install --omit=dev --no-audit --no-fund

COPY services/catalog-service/package*.json services/catalog-service/
RUN cd services/catalog-service && npm install --omit=dev --no-audit --no-fund

COPY services/clients-service/package*.json services/clients-service/
RUN cd services/clients-service && npm install --omit=dev --no-audit --no-fund

COPY services/projects-service/package*.json services/projects-service/
RUN cd services/projects-service && npm install --omit=dev --no-audit --no-fund

COPY services/admin-service/package*.json services/admin-service/
RUN cd services/admin-service && npm install --omit=dev --no-audit --no-fund

COPY services/product-shelf-service/package*.json services/product-shelf-service/
RUN cd services/product-shelf-service && npm install --omit=dev --no-audit --no-fund

COPY services/queue-service/server/package*.json services/queue-service/server/
RUN cd services/queue-service/server && npm install --omit=dev --no-audit --no-fund

COPY services/booking-service/package*.json services/booking-service/
RUN cd services/booking-service && npm install --omit=dev --no-audit --no-fund

COPY services/crm-service/package*.json services/crm-service/
RUN cd services/crm-service && npm install --omit=dev --no-audit --no-fund

COPY services/erp-service/package*.json services/erp-service/
RUN cd services/erp-service && npm install --omit=dev --no-audit --no-fund

COPY services/store-service/package*.json services/store-service/
RUN cd services/store-service && npm install --omit=dev --no-audit --no-fund

COPY services/furniture-photo-sorter-service/package*.json services/furniture-photo-sorter-service/
RUN cd services/furniture-photo-sorter-service && npm install --omit=dev --no-audit --no-fund

COPY services/label-merger-service/package*.json services/label-merger-service/
RUN cd services/label-merger-service && npm install --omit=dev --no-audit --no-fund

# Copy service source code
COPY services/auth-service/src/ services/auth-service/src/
COPY services/catalog-service/src/ services/catalog-service/src/
COPY services/clients-service/src/ services/clients-service/src/
COPY services/projects-service/src/ services/projects-service/src/
COPY services/admin-service/src/ services/admin-service/src/
COPY services/product-shelf-service/src/ services/product-shelf-service/src/
COPY services/queue-service/server/ services/queue-service/server/
COPY services/booking-service/server/ services/booking-service/server/
COPY services/crm-service/src/ services/crm-service/src/
COPY services/erp-service/server/ services/erp-service/server/
COPY services/store-service/src/ services/store-service/src/
COPY services/furniture-photo-sorter-service/server/ services/furniture-photo-sorter-service/server/
COPY services/label-merger-service/src/ services/label-merger-service/src/

# Copy built frontends
COPY --from=landing-build /src/dist /usr/share/nginx/html/landing
COPY --from=app-build /src/dist /usr/share/nginx/html/app
COPY --from=client-portal-build /src/dist /usr/share/nginx/html/client-portal
COPY --from=queue-client-build /src/dist /repo/services/queue-service/server/public
COPY --from=booking-client-build /src/dist /repo/services/booking-service/server/public
COPY --from=crm-client-build /src/dist /repo/services/crm-service/public
COPY --from=erp-client-build /src/dist /repo/services/erp-service/server/public
COPY --from=store-client-build /src/dist /repo/services/store-service/public

# Nginx config
COPY deploy-nginx.conf /etc/nginx/nginx.conf

# Startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Keep the compatibility wrapper for platforms that run the configured command,
# but make the image itself boot through the real startup script.
COPY docker.js /repo/docker.js
RUN cp /repo/docker.js /repo/docker

RUN mkdir -p services/projects-service/uploads services/auth-service/data services/queue-service/server/uploads \
    services/furniture-photo-sorter-service/server/uploads \
    services/furniture-photo-sorter-service/server/results \
    services/label-merger-service/uploads \
    services/label-merger-service/results

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "/start.sh"]
CMD []
