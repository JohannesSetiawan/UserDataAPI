import { PrismaClient } from '@prisma/client';
import { IncomingMessage, ServerResponse } from 'http';
import NodeCache from 'node-cache';
import { createUser, deleteUser, getAllUser, getUserWithId, updateUser } from './service';

export const handleRequest = async (request: IncomingMessage, response: ServerResponse, prisma: PrismaClient, cache: NodeCache) => {
    const { method, url } = request;

    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, UPDATE, DELETE');

    if (method === 'GET') {
        if (url === '/users') {
            response = await getAllUser(prisma, response)

        } else if (url?.startsWith('/users/')) {
            response = await getUserWithId(url, prisma, response, cache)
            
        }

    } else if (method === 'POST' && url === '/users') {
        let body = '';
        request.on('data', chunk => { body += chunk; });
        request.on('end', async () => {
            response = await createUser(body, prisma, response)
        });
        
    } else if (method === 'PUT' && url?.startsWith('/users/')) {
        let body = '';
        request.on('data', chunk => { body += chunk; });
        request.on('end', async () => {
            response = await updateUser(body, url, prisma, response, cache)
        });
        
    } else if (method === 'DELETE' && url?.startsWith('/users/')) {
        response = await deleteUser(url, prisma, response, cache)

    } else{
        const message = {
            message: "API Not Found!",
        };
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(message));
    }
};