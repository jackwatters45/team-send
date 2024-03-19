import { faker } from "@faker-js/faker";

import { db } from "../src/server/db";
import type { IContact } from "@/server/api/routers/contact";

async function createUser() {
  try {
    const name = faker.person.fullName();
    await db.user.create({
      data: {
        name: name,
        email: faker.internet.email(),
        phone: faker.phone.number(),
        username: faker.internet.userName({
          firstName: name.split(" ")[0],
          lastName: name.split(" ")[1],
        }),
        avatar: faker.image.avatar(),
        nodeMailer: faker.string.uuid(),
        twilio: faker.string.uuid(),
      },
    });
  } catch (e) {
    console.error(e);
  }
}

async function createContact() {
  try {
    return await db.contact.create({
      data: {
        name: faker.person.fullName(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
      },
    });
  } catch (e) {
    console.error(e);
  }
}

async function createGroup(userId: string, contacts: string[]) {
  try {
    const name = faker.company.name();
    return await db.group.create({
      data: {
        name: name,
        description: faker.company.catchPhrase(),
        avatar: faker.image.avatar(),
        addedContacts: contacts,
        addedGroups: [],
        phone: true,
        email: true,
        createdBy: { connect: { id: userId } },
        members: {
          connect: contacts?.map((c) => ({ id: c })),
        },
      },
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
}

//   sentAt   DateTime @default(now())
//   isScheduled     Boolean    @default(false)
//   scheduledDate   DateTime?
//   isRecurring     Boolean    @default(false)
//   recurringNum    Int?
//   recurringPeriod String?
//   isReminders     Boolean    @default(false)
//   reminders       Reminder[]

// TODO add options for scheduled, recurring, reminders
async function createMessage(
  groupId: string,
  contacts: string[],
  userId: string,
) {
  try {
    return await db.message.create({
      data: {
        content: faker.lorem.paragraph(),
        group: { connect: { id: groupId } },
        sentBy: { connect: { id: userId } },
        lastUpdatedBy: { connect: { id: userId } },
        createdBy: { connect: { id: userId } },
        recipients: {
          connect: contacts?.map((c) => ({ id: c })),
        },
        status: "sent",
      },
    });
  } catch (e) {
    console.error(e);
  }
}

// not all contacts in each group
async function main() {
  await Promise.all(Array.from({ length: 5 }).map(() => createUser()));

  const me = await db.user.upsert({
    where: { email: "jack.watters@me.com" },
    update: {},
    create: {
      name: "Jack Watters",
      email: "jack.watters@me.com",
      phone: "123-456-7890",
    },
  });

  // Seed Contacts
  const contacts = (
    (await Promise.all(
      Array.from({ length: 10 }).map(() => createContact()),
    )) as IContact[]
  ).map((c) => c.id);

  const groups = await Promise.all(
    Array.from({ length: 3 }).map(() => createGroup(me.id, contacts)),
  );

  await Promise.all(
    groups.map((group) => {
      return Promise.all(
        Array.from({ length: 5 }).map(() =>
          createMessage(group.id, contacts, me.id),
        ),
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
