FROM node:latest

RUN mkdir parse

ADD . /parse
WORKDIR /parse
RUN npm install

ENV APP_ID azulSocial
ENV MASTER_KEY setYourMasterKey
ENV DATABASE_URI postgres://bfmajtttajbgsl:3040aca2bf20184037a780af861db9cf547160824af81d5bfcf6fffe9b9074cb@ec2-3-89-214-80.compute-1.amazonaws.com:5432/d6hvj590g7e06m

# Optional (default : 'parse/cloud/main.js')
# ENV CLOUD_CODE_MAIN cloudCodePath

# Optional (default : '/parse')
# ENV PARSE_MOUNT mountPath

EXPOSE 1337

# Uncomment if you want to access cloud code outside of your container
# A main.js file must be present, if not Parse will not start

# VOLUME /parse/cloud               

CMD [ "npm", "start" ]
