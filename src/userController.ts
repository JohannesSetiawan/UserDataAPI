import { PrismaClient } from '@prisma/client';
import { IncomingMessage, ServerResponse } from 'http';

export const handleRequest = async (req: IncomingMessage, res: ServerResponse, prisma: PrismaClient) => {
    const { method, url } = req;

    if (method === 'GET') {
        if (url === '/users') {
            const users = await prisma.user.findMany();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));
        } else if (url?.startsWith('/users/')) {
            const id = parseInt(url.split('/')[2]);
            const user = await prisma.user.findUnique({ where: { id } });
            if (user) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(user));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('User not found');
            }
        }
    }
};

