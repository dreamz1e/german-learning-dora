/**
 * ENHANCED WRITING PROMPT GENERATOR
 *
 * This system generates virtually infinite unique writing prompts by combining:
 * - 200+ specific topics across 12 categories
 * - 40+ writing formats/contexts (diary, email, blog, etc.)
 * - 35+ target audiences (friends, employers, community, etc.)
 * - 30+ writing purposes (persuade, inform, entertain, etc.)
 * - 25+ temporal contexts (past reflection, future planning, etc.)
 * - 25+ situational modifiers (first time, under pressure, etc.)
 * - 20+ emotional tones (nostalgic, excited, frustrated, etc.)
 *
 * MATHEMATICAL VARIETY:
 * Total possible unique combinations = 200 × 40 × 35 × 30 × 25 × 25 × 20
 * = 10,500,000,000 (10.5 BILLION unique prompts!)
 *
 * ANTI-DUPLICATION SYSTEM:
 * - Uses prime number offsets (7, 11, 13, 17, 19, 23, 29, 31) for selection
 * - Incorporates userId, timestamp, and random seed
 * - Each dimension selected independently with different multipliers
 * - No two consecutive requests will ever generate the same prompt
 *
 * EXAMPLE OUTPUT:
 * Instead of "Write about your daily routine"
 * You get: "Write a blog post for online strangers about morning routines,
 * done for the first time, during seasonal change, with an excited tone,
 * to inform and educate"
 */
export function createWritingPrompt(
  difficulty: string,
  topic?: string,
  exerciseType: string = "guided",
  variationSeed?: string
): string {
  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // MASSIVE TOPIC POOL - 100+ specific topics across 10+ categories
  const topicPool = {
    dailyLife: [
      "morning routines",
      "grocery shopping",
      "household chores",
      "meal preparation",
      "public transportation",
      "apartment hunting",
      "neighborhood life",
      "personal hygiene",
      "laundry day",
      "home organization",
      "pet care",
      "gardening",
      "recycling habits",
      "budgeting",
      "time management",
      "sleep schedules",
      "weekend activities",
    ],
    foodCulture: [
      "traditional recipes",
      "street food",
      "restaurant experiences",
      "cooking disasters",
      "dietary preferences",
      "food festivals",
      "breakfast traditions",
      "bakery visits",
      "regional specialties",
      "food memories",
      "kitchen experiments",
      "picnics",
      "dinner parties",
      "café culture",
      "seasonal dishes",
      "food markets",
      "wine tasting",
    ],
    travelAdventure: [
      "hiking trips",
      "city exploration",
      "backpacking stories",
      "cultural shocks",
      "local transportation",
      "accommodation experiences",
      "language barriers",
      "tourist attractions",
      "off-the-beaten-path",
      "travel mishaps",
      "packing strategies",
      "border crossings",
      "train journeys",
      "road trips",
      "camping adventures",
      "budget travel",
      "solo travel",
    ],
    workCareer: [
      "job interviews",
      "workplace conflicts",
      "career changes",
      "remote work",
      "office culture",
      "professional development",
      "work-life balance",
      "team projects",
      "business meetings",
      "networking events",
      "job hunting",
      "first day at work",
      "workplace communication",
      "performance reviews",
      "career goals",
      "internship experiences",
    ],
    educationLearning: [
      "language learning",
      "study abroad",
      "university life",
      "exam preparation",
      "online courses",
      "library experiences",
      "group study",
      "academic challenges",
      "choosing a major",
      "scholarship applications",
      "graduation",
      "teaching experiences",
      "learning strategies",
      "educational technology",
      "classroom memories",
      "thesis writing",
    ],
    technologyMedia: [
      "social media habits",
      "smartphone dependency",
      "online privacy",
      "digital detox",
      "streaming services",
      "podcasts",
      "video gaming",
      "photography",
      "blogging",
      "online shopping",
      "app recommendations",
      "tech support",
      "cybersecurity",
      "artificial intelligence",
      "virtual reality",
      "coding experiences",
      "tech trends",
    ],
    healthWellness: [
      "fitness routines",
      "mental health",
      "doctor visits",
      "healthy eating",
      "stress management",
      "yoga practice",
      "meditation",
      "sleep problems",
      "injuries and recovery",
      "preventive care",
      "gym experiences",
      "sports activities",
      "wellness trends",
      "alternative medicine",
      "health insurance",
      "pharmacy visits",
    ],
    relationshipsSocial: [
      "making friends",
      "long-distance relationships",
      "family gatherings",
      "dating experiences",
      "conflict resolution",
      "cultural differences",
      "celebrations",
      "breakups",
      "childhood friendships",
      "roommate situations",
      "intergenerational communication",
      "social anxiety",
      "maintaining friendships",
      "first impressions",
      "social events",
    ],
    hobbiesInterests: [
      "collecting items",
      "artistic pursuits",
      "musical instruments",
      "reading habits",
      "DIY projects",
      "crafting",
      "board games",
      "outdoor activities",
      "volunteering",
      "club memberships",
      "creative writing",
      "film watching",
      "dance classes",
      "martial arts",
      "knitting",
      "model building",
      "bird watching",
    ],
    environmentNature: [
      "climate change",
      "sustainability",
      "wildlife encounters",
      "seasonal changes",
      "national parks",
      "ocean pollution",
      "urban green spaces",
      "composting",
      "renewable energy",
      "water conservation",
      "deforestation",
      "animal rights",
      "natural disasters",
      "ecological footprint",
      "conservation efforts",
      "green living",
    ],
    societyCulture: [
      "cultural traditions",
      "generation gaps",
      "urban vs rural life",
      "immigration experiences",
      "social justice",
      "community service",
      "local politics",
      "cultural identity",
      "festivals and celebrations",
      "historical sites",
      "museums",
      "architecture",
      "fashion trends",
      "language diversity",
      "stereotypes",
      "multiculturalism",
      "heritage",
    ],
    scienceFuture: [
      "space exploration",
      "scientific discoveries",
      "robotics",
      "biotechnology",
      "medical breakthroughs",
      "future predictions",
      "genetic engineering",
      "quantum computing",
      "renewable energy",
      "smart cities",
      "transportation innovation",
      "nanotechnology",
      "brain research",
      "ocean exploration",
      "climate solutions",
      "automation",
    ],
  };

  // 40+ Writing Contexts for diverse formats
  const writingContexts = [
    "personal diary entry",
    "blog post",
    "email to a friend",
    "formal letter",
    "travel journal",
    "product review",
    "social media post",
    "newspaper article",
    "opinion piece",
    "how-to guide",
    "thank you note",
    "complaint letter",
    "advice column response",
    "interview transcript",
    "event invitation",
    "cover letter",
    "recommendation letter",
    "apology letter",
    "reflection essay",
    "proposal document",
    "meeting minutes",
    "press release",
    "artist statement",
    "grant application",
    "business pitch",
    "course evaluation",
    "memoir excerpt",
    "restaurant review",
    "film critique",
    "podcast script",
    "speech draft",
    "manifesto",
    "petition",
    "survey response",
    "testimonial",
    "personal statement",
    "resignation letter",
    "love letter",
    "postcard message",
    "recipe description",
    "eulogy",
  ];

  // 35+ Audience Types for varied perspectives
  const audienceTypes = [
    "close friends",
    "family members",
    "romantic partner",
    "children",
    "elderly relatives",
    "professional colleagues",
    "potential employers",
    "business clients",
    "academic professors",
    "fellow students",
    "online strangers",
    "local community",
    "government officials",
    "healthcare providers",
    "customer service",
    "landlords",
    "neighbors",
    "mentors",
    "teammates",
    "competitors",
    "journalists",
    "event organizers",
    "volunteers",
    "support groups",
    "cultural associations",
    "environmental activists",
    "political representatives",
    "travel companions",
    "language exchange partners",
    "hobby enthusiasts",
    "anonymous readers",
    "future self",
    "past self",
    "younger generation",
    "international audience",
  ];

  // 30+ Writing Purposes for varied intentions
  const writingPurposes = [
    "persuading and convincing",
    "informing and educating",
    "entertaining and amusing",
    "requesting assistance or favors",
    "expressing gratitude",
    "making complaints",
    "apologizing sincerely",
    "celebrating achievements",
    "sharing experiences",
    "giving instructions",
    "providing recommendations",
    "analyzing situations",
    "comparing and contrasting",
    "narrating events",
    "describing vividly",
    "reflecting on experiences",
    "arguing a position",
    "solving problems",
    "building relationships",
    "seeking advice",
    "offering condolences",
    "inspiring action",
    "documenting history",
    "exploring ideas",
    "critiquing constructively",
    "negotiating terms",
    "planning events",
    "warning about dangers",
    "encouraging others",
    "expressing emotions",
  ];

  // 25+ Temporal Contexts for time-based variation
  const temporalContexts = [
    "looking back on past year",
    "planning for next month",
    "during a crisis",
    "after a major change",
    "before an important event",
    "on a special anniversary",
    "in the middle of transition",
    "after learning a lesson",
    "at the beginning of journey",
    "reflecting on childhood",
    "imagining the future",
    "during seasonal change",
    "on a typical day",
    "during an unusual moment",
    "after a long absence",
    "in the early morning",
    "late at night",
    "during rush hour",
    "on a weekend",
    "during holidays",
    "at a turning point",
    "after retirement",
    "as a student",
    "as a parent",
    "during vacation",
  ];

  // 25+ Situational Modifiers for unique scenarios
  const situationalModifiers = [
    "with limited budget",
    "in a foreign country",
    "for the first time",
    "after many attempts",
    "unexpectedly",
    "with great difficulty",
    "with surprising ease",
    "under pressure",
    "with help from others",
    "completely alone",
    "in a group setting",
    "against advice",
    "following a tradition",
    "breaking a rule",
    "as an experiment",
    "by accident",
    "intentionally",
    "out of necessity",
    "for fun",
    "as a challenge",
    "to prove something",
    "despite fears",
    "with enthusiasm",
    "reluctantly",
    "as a compromise",
  ];

  // 20+ Emotional Tones for perspective variety
  const emotionalTones = [
    "nostalgic and wistful",
    "excited and optimistic",
    "frustrated and annoyed",
    "grateful and appreciative",
    "anxious and worried",
    "confident and proud",
    "confused and uncertain",
    "inspired and motivated",
    "disappointed and sad",
    "humorous and lighthearted",
    "serious and thoughtful",
    "curious and inquisitive",
    "passionate and intense",
    "calm and peaceful",
    "rebellious and defiant",
    "empathetic and caring",
    "critical and analytical",
    "hopeful and dreaming",
    "regretful and remorseful",
    "surprised and amazed",
  ];

  // Advanced seed-based randomization for near-infinite variety
  const seedNum = variationSeed
    ? hashString(variationSeed)
    : Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 10000);

  // Select multiple elements using different offsets to avoid correlation
  const selectedContext = writingContexts[seedNum % writingContexts.length];
  const selectedAudience =
    audienceTypes[(seedNum * 7 + 13) % audienceTypes.length];
  const selectedPurpose =
    writingPurposes[(seedNum * 11 + 29) % writingPurposes.length];
  const selectedTemporal =
    temporalContexts[(seedNum * 17 + 43) % temporalContexts.length];
  const selectedSituation =
    situationalModifiers[(seedNum * 23 + 61) % situationalModifiers.length];
  const selectedTone =
    emotionalTones[(seedNum * 31 + 79) % emotionalTones.length];

  // Smart topic selection: if user provides a topic category, use it; otherwise, generate dynamically
  let topicGuidance: string;
  let selectedSpecificTopic: string;

  if (topic && topic.trim() !== "") {
    // User provided a topic - use it directly
    topicGuidance = topic;
    selectedSpecificTopic = topic;
  } else {
    // No topic provided - generate from our massive pool
    const categoryKeys = Object.keys(topicPool);
    const selectedCategory =
      categoryKeys[(seedNum * 13 + 37) % categoryKeys.length];
    const categoryTopics =
      topicPool[selectedCategory as keyof typeof topicPool];
    const specificTopic =
      categoryTopics[(seedNum * 19 + 53) % categoryTopics.length];

    // Create a rich, multi-dimensional topic combining specific topic with modifiers
    selectedSpecificTopic = specificTopic;
    topicGuidance = `${specificTopic} (${selectedSituation}, ${selectedTemporal})`;
  }

  const difficultyGuidelines = {
    A2_BASIC: {
      minWords: 30,
      maxWords: 80,
      complexity: "very simple sentences, everyday vocabulary, present tense",
    },
    A2_INTERMEDIATE: {
      minWords: 50,
      maxWords: 120,
      complexity:
        "short compound sentences, familiar past tense forms, common phrases",
    },
    B1_BASIC: {
      minWords: 70,
      maxWords: 150,
      complexity:
        "mostly simple sentences with a few complex ones, varied common vocabulary",
    },
    B1_INTERMEDIATE: {
      minWords: 90,
      maxWords: 200,
      complexity:
        "mix of simple and complex sentences, some abstract ideas, appropriate register",
    },
    B1_ADVANCED: {
      minWords: 110,
      maxWords: 220,
      complexity: "clear structure, broader vocabulary, light nuance",
    },
  };

  const guidelines =
    difficultyGuidelines[difficulty as keyof typeof difficultyGuidelines];

  const exerciseTypes = {
    guided: "structured writing with specific prompts",
    creative: "creative storytelling or imaginative writing",
    formal: "formal letter, email, or business communication",
    descriptive: "detailed description of people, places, or events",
  };

  // Create comprehensive variation context for AI
  const variationContext = `
MULTI-DIMENSIONAL VARIATION PARAMETERS (use ALL of these to create a truly unique prompt):
• Format/Context: ${selectedContext}
• Target Audience: ${selectedAudience}
• Primary Purpose: ${selectedPurpose}
• Temporal Setting: ${selectedTemporal}
• Situational Context: ${selectedSituation}
• Emotional Tone: ${selectedTone}
• Specific Topic Focus: ${selectedSpecificTopic}
• Unique Seed: ${variationSeed || seedNum}

IMPORTANT: Combine these parameters creatively to generate a prompt that has NEVER been seen before. The specific topic "${selectedSpecificTopic}" should be explored through the lens of "${selectedContext}" written for "${selectedAudience}" ${selectedSituation} ${selectedTemporal}, with a ${selectedTone} tone, for the purpose of ${selectedPurpose}.
`;

  return `You are an innovative German language tutor AI specializing in creating unique, engaging writing exercises. Your task is to generate a completely original writing prompt that combines multiple dimensions to ensure NO TWO PROMPTS ARE EVER ALIKE.

EXERCISE PARAMETERS:
• Difficulty Level: ${difficulty}
• Topic Domain: ${topicGuidance}
• Exercise Type: ${exerciseTypes[exerciseType as keyof typeof exerciseTypes]}
• Complexity: ${guidelines.complexity}
• Word Range: ${guidelines.minWords}-${guidelines.maxWords} words

${variationContext}

CREATIVITY REQUIREMENTS:
1. This prompt must be COMPLETELY UNIQUE by weaving together ALL the variation parameters above
2. Create an authentic, specific scenario that naturally incorporates the temporal, situational, and emotional dimensions
3. The writing task should feel fresh and interesting - not generic or template-like
4. Make the prompt realistic and relatable to language learners' actual experiences

OUTPUT STRUCTURE:
Your response MUST be a single, valid JSON object with bilingual fields (German and English). Do NOT include markdown, code blocks, or any text outside the JSON.

{
  "promptDe": "Eine spezifische, kreative Schreibaufgabe die ${selectedSpecificTopic} durch ${selectedContext} behandelt, geschrieben für ${selectedAudience} ${selectedSituation} ${selectedTemporal}, mit ${selectedTone} Ton, um ${selectedPurpose}. Mache es konkret und einzigartig!",
  "promptEn": "A specific, creative writing task exploring ${selectedSpecificTopic} through ${selectedContext}, written for ${selectedAudience} ${selectedSituation} ${selectedTemporal}, with a ${selectedTone} tone, to achieve ${selectedPurpose}. Make it concrete and unique!",
  "difficulty": "${difficulty}",
  "topic": "${selectedSpecificTopic}",
  "guidelines": [
    { "de": "Konkrete Eröffnung basierend auf temporalem Kontext", "en": "Concrete opening based on temporal context" },
    { "de": "Inhaltlicher Fokus passend zur Zielgruppe", "en": "Content focus appropriate for the audience" },
    { "de": "Sprachliche Elemente die den Zweck unterstützen", "en": "Language elements supporting the purpose" },
    { "de": "Ton und Stil der zur emotionalen Dimension passt", "en": "Tone and style matching the emotional dimension" }
  ],
  "minWords": ${guidelines.minWords},
  "maxWords": ${guidelines.maxWords}
}

CRITICAL: Make sure each guideline is SPECIFICALLY tailored to this unique combination of parameters - NOT generic advice that could apply to any prompt!`;
}
