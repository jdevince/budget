FROM microsoft/dotnet:latest
COPY /backend/. /backend/app
COPY /frontend/. /frontend
WORKDIR /backend/app

RUN ["dotnet", "restore"]
RUN ["dotnet", "build"]

EXPOSE 5000/tcp
ENV ASPNETCORE_URLS http://*:5000
 
#ENTRYPOINT ["dotnet", "run"]

WORKDIR /frontend

RUN apt-get update
RUN apt-get install sudo
RUN apt-get install -y npm
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN sudo apt-get install -y nodejs

#RUN apt-get install -y nodejs
#RUN npm install -g n
RUN npm install
ENTRYPOINT ["npm", "start"]
