FROM node:22-alpine

WORKDIR /app

# Устанавливаем шрифты для поддержки кириллицы в PDF
RUN apk add --no-cache font-liberation fontconfig

# Копируем package.json из контекста сборки (корень проекта)
COPY services/label-merger-service/package*.json ./

# Устанавливаем зависимости
RUN npm ci --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund

# Копируем исходники и shared модули
COPY services/label-merger-service/src ./src
COPY shared ./shared

# Создаём пустые директории для загрузок и результатов
RUN mkdir -p uploads results

ENV NODE_ENV=production
ENV PORT=4013

EXPOSE 4013

CMD ["node", "src/server.js"]
