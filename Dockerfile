FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN apt-get update && apt-get install -y curl \
    && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
    && export NVM_DIR="$HOME/.nvm" \
    && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
    && nvm install 16.14

RUN npm install -g pnpm

RUN pnpm install

COPY src .

COPY ./dist ./dist

CMD ["pnpm", "start"]