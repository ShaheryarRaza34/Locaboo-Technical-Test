import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import { TasksService } from "../services/tasks.service";
import { CreateTaskDto } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { FilterTaskDto } from "../dto/filter-task.dto";
import { Task, TaskStatus, TaskPriority } from "@prisma/client";

@ApiTags("tasks")
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: "Get all tasks" })
  @ApiQuery({ name: "status", enum: TaskStatus, required: false })
  @ApiQuery({ name: "priority", enum: TaskPriority, required: false })
  @ApiQuery({ name: "assignedToId", type: String, required: false })
  @ApiResponse({ status: 200, description: "List of tasks" })
  async findAll(@Query() filters: FilterTaskDto): Promise<Task[]> {
    return this.tasksService.findAll(filters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get task by ID" })
  @ApiParam({ name: "id", description: "Task ID" })
  @ApiResponse({ status: 200, description: "Task found" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async findOne(@Param("id") id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new task" })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: "Task created" })
  @ApiResponse({ status: 400, description: "Invalid data" })
  async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(createTaskDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a task" })
  @ApiParam({ name: "id", description: "Task ID" })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: "Task updated" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async update(
    @Param("id") id: string,
    @Body() updateTaskDto: UpdateTaskDto
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a task" })
  @ApiParam({ name: "id", description: "Task ID" })
  @ApiResponse({ status: 204, description: "Task deleted" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async delete(@Param("id") id: string): Promise<void> {
    await this.tasksService.delete(id);
  }

  @Post(":id/assign")
  @ApiOperation({ summary: "Assign users to task" })
  @ApiParam({ name: "id", description: "Task ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userIds: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Users assigned" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async assignUsers(
    @Param("id") id: string,
    @Body("userIds") userIds: string[]
  ): Promise<Task> {
    return this.tasksService.assignUsers(id, userIds);
  }

  @Delete(":taskId/assign/:userId")
  @ApiOperation({ summary: "Unassign user from task" })
  @ApiParam({ name: "taskId", description: "Task ID" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiResponse({ status: 200, description: "User unassigned" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async unassignUser(
    @Param("taskId") taskId: string,
    @Param("userId") userId: string
  ): Promise<Task> {
    return this.tasksService.unassignUser(taskId, userId);
  }
}
