import { seedAchievements } from '../src/lib/seedAchievements'

async function main() {
  console.log('🌱 Starting database seeding...')
  
  try {
    await seedAchievements()
    console.log('✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    process.exit(1)
  }
}

main()