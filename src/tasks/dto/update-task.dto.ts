import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
} from "class-validator";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: "Updated task title" })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: "Updated description" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: "2024-12-31T23:59:59Z" })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    example: ["550e8400-e29b-41d4-a716-446655440000"],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  assignedToIds?: string[];
}
