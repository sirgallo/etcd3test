#!/bin/bash

readonly truthyInput="input should be yes or no"

echo "should this action remove containers? (yes or no):"
read removeServices

if [ "$removeServices" == "yes" ]
then
  echo "removing services and their underlying containers..."
  docker-compose -f docker-compose.etcd3test.yml down
elif [ "$removeServices" == "no" ]
then
  echo "stopping services...can be restarted"
  docker-compose -f docker-compose.etcd3test.yml stop
else
  echo truthyInput
fi