# Using ubuntu x64 base image
FROM ubuntu:latest

# Updating apt-get
RUN apt-get update --fix-missing

# Installing wget & curl for downloading files/packages
RUN apt-get install -y wget && apt-get install -y curl

# Installing qcad tar.gz package
RUN wget -c https://qcad.org/archives/qcad/qcadcam-3.26.4-trial-linux-x86_64.tar.gz

# Extracting the qcad tar.gz 
RUN tar -xf qcadcam-3.26.4-trial-linux-x86_64.tar.gz

# Deleting qcad tar.gz not needed anymore
RUN rm qcadcam-3.26.4-trial-linux-x86_64.tar.gz

# Installing dependencies for qcad Ref(https://qcad.org/en/documentation/installation)
RUN apt-get install -y libglu1-mesa
RUN apt-get install -y libglib2.0-0
RUN apt-get install -y libqt5x11extras5

# Installing NodeJS
RUN curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get install -y nodejs
# RUN npm ci && npm cache clean --force

# Copying Node Service files
WORKDIR /
COPY package.json /
COPY . /

# Runnning Node Server
CMD node index.js