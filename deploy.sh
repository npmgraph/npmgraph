#!/usr/bin/env bash
VERSION=$(grep -oP '(?<=version": ")[^"]+' < package.json)
HOST=`hostname`

if [ $HOST == "francis-lewis" ]; then
  # git checkout index.html && \
    git pull && \
     sed -i -e "s/APP_VERSION/${VERSION}/" index.html
else
  echo "Invalid host"
fi
