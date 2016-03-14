#!/bin/sh
PULL_DIR="/home/gendok"
TARGET_DIR="/srv/gendok"
REPO_NAME="PSIT4-gendok"
EXECUTABLE="gendok"

if [ ! -d "$PULL_DIR/$REPO_NAME" ]; then
  echo "Git repo directory $PULL_DIR/$REPO_NAME has to exist.\n"
  exit 1
fi
if [ ! -d "$TARGET_DIR" ]; then
  echo "Target directory $TARGET_DIR has to exist and must be writeable.\n"
  exit 1
fi
if [ ! -w "$TARGET_DIR" ]; then
  echo "Target directory $TARGET_DIR has to exist and must be writeable.\n"
  exit 1
fi

export GENDOK_ENV=production
export NODE_ENV=production
cd $PULL_DIR/$REPO_NAME
git pull
npm install --production
gulp build
forever stopall
./node_modules/.bin/sequelize db:migrate
rsync -aq $PULL_DIR/$REPO_NAME/ $TARGET_DIR/.
cd $TARGET_DIR
forever start bin/$EXECUTABLE --config config/config.json
exit 0
