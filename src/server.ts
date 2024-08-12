import { PrismaClient } from '@prisma/client';
import http from 'http';
import { handleRequest } from './userController';


const prisma = new PrismaClient();
const port = 3000;

const server = http.createServer((req, res) => handleRequest(req, res, prisma));

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
