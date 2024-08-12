
# Hangry MSIB 7 - Johannes Setiawan - Backend Engineer - Test Results

## How to start the server

1. Run ```npm install``` to install all dependencies.
2. Create .env file and set ```DATABASE_URL``` variable with your database URL
3. Run ```npx prisma generate``` to load yoru environtment variable to prisma
4. Run ```npx prisma migrate dev``` to migrate prisma schema to your database.
5. Run ```npm run start``` to start the server.
