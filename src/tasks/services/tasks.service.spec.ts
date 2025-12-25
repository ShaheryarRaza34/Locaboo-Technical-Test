import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { PrismaService } from "../../database/prisma.service";
import { UsersService } from "../../users/services/users.service";
import { TaskStatus, TaskPriority } from "@prisma/client";

describe("TasksService", () => {
  let service: TasksService;
  let prismaService: PrismaService;
  let usersService: UsersService;

  const mockPrismaService = {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    taskAssignment: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockUsersService = {
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a task successfully", async () => {
      const createTaskDto = {
        title: "Test Task",
        description: "Test Description",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
      };

      const mockTask = {
        id: "test-id",
        ...createTaskDto,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedUsers: [],
      };

      mockPrismaService.task.create.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto);

      expect(result).toBeDefined();
      expect(result.title).toBe(createTaskDto.title);
      expect(mockPrismaService.task.create).toHaveBeenCalled();
    });

    it("should create a task with assigned users", async () => {
      const mockUsers = [
        {
          id: "user-1",
          name: "John Doe",
          email: "john@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const createTaskDto = {
        title: "Test Task",
        assignedToIds: ["user-1"],
      };

      const mockTask: any = {
        id: "test-id",
        title: createTaskDto.title,
        description: null,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedUsers: [
          {
            id: "assignment-1",
            taskId: "test-id",
            userId: "user-1",
            assignedAt: new Date(),
            user: mockUsers[0],
          },
        ],
      };

      mockUsersService.findByIds.mockResolvedValue(mockUsers);
      mockPrismaService.task.create.mockResolvedValue(mockTask);

      const result: any = await service.create(createTaskDto);

      expect(result).toBeDefined();
      expect(result.assignedUsers).toHaveLength(1);
    });

    it("should throw BadRequestException for invalid user IDs", async () => {
      const createTaskDto = {
        title: "Test Task",
        assignedToIds: ["invalid-id"],
      };

      mockUsersService.findByIds.mockResolvedValue([]);

      await expect(service.create(createTaskDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("findOne", () => {
    it("should return a task by ID", async () => {
      const mockTask = {
        id: "test-id",
        title: "Test Task",
        description: "Test Description",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedUsers: [],
      };

      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.findOne("test-id");

      expect(result).toBeDefined();
      expect(result.id).toBe("test-id");
      expect(result.title).toBe("Test Task");
    });

    it("should throw NotFoundException for non-existent task", async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne("non-existent-id")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("findAll", () => {
    it("should return all tasks", async () => {
      const mockTasks = [
        {
          id: "1",
          title: "Task 1",
          description: null,
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          dueDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          assignedUsers: [],
        },
        {
          id: "2",
          title: "Task 2",
          description: null,
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          dueDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          assignedUsers: [],
        },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
    });

    it("should filter tasks by status", async () => {
      const mockTasks = [
        {
          id: "1",
          title: "Task 1",
          description: null,
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          dueDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          assignedUsers: [],
        },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.findAll({ status: TaskStatus.TODO });

      expect(result).toHaveLength(1);
      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: TaskStatus.TODO,
          }),
        })
      );
    });
  });

  describe("delete", () => {
    it("should delete a task successfully", async () => {
      const mockTask = {
        id: "test-id",
        title: "Task to Delete",
        description: null,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedUsers: [],
      };

      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.delete.mockResolvedValue(mockTask);

      await service.delete("test-id");

      expect(mockPrismaService.task.delete).toHaveBeenCalledWith({
        where: { id: "test-id" },
      });
    });

    it("should throw NotFoundException for non-existent task", async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.delete("non-existent-id")).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
