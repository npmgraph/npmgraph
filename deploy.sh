#!/usr/bin/env bash
VERSION=$(grep -oP '(?<="version": ")[^"]+' < package.json)
HOST=`hostname`

if [ $HOST == "francis-lewis" ]; then
  echo "Setting APP_VERSION=${VERSION}"

  git checkout index.html && \
    git pull && \
    sed --in-place -e "s/APP_VERSION/${VERSION}/" index.html
else
  echo "Invalid host"
fi
