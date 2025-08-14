import { faker } from '@faker-js/faker';
import { PrismaClient } from '../generated/prisma';
import process from 'node:process'; // Explicit import needed

const prisma = new PrismaClient();

// Debugging
console.log('Current working directory: ', process.cwd());

async function main() {
    // Seed users (100 records)
    const users = Array.from({ length: 100 }, () => ({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        username: faker.internet.username(),
        image: faker.image.avatar(),
        bio: faker.lorem.sentence(),
        isVerified: faker.datatype.boolean()
    }));

    await prisma.user.createMany({ data: users });

    // Seed tweets (300 records)
    const allUsers = await prisma.user.findMany({ select: { id: true } });
    const userIds = allUsers.map(user => user.id);

    const tweets = Array.from({ length: 300 }, () => ({
        content: faker.lorem.paragraph(),
        image: faker.image.url(),
        impression: faker.number.int({ min: 0, max: 10000 }),
        userId: faker.helpers.arrayElement(userIds)
    }));

    await prisma.tweet.createMany({ data: tweets });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
