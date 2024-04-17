import { faker } from "@faker-js/faker";
import debug from "debug";
import pLimit from "p-limit";

import { db } from "../src/server/db";
import type { GroupPreview } from "@/server/api/routers/group";
import type { MemberWithContact } from "@/server/api/routers/member";
import type { Contact, ReminderPeriod } from "@prisma/client";
import { reminderPeriod } from "@/schemas/reminderSchema.ts";

const log = debug("team-send:seed");

const limit = pLimit(5);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        memberNotes: faker.lorem.sentence(),
        isRecipient: faker.datatype.boolean(0.8),
      },
    });
  } catch (e) {
    console.error(e);
  }
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
  return array;
}

async function createGroup(userId: string, contactIds: string[]) {
  try {
    const group = await db.group.create({
      data: {
        name: faker.company.name(),
        description: faker.company.catchPhrase(),
        image: faker.image.avatar(),
        addedGroupIds: [],
        useSMS: true,
        useEmail: true,
        createdBy: { connect: { id: userId } },
      },
    });

    const shuffledContactIds = shuffleArray(contactIds);
    const selectedCount = faker.number.int({
      min: 5,
      max: contactIds.length,
    });
    const selectedContactIds = shuffledContactIds.slice(0, selectedCount);

    const members = (await Promise.all(
      selectedContactIds.map((contactId) =>
        limit(() => createMember(contactId, group.id)),
      ),
    )) as unknown as MemberWithContact[];

    return { ...group, members };
  } catch (e) {
    console.error(e);
    throw e;
  }
}

const statusOptions = ["sent", "draft", "scheduled", "failed"] as const;
const getRandomStatus = (): (typeof statusOptions)[number] => {
  return statusOptions[Math.floor(Math.random() * statusOptions.length)]!;
};

const recurringPeriodOptions = ["days", "weeks", "months", "years"] as const;
const getRandomRecurringPeriod =
  (): (typeof recurringPeriodOptions)[number] => {
    return recurringPeriodOptions[
      Math.floor(Math.random() * recurringPeriodOptions.length)
    ]!;
  };

const getRandomReminderPeriod = (): ReminderPeriod => {
  return reminderPeriod[Math.floor(Math.random() * reminderPeriod.length)]!;
};

async function createReminder({ messageId }: { messageId: string }) {
  try {
    return await db.reminder.create({
      data: {
        num: faker.number.int({ min: 1, max: 4 }),
        period: getRandomReminderPeriod(),
        messageId,
      },
    });
  } catch (error) {
    console.error("Failed to create reminder:", error);
  }
}

export async function createMessage(group: GroupPreview, userId: string) {
  try {
    const randomPastDate = faker.date.past();
    const randomFutureDate = faker.date.future();

    const isScheduled = faker.datatype.boolean(0.25);
    const isRecurring = faker.datatype.boolean(0.25);
    const isReminders = faker.datatype.boolean(0.25);

    const message = await db.message.create({
      data: {
        content: faker.lorem.paragraph(),
        group: { connect: { id: group.id } },
        sentBy: { connect: { id: userId } },
        lastUpdatedBy: { connect: { id: userId } },
        createdBy: { connect: { id: userId } },
        status: getRandomStatus(),
        sendAt: isScheduled ? randomFutureDate : randomPastDate,
        isScheduled,
        scheduledDate: isScheduled ? randomFutureDate : null,
        isRecurring,
        recurringNum: isRecurring ? faker.number.int({ min: 1, max: 4 }) : null,
        recurringPeriod: isRecurring ? getRandomRecurringPeriod() : null,
        isReminders,
      },
    });

    await Promise.all(
      group.members.map((member) =>
        limit(() =>
          db.memberSnapshot.create({
            data: {
              memberNotes: member.memberNotes,
              isRecipient: member.isRecipient,
              message: { connect: { id: message.id } },
              member: { connect: { id: member.id } },
            },
          }),
        ),
      ),
    );

    if (isReminders) {
      await Promise.all(
        Array.from({ length: faker.number.int({ min: 1, max: 2 }) }).map(() =>
          createReminder({ messageId: message.id }),
        ),
      );
    }

    return message;
  } catch (e) {
    console.error(e);
  }
}

async function _dropAllTables() {
  try {
    await db.memberSnapshot.deleteMany({});
    await db.member.deleteMany({});
    await db.reminder.deleteMany({});
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

async function main() {
  await _dropAllTables();

  // await Promise.all(Array.from({ length: 2 }).map(() => createUser()));

  const me = await db.user.upsert({
    where: { email: "jack.watters@me.com" },
    update: {},
    create: {
      name: "Jack Watters",
      email: "jack.watters@me.com",
      phone: "+14155552671",
      username: "jackwatters",
      image: faker.image.avatar(),
    },
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
    Array.from({ length: 10 }).map(() => createGroup(me.id, contacts)),
  );

  await Promise.all(
    groups.map((group) => {
      return Promise.all(
        Array.from({ length: faker.number.int({ min: 5, max: 12 }) }).map(() =>
          createMessage(group, me.id),
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
