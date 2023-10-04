# Script to run on remote machine via the deploy workflow.
# Pulls latest changes, then restarts the existing process instance (if present).
# Process is managed via PM2 (https://pm2.io/).

processName="mafia"

# Exit when any command fails.
set -e

git reset --hard --quiet

echo "Pulling from origin"
git pull --quiet

echo "Installing dependencies"
pnpm install --silent --frozen-lockfile

echo "Deleting old build"
rm -rf build/

echo "Building"
pnpm build

echo "Removing development dependencies"
pnpm install --silent --frozen-lockfile --production

echo "Killing old instance"
# Deletion is allowed to fail, since the process might not have been running previously.
pm2 delete $processName --silent || true 

echo "Starting new instance"
export NODE_ENV=production
pm2 start . --name $processName --silent
