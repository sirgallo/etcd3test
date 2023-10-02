#!/bin/bash

readonly truthyInput="input should be yes or no"

echo "Init services for first time? (yes or no):"
read startServices

if [ "$startServices" == "yes" ]
then
  echo "starting services for the first time"
  export HOSTNAME
  docker-compose -f docker-compose.etcd3test.yml up --build
elif [ "$startServices" == "no" ]
then
  echo "restarting services..."
  export HOSTNAME
  docker-compose -f docker-compose.etcd3test.yml up
else
  echo truthyInput
fi