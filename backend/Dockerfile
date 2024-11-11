FROM node:18-alpine

WORKDIR /phimapi

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 5555
ENV PORT 5555

CMD ["node", "dist/index.js"]