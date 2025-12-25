import { Module } from "@nestjs/common";
import { TasksModule } from "./tasks/tasks.module";
import { UsersModule } from "./users/users.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [DatabaseModule, TasksModule, UsersModule],
})
export class AppModule {}
