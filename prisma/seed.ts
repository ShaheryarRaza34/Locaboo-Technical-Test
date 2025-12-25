import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "alice@example.com" },
      update: {},
      create: {
        name: "Alice Johnson",
        email: "alice@example.com",
      },
    }),
    prisma.user.upsert({
      where: { email: "bob@example.com" },
      update: {},
      create: {
        name: "Bob Smith",
        email: "bob@example.com",
      },
    }),
    prisma.user.upsert({
      where: { email: "charlie@example.com" },
      update: {},
      create: {
        name: "Charlie Davis",
        email: "charlie@example.com",
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "Setup Development Environment",
        description: "Install Node.js, MySQL, and configure the project",
        status: "DONE",
        priority: "HIGH",
        assignedUsers: {
          create: [{ userId: users[0].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: "Design Database Schema",
        description: "Create ERD and define relationships",
        status: "DONE",
        priority: "HIGH",
        assignedUsers: {
          create: [{ userId: users[0].id }, { userId: users[1].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: "Implement User Authentication",
        description: "Add JWT-based authentication with refresh tokens",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: new Date("2025-01-31"),
        assignedUsers: {
          create: [{ userId: users[1].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: "Create API Documentation",
        description: "Document all endpoints with Swagger",
        status: "DONE",
        priority: "MEDIUM",
        assignedUsers: {
          create: [{ userId: users[2].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: "Write Unit Tests",
        description: "Achieve 80% code coverage with Jest",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        dueDate: new Date("2025-02-15"),
        assignedUsers: {
          create: [{ userId: users[1].id }, { userId: users[2].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: "Deploy to Production",
        description: "Setup CI/CD pipeline and deploy to AWS",
        status: "TODO",
        priority: "LOW",
        dueDate: new Date("2025-03-01"),
      },
    }),
  ]);

  console.log(`✅ Created ${tasks.length} tasks`);
  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

