# C# .NET 8 Sandbox
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine

# Pre-initialize console project for rapid non-network compilation
WORKDIR /sandbox/app
RUN dotnet new console && dotnet build

# Non-root sandbox user
RUN adduser -D sandbox_user && chown -R sandbox_user:sandbox_user /sandbox
USER sandbox_user

WORKDIR /sandbox/app

CMD ["sh"]
