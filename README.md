# Bnei Yeshivot Platform

Application Next.js App Router pour le site Bnei Yeshivot, l'Espace Bahour et le back-office admin.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Prisma
- Neon PostgreSQL

## Commandes

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
```

## Base de donnees

Le schema principal est dans `prisma/schema.prisma`.

Copier `.env.example` vers `.env` puis renseigner `DATABASE_URL` avant d'utiliser Prisma.
