#!/bin/bash
echo "Starting backend setup..."
npm init -y

npm install -D nodemon
mkdir models routes middleware utils scripts uploads config
touch server.js
cd models
touch User.js Agent.js List.js
cd ..
cd routes
touch auth.js agent.js upload.js
cd ..
cd middleware 
touch auth.js
cd ..
cd utils
touch validation.js response.js
cd ..
cd scripts
touch seed.js
cd ..
cd config
touch db.js
cd ..
npm install express mongoose dotenv cors jsonwebtoken bcryptjs multer csv-parser uuid xlsx 
echo "Backend setup completed. "