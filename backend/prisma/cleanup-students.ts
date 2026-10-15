/**
 * cleanup-students.ts
 *
 * 1. Remove duplicate students (same firstName + lastName + className + section).
 *    Keeps the student with the earliest dateOfAdmission (or lowest serialNumber as tiebreaker).
 *    Deletes the duplicate student's User (cascades to Student).
 *
 * 2. Move every remaining student into session "2026-2027" — if the target
 *    Class (same className + section, session "2026-2027") doesn't exist yet, it's created.
 *
 * Usage:
 *   bun prisma/cleanup-students.ts            # DRY-RUN — prints what it would do, touches nothing
 *   bun prisma/cleanup-students.ts --apply     # Actually writes to the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DRY_RUN = !process.argv.includes('--apply');

const TARGET_SESSION = '2026-2027';

interface StudentRow {
  id: string;
  studentId: string;
  serialNumber: number;
  firstName: string;
  lastName: string | null;
  dateOfAdmission: Date;
  rollNo: number;
  classId: string;
  userId: string;
  class: { className: string; section: string; session: string };
}

async function main() {
  if (DRY_RUN) {
    console.log('=== DRY-RUN MODE (pass --apply to actually write) ===\n');
  } else {
    console.log('=== APPLY MODE — changes WILL be written to the database ===\n');
  }

  // ── Step 1: Remove duplicates ──────────────────────────────────────────────

  const allStudents: StudentRow[] = await prisma.student.findMany({
    select: {
      id: true,
      studentId: true,
      serialNumber: true,
      firstName: true,
      lastName: true,
      dateOfAdmission: true,
      rollNo: true,
      classId: true,
      userId: true,
      class: { select: { className: true, section: true, session: true } },
    },
    orderBy: [{ dateOfAdmission: 'asc' }, { serialNumber: 'asc' }],
  });

  console.log(`Total students in DB: ${allStudents.length}`);

  // Group by (firstName + lastName + className + section) — case-insensitive
  const groups = new Map<string, StudentRow[]>();
  for (const s of allStudents) {
    const key = [
      s.firstName.toLowerCase().trim(),
      (s.lastName ?? '').toLowerCase().trim(),
      s.class.className.toLowerCase().trim(),
      s.class.section.toLowerCase().trim(),
    ].join('||');

    let group = groups.get(key);
    if (!group) {
      group = [];
      groups.set(key, group);
    }
    group.push(s);
  }

  const duplicateGroups = [...groups.entries()].filter(([, g]) => g.length > 1);
  console.log(`Duplicate groups found: ${duplicateGroups.length}`);

  const toDeleteUserIds: string[] = [];
  const toDeleteStudentIds: string[] = []; // human-readable IDs, for logging

  for (const [key, group] of duplicateGroups) {
    // group is already sorted by dateOfAdmission asc, serialNumber asc
    const keep = group[0]!;
    const dupes = group.slice(1);

    console.log(`\n  Group "${key}" — ${group.length} records:`);
    console.log(
      `    KEEP:   ${keep.studentId} (serial ${keep.serialNumber}, roll ${keep.rollNo}, admitted ${keep.dateOfAdmission.toISOString().slice(0, 10)}, class ${keep.class.className}-${keep.class.section} ${keep.class.session})`,
    );
    for (const d of dupes) {
      console.log(
        `    DELETE: ${d.studentId} (serial ${d.serialNumber}, roll ${d.rollNo}, admitted ${d.dateOfAdmission.toISOString().slice(0, 10)}, class ${d.class.className}-${d.class.section} ${d.class.session})`,
      );
      toDeleteUserIds.push(d.userId);
      toDeleteStudentIds.push(d.studentId);
    }
  }

  console.log(`\nTotal students to delete: ${toDeleteUserIds.length}`);

  if (!DRY_RUN && toDeleteUserIds.length > 0) {
    // Deleting the User cascades to the Student (onDelete: Cascade).
    // Process sequentially to avoid overwhelming the DB.
    for (let i = 0; i < toDeleteUserIds.length; i++) {
      const uid = toDeleteUserIds[i]!;
      const sid = toDeleteStudentIds[i]!;
      try {
        await prisma.user.delete({ where: { id: uid } });
        console.log(`  ✓ Deleted ${sid} (userId ${uid})`);
      } catch (e) {
        // If user already deleted or not found, try deleting the student directly
        try {
          const student = await prisma.student.findFirst({ where: { userId: uid } });
          if (student) {
            await prisma.student.delete({ where: { id: student.id } });
            console.log(`  ✓ Deleted student ${sid} directly (user was already gone)`);
          } else {
            console.log(`  ⚠ ${sid} — already gone, skipping`);
          }
        } catch {
          console.log(`  ⚠ ${sid} — could not delete: ${e instanceof Error ? e.message : e}`);
        }
      }
    }
  }

  // ── Step 2: Move all remaining students to 2026-2027 ──────────────────────

  console.log(`\n--- Session Migration: all students → ${TARGET_SESSION} ---\n`);

  // Re-fetch after deletions (or same set in dry-run)
  const remaining: StudentRow[] = DRY_RUN
    ? allStudents.filter((s) => !toDeleteUserIds.includes(s.userId))
    : await prisma.student.findMany({
        select: {
          id: true,
          studentId: true,
          serialNumber: true,
          firstName: true,
          lastName: true,
          dateOfAdmission: true,
          rollNo: true,
          classId: true,
          userId: true,
          class: { select: { className: true, section: true, session: true } },
        },
      });

  const alreadyInTarget = remaining.filter((s) => s.class.session === TARGET_SESSION);
  const needsMigration = remaining.filter((s) => s.class.session !== TARGET_SESSION);

  console.log(`Already in ${TARGET_SESSION}: ${alreadyInTarget.length}`);
  console.log(`Need migration: ${needsMigration.length}`);

  if (needsMigration.length === 0) {
    console.log('Nothing to migrate.');
  }

  // Group students that need migration by their target class (className + section)
  const migrationGroups = new Map<string, StudentRow[]>();
  for (const s of needsMigration) {
    const key = `${s.class.className}||${s.class.section}`;
    let group = migrationGroups.get(key);
    if (!group) {
      group = [];
      migrationGroups.set(key, group);
    }
    group.push(s);
  }

  // Track which rollNos are already taken in each target class (from students already in 2026-2027)
  const targetClassRollNos = new Map<string, Set<number>>();
  for (const s of alreadyInTarget) {
    const key = `${s.class.className}||${s.class.section}`;
    let rolls = targetClassRollNos.get(key);
    if (!rolls) {
      rolls = new Set();
      targetClassRollNos.set(key, rolls);
    }
    rolls.add(s.rollNo);
  }

  for (const [key, students] of migrationGroups) {
    const [className, section] = key.split('||');
    console.log(
      `\n  ${className}-${section}: migrating ${students.length} student(s) from their current session → ${TARGET_SESSION}`,
    );

    // Find or create the target Class
    let targetClass = await prisma.class.findUnique({
      where: {
        className_section_session: {
          className: className!,
          section: section!,
          session: TARGET_SESSION,
        },
      },
    });

    if (!targetClass && !DRY_RUN) {
      targetClass = await prisma.class.create({
        data: {
          className: className!,
          section: section!,
          session: TARGET_SESSION,
        },
      });
      console.log(
        `    Created class ${className}-${section} ${TARGET_SESSION} (id: ${targetClass.id})`,
      );
    } else if (!targetClass && DRY_RUN) {
      console.log(`    Would create class ${className}-${section} ${TARGET_SESSION}`);
    } else {
      console.log(
        `    Target class ${className}-${section} ${TARGET_SESSION} already exists (id: ${targetClass!.id})`,
      );
    }

    // Get existing rollNos in the target class to avoid conflicts
    const takenRolls = targetClassRollNos.get(key) ?? new Set<number>();

    for (const s of students) {
      let newRollNo = s.rollNo;
      // If rollNo conflicts, find the next available one
      while (takenRolls.has(newRollNo)) {
        newRollNo++;
      }
      takenRolls.add(newRollNo);

      const rollChanged = newRollNo !== s.rollNo;
      const logRoll = rollChanged ? ` (rollNo ${s.rollNo} → ${newRollNo} to avoid conflict)` : '';

      if (DRY_RUN) {
        console.log(
          `    Would move ${s.studentId} (${s.firstName} ${s.lastName ?? ''}) from ${s.class.session} → ${TARGET_SESSION}${logRoll}`,
        );
      } else {
        await prisma.student.update({
          where: { id: s.id },
          data: {
            classId: targetClass!.id,
            rollNo: newRollNo,
          },
        });
        console.log(`    ✓ Moved ${s.studentId} (${s.firstName} ${s.lastName ?? ''})${logRoll}`);
      }
    }

    // Update the tracking set
    targetClassRollNos.set(key, takenRolls);
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log('\n=== Summary ===');
  console.log(
    `Duplicates removed: ${DRY_RUN ? `${toDeleteUserIds.length} (would be)` : toDeleteUserIds.length}`,
  );
  console.log(
    `Students migrated to ${TARGET_SESSION}: ${DRY_RUN ? `${needsMigration.length} (would be)` : needsMigration.length}`,
  );

  if (DRY_RUN) {
    console.log('\n⚠ This was a DRY RUN. Nothing was changed. Run with --apply to commit.');
  } else {
    console.log('\n✅ Done!');
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
