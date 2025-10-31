import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ConflictException } from '@nestjs/common/exceptions';
import { NotFoundException } from '@nestjs/common';
import { MinioService } from '../minio/minio.service';
import { randomNumber, randomString, randomAlphanumeric } from '../utils/random.util';
import { v4 as uuidv4 } from 'uuid';
const randomId = randomString(8);
const randomCode = randomAlphanumeric(6); 

@Injectable()
export class GroupService {
    constructor(private prisma: PrismaService,
    private readonly minioService: MinioService
    ) {}

    async create(dto: CreateGroupDto, profileImg?: Express.Multer.File) {
        if (profileImg) {
            const filename = `${uuidv4()}${profileImg.originalname.substring(profileImg.originalname.lastIndexOf('.'))}`;
            const url = await this.minioService.uploadImage(profileImg.buffer, filename, profileImg.mimetype);
            dto.groupImg = url;
        }

        try {
            const group =  await this.prisma.group.create({
                data: {
                    id: randomAlphanumeric(6),
                    ownerId: dto.ownerId,
                    groupName: dto.groupName,
                    groupImg: dto.groupImg,
                    status: dto.status,
                    description: dto.description,
                },
            }); 
             await this.prisma.userJoinGroup.create({
                data: {
                    userId: group.ownerId,
                    groupId: group.id,
                    status: 'owner',
                    joinDate: new Date(),
                },
            });
            return group;

        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new ConflictException('group ID ถูกใช้งานแล้ว');
            }
            else if (e instanceof Prisma.PrismaClientKnownRequestError) {
                throw e;
            }
        }
    }

    async joinGroup(userId: string, groupId: string) {
        try {
            return await this.prisma.userJoinGroup.create({
                data: {
                    userId: userId,
                    groupId: groupId,
                    status: 'member',
                    joinDate: new Date(),
                },
            });
        }
        catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new ConflictException('user is already in the group');
            }
            else if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
                throw new NotFoundException('user or group not found');
            }
        }
    }

    async leaveGroup(userId: string, groupId: string) {
        try {
            await this.prisma.userJoinGroup.delete({
                where: {
                    groupId_userId: { groupId, userId },
                },
            });
            return { ok: true };
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
                throw new NotFoundException('membership not found');
            }
            throw e;
        }
    }

    findAll() {
        return `This action returns all group`;
    }

    async shearchGroup(text: string) {
        const groups = await this.prisma.group.findMany({
            where: {
                OR: [
                    { groupName: { contains: text, mode: 'insensitive' } },
                    { id: { contains: text, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                groupName: true,
                description: true,
                owner: {
                    select: {
                            username: true,
                    },
                },
            },
        });
        if (!groups) throw new NotFoundException('Group not found');
        return groups;
    }

    async findOne(id: string) {
        const group = await this.prisma.group.findUnique({
            where: { id },
            include: {
                members: true,
            },
        });
        if (!group) throw new NotFoundException('Group not found');
        return group;
    }

    async update(id: string, dto: UpdateGroupDto) {
        const existing = await this.prisma.group.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException('Location not found');
        }
        
        return this.prisma.group.update({
            where: { id },
            data: {
                ownerId: dto.ownerId,
                groupName: dto.groupName,
                groupImg: dto.groupImg,
                status: dto.status,
            },
        });
    }

    async remove(id: string) {
        try {
            await this.prisma.group.delete({ where: { id } });
            return { ok: true };
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
                throw new NotFoundException('group not found');
            }
            throw e;
        }
    }

    async groupDetails(id: string) {
        const group = await this.prisma.group.findUnique({
            where: { id },
            include: {
                members: {
                    select: {
                        userId: true,
                        status: true,
                        joinDate: true,
                        user: {
                            select: {
                                username: true,
                                profileImg: true ,
                            },
                        },
                    },
                },
            },
        });
        if (!group) throw new NotFoundException('Group not found');
        return group;
    }
}
