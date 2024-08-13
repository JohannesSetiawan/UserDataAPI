import { PrismaClient } from '@prisma/client';
import { IncomingMessage, ServerResponse } from 'http';
import { User } from './userModel';
import { UserValidator } from './userPayloadValidator';
import {v4 as uuidv4} from 'uuid';
import NodeCache from 'node-cache';
import { validateNonUniqueUser, valideUserExist } from './userValidator';

export const handleRequest = async (request: IncomingMessage, response: ServerResponse, prisma: PrismaClient, cache: NodeCache) => {
    const { method, url } = request;

    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, UPDATE, DELETE');

    if (method === 'GET') {
        if (url === '/users') {
            const users = await prisma.user.findMany();
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(users));

        } else if (url?.startsWith('/users/')) {
            const userId = url.split('/')[2];
            const cachedUser = cache.get(userId)

            if (cachedUser){
                response.writeHead(200, { 'Content-Type': 'application/json', 'X-Data-Source': 'cache'});
                response.end(JSON.stringify(cachedUser));

            } else{
                const user = await prisma.user.findUnique({ where: { id: userId } });

                if (user) {
                    cache.set(userId, user, 3600)
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(user));

                } else {
                    const message = {
                        message: "User not found!",
                    };
                    response.writeHead(404, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(message));
                }
            }

            
        }
    } else if (method === 'POST' && url === '/users') {
        let body = '';
        request.on('data', chunk => { body += chunk; });
        request.on('end', async () => {
            try{
                const user = JSON.parse(body);
                UserValidator.validateUserPayload(user)
                const existingUser = await validateNonUniqueUser(user, prisma);
                if (existingUser.length > 0){
                    throw new Error("User name or email is already used!");
                }
                const userId = 'user-' + uuidv4()
                const newUser = await prisma.user.create({ data: {...user, dateofbirth: new Date(user.dateofbirth), id: userId} });
                response.writeHead(201, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(newUser));

            } catch(error: any){
                const message = {
                    message: error.message || "An unexpected error occurred",
                };
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(message));
            }
        });
        
    } else if (method === 'PUT' && url?.startsWith('/users/')) {
        const userId = url.split('/')[2];
        let body = '';
        request.on('data', chunk => { body += chunk; });
        request.on('end', async () => {
            try{
                const user = JSON.parse(body) as User;
                UserValidator.validateUserPayload(user)
                const isUserExist = await valideUserExist(userId, prisma);

                if (isUserExist){
                    const existingUser = await validateNonUniqueUser(user, prisma);
                    if (existingUser.length > 1 || !existingUser.find(user => user.id === userId)){
                        throw new Error("User name or email is already used!");
                    }
                    
                    const updatedUser = await prisma.user.update({ 
                        data: {...user, dateofbirth: new Date(user.dateofbirth)},
                        where: {id: userId}
                    });
                    cache.del(userId)
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(updatedUser));

                } else{
                    const message = {
                        message: "User not found!",
                    };
                    response.writeHead(404, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(message));
                }
            } catch(error: any){
                const message = {
                    message: error.message || "An unexpected error occurred",
                };
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(message));
            }
        });
        
    } else if (method === 'DELETE' && url?.startsWith('/users/')) {
        const userId = url.split('/')[2];
        const isUserExist = await valideUserExist(userId, prisma);

        if (isUserExist){
            await prisma.user.delete({
                where:{
                    id: userId
                }, 
            });
            cache.del(userId)
            response.writeHead(204, { 'Content-Type': 'application/json' });
            response.end();

        } else {
            const message = {
                message: "User not found!",
            };
            response.writeHead(404, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(message));
        }
    } else{
        const message = {
            message: "API Not Found!",
        };
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(message));
    }
};