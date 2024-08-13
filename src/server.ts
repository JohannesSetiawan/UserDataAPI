import { PrismaClient } from '@prisma/client';
import http from 'http';
import { handleRequest } from './user/controller';
import NodeCache from 'node-cache';


const prisma = new PrismaClient();
const cache = new NodeCache();
const port = 3000;

const server = http.createServer((req, res) => handleRequest(req, res, prisma, cache));

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
