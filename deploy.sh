#!/usr/bin/env bash

WORKING_DIRECTORY="~/www/cs1531deploy"

USERNAME="ubuntu"
SSH_HOST="compserver.ddns.net"

scp -i ~/.ssh/id_rsa -r ./package.json ./package-lock.json ./tsconfig.json ./src ./images ./.env "$USERNAME@$SSH_HOST:$WORKING_DIRECTORY"
ssh -i ~/.ssh/id_rsa "$USERNAME@$SSH_HOST" "cd $WORKING_DIRECTORY && ./start.sh"
