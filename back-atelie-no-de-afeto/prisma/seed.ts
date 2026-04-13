/// <reference types="node" />
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Admin123", 12);

  // único admin criado via seed — novos cadastros são sempre CLIENT
  const admin = await prisma.user.upsert({
    where: { email: "admin@nosdeafeto.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@nosdeafeto.com",
      cpf: "52998224725",
      phone: "44999999999",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const bolsas = await prisma.category.upsert({
    where: { name: "Bolsas" },
    update: {},
    create: { name: "Bolsas" },
  });

  const almofadas = await prisma.category.upsert({
    where: { name: "Almofadas" },
    update: {},
    create: { name: "Almofadas" },
  });

  const vestidos = await prisma.category.upsert({
    where: { name: "Vestidos" },
    update: {},
    create: { name: "Vestidos" },
  });

  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      {
        name: "Vestido em crochê (granny square)",
        description:
          "Uma peça marcante, confortável e cheia de estilo — mistura o clássico artesanal com um toque moderno.",
        price: 180.0,
        stock: 50,
        imageUrl: "http://localhost:3333/uploads/bf3b783c2a4626a9cff77b15.jpeg",
        categoryId: vestidos.id,
      },
      {
        name: "Bolsa em crochê com laço",
        description:
          "Delicada e estilosa, perfeita para compor looks leves e românticos.",
        price: 75.5,
        stock: 30,
        imageUrl: "http://localhost:3333/uploads/ac5f33677b16d918e11ec49d.jpeg",
        categoryId: bolsas.id,
      },
      {
        name: "Almofadas em crochê (formato de estrela)",
        description:
          "Ideais para decoração, trazendo aconchego e um toque fofo ao ambiente.",
        price: 35.5,
        stock: 20,
        imageUrl: "http://localhost:3333/uploads/a018a2dad74f8f2eafba1489.jpeg",
        categoryId: almofadas.id,
      },
    ],
  });

  console.log(
    " ----------   Seed concluído:",
    { admin: admin.email, role: admin.role },
    " ----------",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
