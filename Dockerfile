#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/sdk:6.0-alpine AS publish
WORKDIR /src
RUN apk update \
    && apk upgrade \ 
    && apk add nodejs npm

COPY . . 
RUN dotnet restore "mgr/Clients/DMC.Manager.Angular/DMC.Manager.Angular.csproj" --runtime alpine-x64
COPY . . 

RUN dotnet publish "mgr/Clients/DMC.Manager.Angular/DMC.Manager.Angular.csproj" -c Release -o /app/publish  \
    --no-restore \
    --runtime alpine-x64 \
    --self-contained true \
    /p:PublishTrimmed=true \
    /p:PublishSingleFile=true

FROM mcr.microsoft.com/dotnet/runtime-deps:6.0-alpine AS final
RUN apk update \
    && apk upgrade \ 
    && apk add nodejs npm
RUN apk upgrade musl
WORKDIR /app
EXPOSE 80
COPY --from=publish /app/publish .
ENTRYPOINT ["./DMC.Manager.Angular"]
