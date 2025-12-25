import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { PrismaService } from "../../database/prisma.service";

describe("UsersService", () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a user successfully", async () => {
      const createUserDto = {
        name: "John Doe",
        email: "john@example.com",
      };

      const mockUser = {
        id: "test-id",
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it("should throw ConflictException for duplicate email", async () => {
      const createUserDto = {
        name: "John Doe",
        email: "john@example.com",
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: "existing-id",
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("findOne", () => {
    it("should return a user by ID", async () => {
      const mockUser = {
        id: "test-id",
        name: "Jane Doe",
        email: "jane@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne("test-id");

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: "test-id" },
      });
    });

    it("should throw NotFoundException for non-existent user", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne("non-existent-id")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      const mockUsers = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          name: "Jane Doe",
          email: "jane@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no users exist", async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("findByIds", () => {
    it("should return users for valid IDs", async () => {
      const mockUsers = [
        {
          id: "1",
          name: "User 1",
          email: "user1@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          name: "User 2",
          email: "user2@example.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findByIds(["1", "2"]);

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockUsers);
    });
  });

  describe("delete", () => {
    it("should delete a user successfully", async () => {
      const mockUser = {
        id: "test-id",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      await service.delete("test-id");

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: "test-id" },
      });
    });

    it("should throw NotFoundException for non-existent user", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.delete("non-existent-id")).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
