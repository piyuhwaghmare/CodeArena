# Minimal Node.js sandbox
FROM node:20-alpine

# Non-root sandbox user
RUN adduser -D sandbox_user
USER sandbox_user

WORKDIR /sandbox

CMD ["node"]
