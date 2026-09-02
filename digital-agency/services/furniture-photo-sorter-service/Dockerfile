FROM node:20-alpine
WORKDIR /repo
COPY shared shared/
COPY services/furniture-photo-sorter-service/package*.json services/furniture-photo-sorter-service/
RUN cd services/furniture-photo-sorter-service && npm install --omit=dev --no-audit --no-fund
COPY services/furniture-photo-sorter-service/server services/furniture-photo-sorter-service/server/
RUN ln -s services/furniture-photo-sorter-service/node_modules /repo/node_modules
WORKDIR /repo/services/furniture-photo-sorter-service
EXPOSE 4012
CMD ["node","server/index.js"]
