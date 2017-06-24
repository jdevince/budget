FROM microsoft/dotnet:latest
COPY BudgetBackend/bin/Debug/netcoreapp1.0/publish/ /root/
EXPOSE 5000
ENV ASPNETCORE_URLS http://*:5000
ENTRYPOINT dotnet /root/BudgetBackend.dll