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

cd $PULL_DIR/$REPO_NAME
eval `ssh-agent`
ssh-add /home/gendok/.ssh/gendok-git
git pull
npm install --production
gulp deploy
./node_modules/.bin/sequelize db:migrate
forever stopall
rsync -av --exclude '.git' --exclude 'test' --exclude 'migrations' --exclude 'reports' --exclude 'models' --exclude '.gitignore' --exclude '.jscs.json' --exclude '.jshintignore' --exclude 'jshintrc' --exclude '.npmignore' --exclude '.sequelizerc' --exclude 'bower.json' --exclude 'deploy.sh' --exclude 'gulpfile.js' --exclude 'README.md' $PULL_DIR/$REPO_NAME/ $TARGET_DIR/.
cd $TARGET_DIR
GENDOK_ENV=production forever start bin/$EXECUTABLE
exit 0
