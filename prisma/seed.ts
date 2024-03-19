import { db } from "../src/server/db";

async function main() {
  const id = "cl9ebqhxk00003b600tymydho";
  await db.account.upsert({
    where: {
      id,
    },
    create: {
      id,
      type: "example",
      provider: "example",
      providerAccountId: "example",
      user: { connect: { id: "example" } },
    },
    update: {},
  });
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
