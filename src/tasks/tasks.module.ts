import { Module } from "@nestjs/common";
import { TasksController } from "./controllers/tasks.controller";
import { TasksService } from "./services/tasks.service";
import { UsersModule } from "../users/users.module";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
