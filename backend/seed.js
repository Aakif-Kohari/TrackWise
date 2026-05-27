import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding generic data...');

  // 1. Create a dummy user
  const password = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@trackwise.com' },
    update: {},
    create: {
      username: 'DemoUser',
      email: 'demo@trackwise.com',
      password,
    },
  });

  console.log(`Created user: ${user.username} (Email: demo@trackwise.com, Pass: password123)`);

  // 2. Add Wealth Data (Income & Expenses)
  const d1 = new Date();
  d1.setDate(d1.getDate() - 1);
  const d2 = new Date();
  d2.setDate(d2.getDate() - 2);

  await prisma.income.createMany({
    data: [
      { amount: 5000, source: 'Salary', category: 'Main', description: 'Monthly Salary', date: d1, userId: user.id },
      { amount: 300, source: 'Freelance', category: 'Side Hustle', description: 'Web Design', date: d2, userId: user.id }
    ]
  });

  await prisma.expense.createMany({
    data: [
      { amount: 1200, category: 'Food', description: 'Groceries', date: d1, userId: user.id },
      { amount: 150, category: 'Travel', description: 'Gas', date: d2, userId: user.id },
      { amount: 400, category: 'Education', description: 'Online Course', date: d1, userId: user.id },
      { amount: 80, category: 'Fees', description: 'Subscriptions', date: d2, userId: user.id }
    ]
  });
  console.log('Added generic wealth records.');

  // 3. Add Habits Data
  const habit1 = await prisma.habit.create({
    data: { name: 'Morning Meditation', targetDays: 7, userId: user.id }
  });
  const habit2 = await prisma.habit.create({
    data: { name: 'Read 20 pages', targetDays: 7, userId: user.id }
  });
  const habit3 = await prisma.habit.create({
    data: { name: 'Workout', targetDays: 5, userId: user.id }
  });

  const habitLogs = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    habitLogs.push({ habitId: habit1.id, date: d, completed: Math.random() > 0.2 });
    habitLogs.push({ habitId: habit2.id, date: d, completed: Math.random() > 0.4 });
    habitLogs.push({ habitId: habit3.id, date: d, completed: Math.random() > 0.5 });
  }
  await prisma.habitLog.createMany({ data: habitLogs });
  console.log('Added generic habit tracking logs.');

  // 4. Add Study Data
  await prisma.studySession.createMany({
    data: [
      { topic: 'React Performance', goalHours: 4, hours: 2.5, completed: false, date: new Date(), userId: user.id },
      { topic: 'Advanced Finance Math', goalHours: 2, hours: 2, completed: true, date: new Date(), userId: user.id },
      { topic: 'Database Normalization', goalHours: 3, hours: 1, completed: false, date: new Date(), userId: user.id }
    ]
  });
  console.log('Added generic study sessions.');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
