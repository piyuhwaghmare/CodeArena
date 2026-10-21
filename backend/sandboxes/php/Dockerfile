# Minimal PHP CLI sandbox
FROM php:8.2-cli-alpine

# Non-root sandbox user
RUN adduser -D sandbox_user
USER sandbox_user

WORKDIR /sandbox

CMD ["php"]
