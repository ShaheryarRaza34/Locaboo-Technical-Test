import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { Task, TaskStatus, TaskPriority } from "@prisma/client";
import { CreateTaskDto } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { FilterTaskDto } from "../dto/filter-task.dto";
import { UsersService } from "../../users/services/users.service";

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService
  ) {}

  async findAll(filters?: FilterTaskDto): Promise<Task[]> {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.assignedToId) {
      where.assignedUsers = {
        some: { userId: filters.assignedToId },
      };
    }

    return this.prisma.task.findMany({
      where,
      include: {
        assignedUsers: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedUsers: {
          include: { user: true },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    if (createTaskDto.assignedToIds?.length) {
      const users = await this.usersService.findByIds(
        createTaskDto.assignedToIds
      );

      if (users.length !== createTaskDto.assignedToIds.length) {
        throw new BadRequestException("Invalid user IDs provided");
      }
    }

    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status || TaskStatus.TODO,
        priority: createTaskDto.priority || TaskPriority.MEDIUM,
        dueDate: createTaskDto.dueDate
          ? new Date(createTaskDto.dueDate)
          : undefined,
        assignedUsers: createTaskDto.assignedToIds
          ? {
              create: createTaskDto.assignedToIds.map((userId) => ({
                userId,
              })),
            }
          : undefined,
      },
      include: {
        assignedUsers: {
          include: { user: true },
        },
      },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    await this.findOne(id);

    if (updateTaskDto.assignedToIds) {
      const users = await this.usersService.findByIds(
        updateTaskDto.assignedToIds
      );

      if (users.length !== updateTaskDto.assignedToIds.length) {
        throw new BadRequestException("Invalid user IDs provided");
      }

      await this.prisma.taskAssignment.deleteMany({
        where: { taskId: id },
      });
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        title: updateTaskDto.title,
        description: updateTaskDto.description,
        status: updateTaskDto.status,
        priority: updateTaskDto.priority,
        dueDate: updateTaskDto.dueDate
          ? new Date(updateTaskDto.dueDate)
          : undefined,
        assignedUsers: updateTaskDto.assignedToIds
          ? {
              create: updateTaskDto.assignedToIds.map((userId) => ({
                userId,
              })),
            }
          : undefined,
      },
      include: {
        assignedUsers: {
          include: { user: true },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.task.delete({ where: { id } });
  }

  async assignUsers(taskId: string, userIds: string[]): Promise<Task> {
    await this.findOne(taskId);

    const users = await this.usersService.findByIds(userIds);
    if (users.length !== userIds.length) {
      throw new BadRequestException("Invalid user IDs provided");
    }

    const existingAssignments = await this.prisma.taskAssignment.findMany({
      where: { taskId },
      select: { userId: true },
    });

    const existingUserIds = new Set(existingAssignments.map((a) => a.userId));
    const newUserIds = userIds.filter((userId) => !existingUserIds.has(userId));

    if (newUserIds.length > 0) {
      await this.prisma.taskAssignment.createMany({
        data: newUserIds.map((userId) => ({ taskId, userId })),
      });
    }

    return this.findOne(taskId);
  }

  async unassignUser(taskId: string, userId: string): Promise<Task> {
    await this.findOne(taskId);

    await this.prisma.taskAssignment.deleteMany({
      where: { taskId, userId },
    });

    return this.findOne(taskId);
  }
}
