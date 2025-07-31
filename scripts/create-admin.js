const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: "admin" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin", 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@admin.com",
        username: "admin",
        password: hashedPassword,
        isAdmin: true,
        profile: {
          create: {
            displayName: "Administrator",
            nativeLanguage: "en",
            targetLanguage: "de",
            timezone: "UTC",
          },
        },
        progress: {
          create: {
            currentLevel: 1,
            totalXP: 0,
            weeklyXP: 0,
          },
        },
        dailyStreak: {
          create: {
            currentStreak: 0,
            longestStreak: 0,
          },
        },
      },
      include: {
        profile: true,
        progress: true,
        dailyStreak: true,
      },
    });

    console.log("Admin user created successfully:", {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      isAdmin: adminUser.isAdmin,
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
