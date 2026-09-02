FROM node:20-alpine
WORKDIR /repo
COPY shared shared/
COPY services/erp-service/package*.json services/erp-service/
RUN cd services/erp-service && npm install --omit=dev --no-audit --no-fund
COPY services/erp-service/server services/erp-service/server/
WORKDIR /repo/services/erp-service
EXPOSE 4010
CMD ["node","server/index.js"]
