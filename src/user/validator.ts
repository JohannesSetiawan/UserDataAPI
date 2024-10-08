import { PrismaClient } from '@prisma/client'
import { UserDTO } from './dto'

export const validateNonUniqueUser = async (
    user: UserDTO,
    prisma: PrismaClient
) => {
    const alreadyCreatedUser = await prisma.user.findMany({
        where: {
            OR: [{ name: user.name }, { email: user.email }],
        },
    })
    return alreadyCreatedUser
}

export const valideUserExist = async (id: string, prisma: PrismaClient) => {
    const existingUser = await prisma.user.findFirst({
        where: {
            id: id,
        },
    })
    return existingUser
}
