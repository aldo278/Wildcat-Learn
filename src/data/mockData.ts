import { FlashcardSet } from "@/types/flashcard";

export const mockFlashcardSets: FlashcardSet[] = [
  {
    id: "1",
    title: "Spanish Vocabulary - Basics",
    description: "Essential Spanish words for beginners",
    authorId: "user1",
    authorName: "Maria Garcia",
    isPublic: true,
    studyCount: 1234,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    cards: [
      { id: "1-1", term: "Hola", definition: "Hello", createdAt: new Date() },
      { id: "1-2", term: "Adiós", definition: "Goodbye", createdAt: new Date() },
      { id: "1-3", term: "Gracias", definition: "Thank you", createdAt: new Date() },
      { id: "1-4", term: "Por favor", definition: "Please", createdAt: new Date() },
      { id: "1-5", term: "Buenos días", definition: "Good morning", createdAt: new Date() },
      { id: "1-6", term: "Buenas noches", definition: "Good night", createdAt: new Date() },
      { id: "1-7", term: "¿Cómo estás?", definition: "How are you?", createdAt: new Date() },
      { id: "1-8", term: "Bien", definition: "Good/Well", createdAt: new Date() },
    ],
  },
  {
    id: "2",
    title: "JavaScript Fundamentals",
    description: "Core concepts every JS developer should know",
    authorId: "user2",
    authorName: "Alex Chen",
    isPublic: true,
    studyCount: 892,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    cards: [
      { id: "2-1", term: "Variable", definition: "A container for storing data values", createdAt: new Date() },
      { id: "2-2", term: "Function", definition: "A block of code designed to perform a particular task", createdAt: new Date() },
      { id: "2-3", term: "Array", definition: "An ordered collection of items", createdAt: new Date() },
      { id: "2-4", term: "Object", definition: "A collection of key-value pairs", createdAt: new Date() },
      { id: "2-5", term: "Loop", definition: "Code that runs repeatedly until a condition is met", createdAt: new Date() },
      { id: "2-6", term: "Callback", definition: "A function passed as an argument to another function", createdAt: new Date() },
    ],
  },
  {
    id: "3",
    title: "World Capitals",
    description: "Test your geography knowledge with world capitals",
    authorId: "user3",
    authorName: "Sam Wilson",
    isPublic: true,
    studyCount: 567,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-12"),
    cards: [
      { id: "3-1", term: "France", definition: "Paris", createdAt: new Date() },
      { id: "3-2", term: "Japan", definition: "Tokyo", createdAt: new Date() },
      { id: "3-3", term: "Australia", definition: "Canberra", createdAt: new Date() },
      { id: "3-4", term: "Brazil", definition: "Brasília", createdAt: new Date() },
      { id: "3-5", term: "Canada", definition: "Ottawa", createdAt: new Date() },
      { id: "3-6", term: "Egypt", definition: "Cairo", createdAt: new Date() },
      { id: "3-7", term: "India", definition: "New Delhi", createdAt: new Date() },
    ],
  },
  {
    id: "4",
    title: "Biology - Cell Structure",
    description: "Learn about the components of cells",
    authorId: "user1",
    authorName: "Maria Garcia",
    isPublic: false,
    studyCount: 45,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-22"),
    cards: [
      { id: "4-1", term: "Nucleus", definition: "The control center of the cell containing genetic material", createdAt: new Date() },
      { id: "4-2", term: "Mitochondria", definition: "The powerhouse of the cell, produces ATP", createdAt: new Date() },
      { id: "4-3", term: "Ribosome", definition: "Synthesizes proteins from amino acids", createdAt: new Date() },
      { id: "4-4", term: "Cell Membrane", definition: "Selectively permeable barrier surrounding the cell", createdAt: new Date() },
      { id: "4-5", term: "Cytoplasm", definition: "Gel-like fluid filling the cell", createdAt: new Date() },
    ],
  },
];

export const getSetById = (id: string): FlashcardSet | undefined => {
  return mockFlashcardSets.find((set) => set.id === id);
};

export const getUserSets = (userId: string): FlashcardSet[] => {
  return mockFlashcardSets.filter((set) => set.authorId === userId);
};

export const getPublicSets = (): FlashcardSet[] => {
  return mockFlashcardSets.filter((set) => set.isPublic);
};
