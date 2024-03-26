import { faker } from "@faker-js/faker";

import { db } from "../src/server/db";
import type { Contact, Member } from "@/server/api/routers/contact";
import type { IGroupPreview } from "@/server/api/routers/group";

async function createUser() {
  try {
    const name = faker.person.fullName();
    await db.user.create({
      data: {
        name: name,
        email: faker.internet.email(),
        phone: `+1${faker.string.numeric(10)}`,
        username: faker.internet.userName({
          firstName: name.split(" ")[0],
          lastName: name.split(" ")[1],
        }),
        image: faker.image.avatar(),
        nodeMailer: faker.string.uuid(),
        twilio: faker.string.uuid(),
      },
    });
  } catch (e) {
    console.error(e);
  }
}

async function createContact(userId: string) {
  try {
    return await db.contact.create({
      data: {
        name: faker.person.fullName(),
        phone: `+1${faker.string.numeric(10)}`,
        email: faker.internet.email(),
        createdBy: { connect: { id: userId } },
      },
    });
  } catch (e) {
    console.error(e);
  }
}

async function createMember(contactId: string, groupId: string) {
  try {
    return await db.member.create({
      data: {
        contact: { connect: { id: contactId } },
        group: { connect: { id: groupId } },
      },
    });
  } catch (e) {
    console.error(e);
  }
}

async function createGroup(userId: string, contactIds: string[]) {
  try {
    const group = await db.group.create({
      data: {
        name: faker.company.name(),
        description: faker.company.catchPhrase(),
        image: faker.image.avatar(),
        addedGroupIds: [],
        phone: true,
        email: true,
        createdBy: { connect: { id: userId } },
      },
    });

    const members = (await Promise.all(
      contactIds.map((contactId) => createMember(contactId, group.id)),
    )) as unknown as Member[];

    return { ...group, members };
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// TODO add options for scheduled, recurring, reminders
//   sentAt   DateTime @default(now())
//   isScheduled     Boolean    @default(false)
//   scheduledDate   DateTime?
//   isRecurring     Boolean    @default(false)
//   recurringNum    Int?
//   recurringPeriod String?
//   isReminders     Boolean    @default(false)
//   reminders       Reminder[]
async function createMessage(group: IGroupPreview, userId: string) {
  try {
    return await db.message.create({
      data: {
        content: faker.lorem.paragraph(),
        group: { connect: { id: group.id } },
        sentBy: { connect: { id: userId } },
        lastUpdatedBy: { connect: { id: userId } },
        createdBy: { connect: { id: userId } },
        recipients: {
          connect: group.members?.map(({ id }) => ({ id })),
        },
        status: "sent",
      },
    });
  } catch (e) {
    console.error(e);
  }
}

async function dropAllTables() {
  try {
    await db.member.deleteMany({});
    await db.account.deleteMany({
      where: {
        providerAccountId: {
          not: "70183051",
        },
      },
    });
    await db.message.deleteMany({});
    await db.contact.deleteMany({});
    await db.group.deleteMany({});
    await db.user.deleteMany({
      where: {
        email: {
          not: "jack.watters@me.com",
        },
      },
    });
    console.log("All tables dropped successfully!");
  } catch (error) {
    console.error("Error dropping tables:", error);
  }
}

// not all contacts in each group
async function main() {
  await dropAllTables();

  await Promise.all(Array.from({ length: 2 }).map(() => createUser()));

  const me = await db.user.findUnique({
    where: { email: "jack.watters@me.com" },
  });

  if (!me) {
    throw new Error("User not found");
  }

  // Seed Contacts
  const contacts = (
    (await Promise.all(
      Array.from({ length: 20 }).map(() => createContact(me.id)),
    )) as Contact[]
  ).map((c) => c.id);

  const groups = await Promise.all(
    Array.from({ length: 6 }).map(() => createGroup(me.id, contacts)),
  );

  await Promise.all(
    groups.map((group) => {
      return Promise.all(
        Array.from({ length: 6 }).map(() => createMessage(group, me.id)),
      );
    }),
  );

  console.log("Database seeded successfully!");
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
