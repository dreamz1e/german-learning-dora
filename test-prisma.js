const { PrismaClient } = require('@prisma/client');

async function testPrismaClient() {
  const prisma = new PrismaClient();
  
  console.log('Available models:');
  console.log('userDailyChallengeCompletion:', typeof prisma.userDailyChallengeCompletion);
  
  try {
    // Try to use the model
    const result = await prisma.userDailyChallengeCompletion.findMany({
      take: 1,
    });
    console.log('Model is working, found records:', result.length);
  } catch (error) {
    console.error('Error using model:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaClient();