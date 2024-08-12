import { PrismaClient } from '@prisma/client';
import { IncomingMessage, ServerResponse } from 'http';
import { User } from './userModel';

export const handleRequest = async (req: IncomingMessage, res: ServerResponse, prisma: PrismaClient) => {
    const { method, url } = req;

    if (method === 'GET') {
        if (url === '/users') {

            const users = await prisma.user.findMany();

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));

        } else if (url?.startsWith('/users/')) {
            const userId = parseInt(url.split('/')[2]);
            const user = await prisma.user.findUnique({ where: { id: userId } });

            if (user) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(user));

            } else {
                const message = {
                    message: "User not found!",
                };

                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(message));
            }
        }
    } else if (method === 'POST' && url === '/users') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try{
                const user = JSON.parse(body) as User;

                await validateUserData(user);
                await validateNonUniqueUser(user, prisma);

                
                const newUser = await prisma.user.create({ data: {...user, dateofbirth: new Date(user.dateofbirth)} });

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newUser));

            } catch(error: any){
                const message = {
                    message: error.message || "An unexpected error occurred",
                };

                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(message));
            }
        });
        
    } else if (method === 'PUT' && url?.startsWith('/users/')) {
        const userId = parseInt(url.split('/')[2]);
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try{
                const user = JSON.parse(body) as User;

                await validateUserData(user);
                const isUserExist = await valideUserExist(userId, prisma);

                if (isUserExist){
                    const updatedUser = await prisma.user.update({ 
                        data: {...user, dateofbirth: new Date(user.dateofbirth)},
                        where: {id: userId}
                    });

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(updatedUser));
                } else{
                    const message = {
                        message: "User not found!",
                    };
    
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(message));
                }

            } catch(error: any){
                const message = {
                    message: error.message || "An unexpected error occurred",
                };

                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(message));
            }
        });
        
    } else if (method === 'DELETE' && url?.startsWith('/users/')) {
        const userId = parseInt(url.split('/')[2]);
        const isUserExist = await valideUserExist(userId, prisma);

        if (isUserExist){
            await prisma.user.delete({
                where:{
                    id: userId
                },
            });

            res.writeHead(204, { 'Content-Type': 'application/json' });
            res.end();

        } else {
            const message = {
                message: "User not found!",
            };

            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(message));
        }
        
    } else{
        const message = {
            message: "API Not Found!",
        };
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(message));
    }
};


const validateUserData = async (user: User) => {
    if (!user.dateofbirth || !user.email || !user.name){
        throw new Error("One or more data fields is empty!")
    }
    if (!user.email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
        throw new Error("Invalid email!")
    }
    if(isNaN(Date.parse(user.dateofbirth))){
        throw new Error("Invalid date!")
    }
}

const validateNonUniqueUser = async (user: User, prisma: PrismaClient) => {
    const isAlreadyRegister =  await prisma.user.findFirst({
        where: {
            OR: [
                { name: user.name },
                { email: user.email }
            ]
        }
    })
    if (isAlreadyRegister){
        throw new Error("User name or email is already registered!")
    }
}

const valideUserExist = async (id: number, prisma: PrismaClient) => {
    const existingUser =  await prisma.user.findFirst({
        where: {
            id: id
        }
    })
    if (!existingUser){
        return false
    }
    return true
}
