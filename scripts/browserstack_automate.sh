#! /usr/bin/bash

pwd

git --version

git checkout master && git fetch -p origin && git pull

yarn run test:browserstack
