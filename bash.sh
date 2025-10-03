#!/bin/bash

echo "🚀 Starting backend server..."
cd backend
npm install
npm run start &
BACKEND_PID=$!
cd ..

echo "🚀 Starting frontend server..."
cd frontend
npm install
npm run dev & 
FRONTEND_PID=$!
cd ..


trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID" SIGINT SIGTERM

wait
