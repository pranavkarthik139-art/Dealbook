const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true },
    });

    // Get all deals
    const deals = await prisma.deal.findMany({
      select: { id: true, name: true, userId: true, stage: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    console.log('\n========== DATABASE STATE ==========\n');

    console.log('USERS:');
    if (users.length === 0) {
      console.log('  (no users found)');
    } else {
      users.forEach(u => {
        console.log(`  ID ${u.id}: ${u.email} | Name: ${u.name} | Role: ${u.role}`);
      });
    }

    console.log(`\nDEALS (${deals.length} total):`);
    if (deals.length === 0) {
      console.log('  (no deals found)');
    } else {
      deals.forEach(d => {
        console.log(`  ID ${d.id}: ${d.name} | Stage: ${d.stage} | Status: ${d.status} | UserId: ${d.userId} | Created: ${d.createdAt.toLocaleDateString()}`);
      });
    }

    // Get count by user
    console.log('\nDEALS BY USER:');
    const userDealCounts = deals.reduce((acc, d) => {
      acc[d.userId] = (acc[d.userId] || 0) + 1;
      return acc;
    }, {});

    Object.entries(userDealCounts).forEach(([userId, count]) => {
      const user = users.find(u => u.id === parseInt(userId));
      console.log(`  UserId ${userId} (${user?.email || 'unknown'}): ${count} deals`);
    });

    console.log('\n=====================================\n');

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
