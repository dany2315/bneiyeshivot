import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const admins = [
  {
    email: "contact@bneiyeshivot.com",
    firstName: "meir",
    lastName: "guetta",
  },
  {
    email: "contact@dadtech.dev",
    firstName: "david",
    lastName: "serfaty",
  },
];

for (const admin of admins) {
  await prisma.user.upsert({
    where: { email: admin.email },
    create: {
      email: admin.email,
      emailVerified: true,
      firstName: admin.firstName,
      lastName: admin.lastName,
      name: `${admin.firstName} ${admin.lastName}`,
      role: UserRole.ADMIN,
    },
    update: {
      emailVerified: true,
      firstName: admin.firstName,
      lastName: admin.lastName,
      name: `${admin.firstName} ${admin.lastName}`,
      role: UserRole.ADMIN,
    },
  });
}

await prisma.$disconnect();

console.info("Admin users are ready.");
