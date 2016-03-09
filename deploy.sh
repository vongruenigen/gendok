#!/bin/sh

#PULL_DIR="/home/gendok/gendok-deploy"
PULL_DIR="/home/hklauser/tmp"
# Target directory has to exist and user needs write access.
TARGET_DIR="/home/hklauser/tmp/gendok"
BRANCH="development"

if [ ! -d "$TARGET_DIR" ]; then
  if [ -w "$TARGET_DIR" ]; then
    echo "Target directory is not writeable"
    exit 1
  fi
fi

FRESH_CLONE=false
if [ ! -d "$PULL_DIR" ]; then
  mkdir $PULL_DIR
  FRESH_CLONE=true
fi

cd $PULL_DIR

if [ "$FRESH_CLONE" ]; then
  git clone git@github.engineering.zhaw.ch:vongrdir/PSIT4-gendok.git
  git checkout $BRANCH
else
  git pull
fi

cd PSIT4-gendok
nv4
npm install --production
gulp deploy
./node_modules/.bin/sequelize db:migrate
cd $PULL_DIR
forever stopall
cp -r $PULL_DIR/PSIT4-gendok $TARGET_DIR
cd $TARGET_DIR/bin
GENDOK_ENV=production forever start gendok
exit 0
