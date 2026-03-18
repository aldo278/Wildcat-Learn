import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create users
  const user1 = await prisma.user.upsert({
    where: { email: 'maria@example.com' },
    update: {},
    create: {
      email: 'maria@example.com',
      name: 'Maria Garcia',
      password: 'hashedpassword123', // In production, this should be properly hashed
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'alex@example.com' },
    update: {},
    create: {
      email: 'alex@example.com',
      name: 'Alex Chen',
      password: 'hashedpassword456', // In production, this should be properly hashed
    },
  });

  console.log('✅ Users created:', { user1: user1.name, user2: user2.name });

  // Create flashcard sets
  const spanishSet = await prisma.flashcardSet.upsert({
    where: { id: 'spanish-basics' },
    update: {},
    create: {
      id: 'spanish-basics',
      title: 'Spanish Vocabulary - Basics',
      description: 'Essential Spanish words for beginners',
      isPublic: true,
      studyCount: 1234,
      authorId: user1.id,
    },
  });

  const jsSet = await prisma.flashcardSet.upsert({
    where: { id: 'js-fundamentals' },
    update: {},
    create: {
      id: 'js-fundamentals',
      title: 'JavaScript Fundamentals',
      description: 'Core concepts every JS developer should know',
      isPublic: true,
      studyCount: 892,
      authorId: user2.id,
    },
  });

  const biologySet = await prisma.flashcardSet.upsert({
    where: { id: 'biology-cells' },
    update: {},
    create: {
      id: 'biology-cells',
      title: 'Biology - Cell Structure',
      description: 'Learn about the components of cells',
      isPublic: false,
      studyCount: 45,
      authorId: user1.id,
    },
  });

  const capitalsSet = await prisma.flashcardSet.upsert({
    where: { id: 'world-capitals' },
    update: {},
    create: {
      id: 'world-capitals',
      title: 'World Capitals',
      description: 'Test your geography knowledge with world capitals',
      isPublic: true,
      studyCount: 567,
      authorId: user2.id,
    },
  });

  console.log('✅ Flashcard sets created:', {
    spanish: spanishSet.title,
    js: jsSet.title,
    biology: biologySet.title,
    capitals: capitalsSet.title,
  });

  // Create flashcards for Spanish set
  const spanishCards = [
    { term: 'Hola', definition: 'Hello' },
    { term: 'Adiós', definition: 'Goodbye' },
    { term: 'Gracias', definition: 'Thank you' },
    { term: 'Por favor', definition: 'Please' },
    { term: 'Buenos días', definition: 'Good morning' },
    { term: 'Buenas noches', definition: 'Good night' },
    { term: '¿Cómo estás?', definition: 'How are you?' },
    { term: 'Bien', definition: 'Good/Well' },
  ];

  for (const card of spanishCards) {
    await prisma.flashcard.upsert({
      where: { id: `spanish-${card.term.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `spanish-${card.term.toLowerCase().replace(/\s+/g, '-')}`,
        term: card.term,
        definition: card.definition,
        setId: spanishSet.id,
      },
    });
  }

  // Create flashcards for JavaScript set
  const jsCards = [
    { term: 'Variable', definition: 'A container for storing data values' },
    { term: 'Function', definition: 'A block of code designed to perform a particular task' },
    { term: 'Array', definition: 'An ordered collection of items' },
    { term: 'Object', definition: 'A collection of key-value pairs' },
    { term: 'Loop', definition: 'Code that runs repeatedly until a condition is met' },
    { term: 'Callback', definition: 'A function passed as an argument to another function' },
  ];

  for (const card of jsCards) {
    await prisma.flashcard.upsert({
      where: { id: `js-${card.term.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `js-${card.term.toLowerCase().replace(/\s+/g, '-')}`,
        term: card.term,
        definition: card.definition,
        setId: jsSet.id,
      },
    });
  }

  // Create flashcards for Biology set
  const biologyCards = [
    { term: 'Nucleus', definition: 'The control center of the cell containing genetic material' },
    { term: 'Mitochondria', definition: 'The powerhouse of the cell, produces ATP' },
    { term: 'Ribosome', definition: 'Synthesizes proteins from amino acids' },
    { term: 'Cell Membrane', definition: 'Selectively permeable barrier surrounding the cell' },
    { term: 'Cytoplasm', definition: 'Gel-like fluid filling the cell' },
  ];

  for (const card of biologyCards) {
    await prisma.flashcard.upsert({
      where: { id: `biology-${card.term.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `biology-${card.term.toLowerCase().replace(/\s+/g, '-')}`,
        term: card.term,
        definition: card.definition,
        setId: biologySet.id,
      },
    });
  }

  // Create flashcards for World Capitals set
  const capitalsCards = [
    { term: 'France', definition: 'Paris' },
    { term: 'Japan', definition: 'Tokyo' },
    { term: 'Australia', definition: 'Canberra' },
    { term: 'Brazil', definition: 'Brasília' },
    { term: 'Canada', definition: 'Ottawa' },
    { term: 'Egypt', definition: 'Cairo' },
    { term: 'India', definition: 'New Delhi' },
  ];

  for (const card of capitalsCards) {
    await prisma.flashcard.upsert({
      where: { id: `capital-${card.term.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `capital-${card.term.toLowerCase().replace(/\s+/g, '-')}`,
        term: card.term,
        definition: card.definition,
        setId: capitalsSet.id,
      },
    });
  }

  console.log('✅ Flashcards created for all sets');

  // Create some sample study progress
  await prisma.studyProgress.createMany({
    data: [
      {
        userId: user1.id,
        cardId: 'spanish-hola',
        known: true,
        attempts: 3,
        lastStudied: new Date('2024-03-15'),
      },
      {
        userId: user1.id,
        cardId: 'spanish-adiós',
        known: false,
        attempts: 1,
        lastStudied: new Date('2024-03-16'),
      },
      {
        userId: user2.id,
        cardId: 'js-variable',
        known: true,
        attempts: 5,
        lastStudied: new Date('2024-03-14'),
      },
    ],
  });

  console.log('✅ Study progress created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: 2 (${user1.name}, ${user2.name})`);
  console.log(`- Flashcard Sets: 4`);
  console.log(`- Total Flashcards: ${spanishCards.length + jsCards.length + biologyCards.length + capitalsCards.length}`);
  console.log(`- Study Progress: 3 entries`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
