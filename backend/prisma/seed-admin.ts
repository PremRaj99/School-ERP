import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing all existing database collections...');

  // Delete all records across all models in reverse dependency order
  await prisma.financeAuditLog.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.examSubject.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.timeTable.deleteMany();
  await prisma.studentAttendance.deleteMany();
  await prisma.teacherAttendance.deleteMany();
  await prisma.feeBreakdown.deleteMany();
  await prisma.studentFee.deleteMany();
  await prisma.teacherSalary.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.classAttendance.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.academicCalendar.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ All existing data cleared.');

  // Create default Admin account
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

  console.log(`👤 Seeding Admin account (${ADMIN_USERNAME})...`);

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const adminUser = await prisma.user.create({
    data: {
      username: ADMIN_USERNAME,
      password: hashedPassword,
      role: 'Admin',
    },
  });

  console.log('✨ Seed complete!');
  console.log('-------------------------------------------');
  console.log(`Admin User ID : ${adminUser.id}`);
  console.log(`Username      : ${ADMIN_USERNAME}`);
  console.log(`Password      : ${ADMIN_PASSWORD}`);
  console.log(`Role          : ${adminUser.role}`);
  console.log('-------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
