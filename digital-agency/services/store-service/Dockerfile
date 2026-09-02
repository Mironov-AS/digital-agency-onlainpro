FROM node:20-alpine
WORKDIR /repo
COPY shared shared/
COPY services/store-service/package*.json services/store-service/
RUN cd services/store-service && npm install --omit=dev --no-audit --no-fund
COPY services/store-service/src services/store-service/src/
WORKDIR /repo/services/store-service
EXPOSE 4011
CMD ["node","src/server.js"]
