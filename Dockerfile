FROM ubuntu:14.04
MAINTAINER Christopher Kotfila <kotfic@gmail.com>

RUN apt-get update && apt-get -y install software-properties-common python-software-properties
RUN add-apt-repository -y ppa:chris-lea/node.js
RUN apt-get update && apt-get install -y nodejs

RUN npm install -g sails grunt bower

VOLUME ["/app"]

EXPOSE 1337

CMD cd /app && sails lift
