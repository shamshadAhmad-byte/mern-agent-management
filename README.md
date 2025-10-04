MERN Agent Management System

A simple MERN stack app for managing agents and distributing uploaded CSV/XLSX records.

Features

Admin Login with JWT

Agent Management (Add / View / Delete)

Upload CSV/XLSX (FirstName, Phone, Notes)

Distribute Records equally among agents

View Records assigned to each agent

🛠 Tech Stack

Frontend: React (Vite) + TailwindCSS

Backend: Node.js + Express.js

Database: MongoDB

Auth: JWT

File Handling: Multer + XLSX/CSV Parser

Clone and Repository
git clone https://github.com/shamshadAhmad-byte/mern-agent-management.git
cd mern-agent-management-backend

Backend Setup

cd backend
npm install
npm run start


Frontend Setup
cd frontend
npm install
npm run dev

If this is not running
You have install git 
then you can run ./bash.sh
this command

API Routes

POST /auth/login → Admin login

POST /agents → Add agent

GET /agents → Get agents

DELETE /agents/:id → Delete agent

POST /upload → Upload CSV/XLSX

GET /upload/lists → Distribution summary

GET /distribution/agent/:id → Agent’s records