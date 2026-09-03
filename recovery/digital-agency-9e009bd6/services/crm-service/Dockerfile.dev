FROM node:20-alpine
WORKDIR /repo
COPY shared shared/
COPY services/crm-service/package*.json services/crm-service/
RUN cd services/crm-service && npm install --omit=dev --no-audit --no-fund
COPY services/crm-service/src services/crm-service/src/
WORKDIR /repo/services/crm-service
EXPOSE 4009
CMD ["node","src/server.js"]
