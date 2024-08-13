import { PrismaClient } from '@prisma/client';
import { ServerResponse } from 'http';
import NodeCache from 'node-cache';
import { UserDTO } from './dto';
import { UserValidator } from './payloadValidator';
import {v4 as uuidv4} from 'uuid';
import { validateNonUniqueUser, valideUserExist } from './validator';

export const getAllUser = async (prisma: PrismaClient, response: ServerResponse) => {
    const users = await prisma.user.findMany();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(users));
    return response
}

export const getUserWithId = async (url: string, prisma: PrismaClient, response: ServerResponse, cache: NodeCache) => {
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
    return response
}

export const createUser = async (body: string, prisma: PrismaClient, response: ServerResponse) => {
    try{
        const user = JSON.parse(body) as UserDTO;
        UserValidator.validateUserPayload(user)
        const existingUser = await validateNonUniqueUser(user, prisma);
        if (existingUser.length > 0){
            throw new Error("User name or email is already used!");
        }
        const userId = 'user-' + uuidv4()
        const newUser = await prisma.user.create({ data: {...user, dateofbirth: new Date(user.dateofbirth), id: userId} });
        response.writeHead(201, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(newUser));
        return response

    } catch(err: unknown){
        const error = err as Error
        const message = {
            message: error.message || "An unexpected error occurred",
        };
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(message));
        return response
    }
}

export const updateUser = async (
    body: string, 
    url: string, 
    prisma: PrismaClient, 
    response: ServerResponse, 
    cache: NodeCache) => {
    try{
        const userId = url.split('/')[2];
        const user = JSON.parse(body) as UserDTO;
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
        return response

    } catch(err: unknown){
        const error = err as Error
        const message = {
            message: error.message || "An unexpected error occurred",
        };
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(message));
        return response

    }
}

export const deleteUser = async (url: string, prisma: PrismaClient, response: ServerResponse, cache: NodeCache) => {
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
    return response
}