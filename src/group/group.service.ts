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
import { CreateExpenseGroupDto } from '../expense/dto/create-expense-group.dto';
import { UpdateGroupUserPaymentDto } from './dto/update-group-user-payment.dto';

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
            const membership = await this.prisma.userJoinGroup.create({
                data: {
                    userId: userId,
                    groupId: groupId,
                    status: 'member',
                    joinDate: new Date(),
                },
            });

            const payment = await this.prisma.groupUserPayment.create({
                data: {
                    id:randomAlphanumeric(8),
                    userId: userId,
                    groupId: groupId,
                    bank: "",
                    accountNo: "",
                    promtpayId: "",
                },
            });

            return membership;
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
        return this.prisma.group.findMany(
            {
                include: {
                 members: true,   
                }
            }
        );
    }

    async searchGroup(text: string) {
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

    async createExpenseGroup(dto: CreateExpenseGroupDto) {
        const expenseGroup = await this.prisma.expenseGroup.create({
            data: {
                id: randomAlphanumeric(8),
                groupId: dto.groupId,
                userId: dto.userId,
                amount: dto.amount,
                note: dto.note,
            },
        });
        const splitersData = dto.spliters?.map((spliter) => ({
            id: randomAlphanumeric(8),
            expenseGroupId: expenseGroup.id,
            userId: spliter.userId ,
            status: spliter.status ?? null,
        })) || [];

        if (splitersData.length > 0) {
            await this.prisma.expenseSpliter.createMany({
                data: splitersData,
            });
        }
  

        const updatedExpenseGroup = await this.prisma.expenseGroup.findUnique({
            where: { id: expenseGroup.id },
            include: {
                spliters: true,
            },
        });

        return updatedExpenseGroup;
    }

    async getExpenseGroups(groupId: string) {
        const expenseGroups = await this.prisma.expenseGroup.findMany({
            where: { groupId },
            include: {
                spliters: true,
            },
        });
        return expenseGroups;
    }

    async getExpenseSummary(groupId: string) {
        const expenses = await this.prisma.expenseGroup.findMany({
            where: { groupId },
            include: {
                spliters: true,
            },
        });

        // Collect all userIds
        const userSet = new Set<string>();
        for (const expense of expenses) {
            userSet.add(expense.userId);
            for (const spliter of expense.spliters) {
                userSet.add(spliter.userId);
            }
        }
        const userIds = Array.from(userSet);

        // Fetch user info
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true, profileImg: true },
        });
        const userMap: Record<string, { id: string; username: string; profileImg: string | null }> = {};
        for (const u of users) userMap[u.id] = u;

        // Calculate paid
        const paidMap: Record<string, number> = {};
        for (const userId of userIds) paidMap[userId] = 0;
        for (const expense of expenses) {
            paidMap[expense.userId] += Number(expense.amount) || 0;
        }

        // Calculate shouldPay
        const shouldPayMap: Record<string, number> = {};
        for (const userId of userIds) shouldPayMap[userId] = 0;
        for (const expense of expenses) {
            const splitUserIds = expense.spliters.length > 0
                ? expense.spliters.map(s => s.userId)
                : userIds;
            const splitAmount = (Number(expense.amount) || 0) / splitUserIds.length;
            for (const userId of splitUserIds) {
                shouldPayMap[userId] += splitAmount;
            }
        }

        // Net
        const netMap: Record<string, number> = {};
        for (const userId of userIds) {
            netMap[userId] = paidMap[userId] - shouldPayMap[userId];
        }

        // Transactions with user info
        const creditors = userIds.filter(uid => netMap[uid] > 0).map(uid => ({ userId: uid, amount: netMap[uid] }));
        const debtors = userIds.filter(uid => netMap[uid] < 0).map(uid => ({ userId: uid, amount: -netMap[uid] }));

        const transactions: Array<{ from: any; to: any; amount: number }> = [];
        let i = 0, j = 0;
        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];
            const payAmount = Math.min(debtor.amount, creditor.amount);
            if (payAmount > 0.0001) {
                transactions.push({
                    from: userMap[debtor.userId],
                    to: userMap[creditor.userId],
                    amount: Math.round(payAmount * 100) / 100
                });
            }
            debtor.amount -= payAmount;
            creditor.amount -= payAmount;
            if (debtor.amount < 0.0001) i++;
            if (creditor.amount < 0.0001) j++;
        }

        return {
            totalPaid: paidMap,
            totalShouldPay: shouldPayMap,
            netBalance: netMap,
            transactions,
        };
    }

    async getGroupPayments(groupId: string) {
        const payments = await this.prisma.groupUserPayment.findMany({
            where: { groupId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profileImg: true,
                    },
                },
            },
        });
        return payments;
    }

    async updateGroupPayments(id: string, dto: UpdateGroupUserPaymentDto) {
        const payments = await this.prisma.groupUserPayment.updateMany({
            where: { id },
            data: {
                bank: dto.bank || "-",
                accountNo: dto.accountNo || "-",
                promtpayId: dto.promtpayId || "-",
            },
        });
        return payments;
    }


    async deleteExpenseGroup(groupId: string, expenseGroupId: string) {
        try {
            await this.prisma.expenseGroup.deleteMany({
                where: {
                    id: expenseGroupId,
                    groupId: groupId,
                },
            });
            return { ok: true };
        }
        catch (e) {
            throw e;
        }
    }

}
