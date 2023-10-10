# Script to run on remote machine via the deploy workflow.
# Pulls latest changes, then restarts the existing process instance (if present).
# Process is managed via PM2 (https://pm2.io/).

processName="mafia"

# Exit when any command fails.
set -e

# Reset any local changes, unlikely to be present but just in case.
git reset --hard --quiet

# Pull all new changes.
echo "Pulling from origin"
git pull --quiet

# Install dependencies, for if the new changes modified existing dependencies.
echo "Installing dependencies"
pnpm install --silent --frozen-lockfile

# Clean up the old build files.
echo "Deleting old build"
rm -rf build/

# Compile new build files.
echo "Building"
pnpm build

# Remove development dependencies, as they're no longer needed once compilation is done.
echo "Removing development dependencies"
pnpm install --silent --frozen-lockfile --production

# Stop the existing process, if it's running.
echo "Killing old instance"
# Deletion is allowed to fail (|| true), since the process might not have been running previously.
pm2 delete $processName --silent || true 

# Start a new process instance.
echo "Starting new instance"
# Express best practices.
# https://expressjs.com/th/advanced/best-practice-performance.html#set-node_env-to-production
export NODE_ENV=production
pm2 start . --name $processName --silent
