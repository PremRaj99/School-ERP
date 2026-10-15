import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const all = await prisma.student.findMany({
    select: {
      studentId: true,
      firstName: true,
      lastName: true,
      rollNo: true,
      class: { select: { className: true, section: true, session: true } },
    },
    orderBy: { firstName: 'asc' },
  });

  // Group by firstName + lastName (case-insensitive)
  const groups = new Map<string, typeof all>();
  for (const s of all) {
    const key = `${s.firstName.toLowerCase().trim()}||${(s.lastName ?? '').toLowerCase().trim()}`;
    let g = groups.get(key);
    if (!g) {
      g = [];
      groups.set(key, g);
    }
    g.push(s);
  }

  let found = 0;
  for (const [, g] of groups) {
    if (g.length > 1) {
      found++;
      console.log(`\n${g[0]!.firstName} ${g[0]!.lastName ?? ''} (${g.length} records):`);
      for (const s of g) {
        console.log(
          `  ${s.studentId} | class ${s.class?.className}-${s.class?.section} ${s.class?.session} | roll ${s.rollNo}`,
        );
      }
    }
  }

  if (!found) {
    console.log('No duplicate names found.');
  } else {
    console.log(`\nTotal groups with duplicate names: ${found}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
