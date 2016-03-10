#!/bin/sh

#PULL_DIR="/home/gendok"
PULL_DIR="/home/hklauser/tmp"
TARGET_DIR="/home/hklauser/tmp/gendok"
BRANCH="setup/deployment"
REPO_NAME="PSIT4-gendok"
EXECUTABLE="gendok"

if [! -d "$PULL_DIR/$REPO_NAME"] -o [ ! -d "$TARGET_DIR" ] -o [ ! -w "$TARGET_DIR" ]; then
  echo "Please check the following requirements:\n"
  echo "Pulled git repo $PULL_DIR/$REPO_NAME has to exist.\n"
  echo "Target directory $TARGET_DIR has to exist and must be writeable.\n"
  exit 1
fi

cd $PULL_DIR/$REPO_NAME
npm install --production
#gulp deploy
./node_modules/.bin/sequelize db:migrate
forever stopall
rsync -aq --exclude '$PULL_DIR/.git' --exclude '$PULL_DIR/test' --exclude '$PULL_DIR/reports' --exclude '$PULL_DIR/migrations' --exclude '$PULL_DIR/models' $PULL_DIR/$REPO_NAME/* $TARGET_DIR/.
cd $TARGET_DIR
GENDOK_ENV=production forever start bin/$EXECUTABLE
exit 0
