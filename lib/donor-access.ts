import { PaymentStatus, Prisma, UserRole, type User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function isAdminRole(role: UserRole | string | null | undefined) {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

export async function countDonationsForEmail(email: string, userId?: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) return 0;
  const or: Prisma.DonationWhereInput[] = [
    { donorEmail: normalizedEmail },
    {
      metadata: {
        path: ["receiptEmail"],
        equals: normalizedEmail,
      },
    },
  ];

  if (userId) {
    or.push({ userId });
  }

  return prisma.donation.count({
    where: {
      status: { not: PaymentStatus.PENDING },
      OR: or,
    },
  });
}

export async function hasBahourActivity(user: Pick<
  User,
  "id" | "firstName" | "lastName" | "phone" | "yeshiva" | "programType"
>) {
  if (
    user.firstName ||
    user.lastName ||
    user.phone ||
    user.yeshiva ||
    user.programType
  ) {
    return true;
  }

  const [requests, registrations, mivhanim] = await Promise.all([
    prisma.serviceRequest.count({ where: { userId: user.id } }),
    prisma.eventRegistration.count({ where: { userId: user.id } }),
    prisma.mivhanRegistration.count({ where: { userId: user.id } }),
  ]);

  return requests + registrations + mivhanim > 0;
}

export async function resolveAccountDestination(user: User) {
  if (isAdminRole(user.role)) {
    return "/admin";
  }

  const [bahourActivity, donationsCount] = await Promise.all([
    hasBahourActivity(user),
    countDonationsForEmail(user.email, user.id),
  ]);

  if (bahourActivity) {
    return "/client";
  }

  if (donationsCount > 0) {
    return "/donateur";
  }

  return "/client";
}
