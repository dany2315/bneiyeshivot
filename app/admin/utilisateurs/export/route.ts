import { UserAccountType, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/session";

const accountTypeLabels: Record<UserAccountType, string> = {
  BAHOUR: "Bahour",
  YESHIVA: "Yeshiva",
};

function userName(user: {
  firstName: string | null;
  lastName: string | null;
  name: string;
}) {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.name ||
    "Sans nom"
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR").format(date);
}

export async function GET(request: Request) {
  await requireAdminUser();

  const { searchParams } = new URL(request.url);

  const accountTypeParam = searchParams.get("accountType") ?? "";
  const selectedAccountType = Object.values(UserAccountType).includes(
    accountTypeParam as UserAccountType,
  )
    ? (accountTypeParam as UserAccountType)
    : undefined;

  const users = await prisma.user.findMany({
    where: {
      // On n'exporte que les bahourim (rôle CLIENT) : jamais les admins
      // ni les super admins.
      role: UserRole.CLIENT,
      accountType: selectedAccountType,
    },
    include: {
      _count: {
        select: {
          requests: true,
          donations: true,
          eventRegistrations: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Bnei Yeshivot";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Utilisateurs");

  sheet.columns = [
    { header: "Nom complet", key: "name", width: 28 },
    { header: "Email", key: "email", width: 32 },
    { header: "Téléphone", key: "phone", width: 18 },
    { header: "Téléphone parent", key: "parentPhone", width: 18 },
    { header: "Type de compte", key: "accountType", width: 16 },
    { header: "Yeshiva", key: "yeshiva", width: 24 },
    { header: "Email vérifié", key: "emailVerified", width: 14 },
    { header: "Nb demandes", key: "requests", width: 13 },
    { header: "Nb dons", key: "donations", width: 11 },
    { header: "Nb événements", key: "eventRegistrations", width: 15 },
    { header: "Date de création", key: "createdAt", width: 18 },
  ];

  sheet.getRow(1).font = { bold: true };

  for (const user of users) {
    sheet.addRow({
      name: userName(user),
      email: user.email,
      phone: user.phone ?? "",
      parentPhone: user.parentPhone ?? "",
      accountType: accountTypeLabels[user.accountType],
      yeshiva: user.yeshiva ?? "",
      emailVerified: user.emailVerified ? "Oui" : "Non",
      requests: user._count.requests,
      donations: user._count.donations,
      eventRegistrations: user._count.eventRegistrations,
      createdAt: formatDate(user.createdAt),
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  const fileSuffix = selectedAccountType
    ? `-${accountTypeLabels[selectedAccountType].toLowerCase()}`
    : "";

  return new NextResponse(buffer, {
    headers: {
      "Content-Disposition": `attachment; filename="utilisateurs-bnei-yeshivot${fileSuffix}.xlsx"`,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
