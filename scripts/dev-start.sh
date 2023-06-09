#!/bin/bash

# Function to stop the running processes
stop_processes() {
  echo "Stopping processes..."
  kill "$pid1" "$pid2"  # Kill the processes with their respective PIDs
  exit 0
}

# Set up the Ctrl+C signal handler
trap stop_processes SIGINT

# Command 1: npm start
command1="npm start"
eval "$command1" &  # Execute "npm start" in the background
pid1=$!  # Store the PID of the first command

# Command 2: npx prisma studio
command2="npx prisma studio"
eval "$command2" &  # Execute "npx prisma studio" in the background
pid2=$!  # Store the PID of the second command

# Wait for both commands to finish
wait "$pid1"
wait "$pid2"

echo "All processes have finished."
