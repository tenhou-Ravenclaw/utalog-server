# Node.js の公式イメージを使用
FROM node:18

# 作業ディレクトリの作成
WORKDIR /app

# ホスト側のnode_modulesと干渉しないように
RUN mkdir -p /app/node_modules && chown -R node:node /app

# 非rootユーザーで実行（セキュリティ強化）
USER node
