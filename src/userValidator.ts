import { PrismaClient } from "@prisma/client";
import { User } from "./userModel";

export const validateNonUniqueUser = async (user: User, prisma: PrismaClient) => {
    const isAlreadyCreated = await prisma.user.findFirst({
        where: {
            OR: [
                { name: user.name },
                { email: user.email }
            ]
        }
    });
    if (isAlreadyCreated) {
        throw new Error("User name or email is already used!");
    }
};
export const valideUserExist = async (id: string, prisma: PrismaClient) => {
    const existingUser = await prisma.user.findFirst({
        where: {
            id: id
        }
    });
    if (!existingUser) {
        return false;
    }
    return true;
};
