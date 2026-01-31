import { PrismaClient, MediaType, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Generate URL-friendly slug from name
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// =============================================================================
// AESTHETIC DEFINITIONS (styling is defined on frontend, DB only stores metadata)
// =============================================================================

const AESTHETICS = [
  {
    slug: 'neobrutalist',
    name: 'Neobrutalist',
    description: 'Bold, loud, and unapologetic. Thick borders, hard shadows, and vibrant colors.',
  },
  {
    slug: 'minimalist',
    name: 'Minimalist',
    description: 'Clean, spacious, and elegant. Focus on content with subtle design elements.',
  },
  {
    slug: 'terminal',
    name: 'Terminal',
    description: 'Hacker aesthetic. Monospace fonts, dark backgrounds, and glowing text.',
  },
  {
    slug: 'lavaLamp',
    name: 'Lava Lamp',
    description: 'Groovy, psychedelic vibes. Gradient backgrounds and bubbly shapes.',
  },
  {
    slug: 'pastelDream',
    name: 'Pastel Dream',
    description: 'Soft, calming, and gentle. Light pastels and rounded corners.',
  },
  {
    slug: 'editorial',
    name: 'Editorial',
    description: 'Classic print aesthetic. Serif fonts and refined, readable layouts.',
  },
  {
    slug: 'darkForest',
    name: 'Dark Forest',
    description: 'Deep, earthy, and mysterious. Dark greens and natural tones.',
  },
];

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.reviewCategory.deleteMany();
  await prisma.relatedReview.deleteMany();
  await prisma.reviewBookmark.deleteMany();
  await prisma.userBookmark.deleteMany();
  await prisma.review.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tab.deleteMany();
  await prisma.userTheme.deleteMany();
  await prisma.user.deleteMany();
  await prisma.aesthetic.deleteMany();

  // Seed aesthetics
  const aesthetics = await Promise.all(
    AESTHETICS.map((aesthetic) => prisma.aesthetic.create({ data: aesthetic })),
  );
  console.log(`Created ${aesthetics.length} aesthetics`);

  // Helper to get aesthetic by slug
  const getAesthetic = (slug: string) => aesthetics.find((a) => a.slug === slug)!;

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: '11111111-1111-1111-1111-111111111111',
        username: 'filmfanatic',
        bio: 'Movie lover and amateur critic. Always looking for the next great film.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=filmfanatic',
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        id: '22222222-2222-2222-2222-222222222222',
        username: 'bookworm_jane',
        bio: 'Devouring books since 1995. Sci-fi and fantasy are my jam.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bookworm',
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        id: '33333333-3333-3333-3333-333333333333',
        username: 'musichead',
        bio: 'Vinyl collector. From jazz to electronic, if it sounds good, I\'m in.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=musichead',
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        id: '44444444-4444-4444-4444-444444444444',
        username: 'admin_user',
        bio: 'Platform administrator',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        id: '55555555-5555-5555-5555-555555555555',
        username: 'techie_sam',
        bio: 'Software engineer by day, gamer by night. Building cool stuff.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techie',
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        id: '66666666-6666-6666-6666-666666666666',
        username: 'foodie_adventures',
        bio: 'Exploring the world one meal at a time. Restaurant reviews and home cooking tips.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=foodie',
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        id: '77777777-7777-7777-7777-777777777777',
        username: 'artsy_alex',
        bio: 'Digital artist and gallery hopper. Sharing my favorite visual experiences.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artsy',
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        id: '88888888-8888-8888-8888-888888888888',
        username: 'fitness_freak',
        bio: 'Personal trainer sharing workout routines and wellness tips.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fitness',
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        id: '99999999-9999-9999-9999-999999999999',
        username: 'travel_tales',
        bio: 'Wanderlust enthusiast. 30 countries and counting.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=travel',
        role: UserRole.USER,
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create user themes (assign different aesthetics to demo variety)
  const userThemes = await Promise.all([
    prisma.userTheme.create({
      data: {
        userId: users[0].id, // filmfanatic
        aestheticId: getAesthetic('neobrutalist').id,
        palette: 'electric', // Non-default palette
      },
    }),
    prisma.userTheme.create({
      data: {
        userId: users[1].id, // bookworm_jane
        aestheticId: getAesthetic('minimalist').id,
        // Uses default palette
      },
    }),
    prisma.userTheme.create({
      data: {
        userId: users[2].id, // musichead
        aestheticId: getAesthetic('terminal').id,
        palette: 'amber',
      },
    }),
  ]);

  console.log(`Created ${userThemes.length} user themes`);

  // Create tabs for each user
  const tabsData = [
    // filmfanatic's tabs
    { userId: users[0].id, name: 'Movies', sortOrder: 0 },
    { userId: users[0].id, name: 'TV Shows', sortOrder: 1 },
    { userId: users[0].id, name: 'Documentaries', sortOrder: 2 },
    // bookworm_jane's tabs
    { userId: users[1].id, name: 'Fiction', sortOrder: 0 },
    { userId: users[1].id, name: 'Non-Fiction', sortOrder: 1 },
    { userId: users[1].id, name: 'Comics', sortOrder: 2 },
    // musichead's tabs
    { userId: users[2].id, name: 'Albums', sortOrder: 0 },
    { userId: users[2].id, name: 'Playlists', sortOrder: 1 },
    { userId: users[2].id, name: 'Artists', sortOrder: 2 },
  ];

  const tabs = await Promise.all(
    tabsData.map((tab) =>
      prisma.tab.create({ data: { ...tab, slug: slugify(tab.name) } }),
    ),
  );

  console.log(`Created ${tabs.length} tabs`);

  // Helper to get tabs by user
  const getUserTabs = (userId: string) => tabs.filter((t) => t.userId === userId);

  // Create categories for each tab
  const filmfanaticTabs = getUserTabs(users[0].id);
  const bookwormTabs = getUserTabs(users[1].id);
  const musicTabs = getUserTabs(users[2].id);

  const categoriesData = [
    // filmfanatic's Movies tab categories
    { tabId: filmfanaticTabs[0].id, name: 'Favorites' },
    { tabId: filmfanaticTabs[0].id, name: 'Sci-Fi' },
    { tabId: filmfanaticTabs[0].id, name: 'Mind-Bending' },
    { tabId: filmfanaticTabs[0].id, name: 'Must Watch' },
    // filmfanatic's TV Shows tab categories
    { tabId: filmfanaticTabs[1].id, name: 'Favorites' },
    // bookworm_jane's Fiction tab categories
    { tabId: bookwormTabs[0].id, name: 'Favorites' },
    { tabId: bookwormTabs[0].id, name: 'Fantasy' },
    { tabId: bookwormTabs[0].id, name: 'Page-Turners' },
    // bookworm_jane's Comics tab categories
    { tabId: bookwormTabs[2].id, name: 'Favorites' },
    { tabId: bookwormTabs[2].id, name: 'Re-reads' },
    // musichead's Albums tab categories
    { tabId: musicTabs[0].id, name: 'Favorites' },
    { tabId: musicTabs[0].id, name: 'Chill Vibes' },
    { tabId: musicTabs[0].id, name: 'Late Night' },
    // musichead's Artists tab categories
    { tabId: musicTabs[2].id, name: 'Chill Vibes' },
  ];

  const categories = await Promise.all(
    categoriesData.map((cat) =>
      prisma.category.create({ data: { ...cat, slug: slugify(cat.name) } }),
    ),
  );

  console.log(`Created ${categories.length} categories`);

  // Helper to get categories by tab
  const getTabCategories = (tabId: string) => categories.filter((c) => c.tabId === tabId);

  // Create reviews for filmfanatic
  const filmfanaticMoviesCategories = getTabCategories(filmfanaticTabs[0].id);
  const filmfanaticTVCategories = getTabCategories(filmfanaticTabs[1].id);

  const filmfanaticReviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: users[0].id,
        tabId: filmfanaticTabs[0].id, // Movies
        title: 'Blade Runner 2049',
        description: `A visually stunning sequel that honors the original while forging its own path.

Denis Villeneuve crafts a masterpiece of sci-fi cinema. The cinematography by Roger Deakins is breathtaking - every frame could be a painting.

**What I loved:**
- The slow, deliberate pacing
- Hans Zimmer's haunting score
- Ryan Gosling's understated performance`,
        mediaType: MediaType.VIDEO,
        mediaUrl: 'https://www.youtube.com/watch?v=gCcx85zbxz4',
        mediaConfig: { startTime: 0 },
        metaFields: [
          { label: 'Director', value: 'Denis Villeneuve' },
          { label: 'Year', value: '2017' },
          { label: 'Runtime', value: '163 min' },
        ],
        sortOrder: 0,
        publishedAt: new Date(),
        categories: {
          create: [
            { categoryId: filmfanaticMoviesCategories[0].id }, // Favorites
            { categoryId: filmfanaticMoviesCategories[1].id }, // Sci-Fi
          ],
        },
      },
    }),
    prisma.review.create({
      data: {
        userId: users[0].id,
        tabId: filmfanaticTabs[0].id, // Movies
        title: 'Inception',
        description: `Nolan's mind-bending heist film that operates on multiple levels - literally.

The concept of dreams within dreams is executed flawlessly. The rotating hallway fight scene remains one of the most innovative action sequences ever filmed.`,
        mediaType: MediaType.VIDEO,
        mediaUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
        metaFields: [
          { label: 'Director', value: 'Christopher Nolan' },
          { label: 'Year', value: '2010' },
        ],
        sortOrder: 1,
        publishedAt: new Date(),
        categories: {
          create: [
            { categoryId: filmfanaticMoviesCategories[2].id }, // Mind-Bending
            { categoryId: filmfanaticMoviesCategories[3].id }, // Must Watch
          ],
        },
      },
    }),
    prisma.review.create({
      data: {
        userId: users[0].id,
        tabId: filmfanaticTabs[1].id, // TV Shows
        title: 'Breaking Bad',
        description: `The greatest character study in television history.

Walter White's transformation from mild-mannered chemistry teacher to drug kingpin is television at its finest. Bryan Cranston delivers a career-defining performance.`,
        mediaType: MediaType.IMAGE,
        mediaUrl: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93',
        sortOrder: 0,
        publishedAt: new Date(),
        categories: {
          create: [{ categoryId: filmfanaticTVCategories[0].id }], // Favorites
        },
      },
    }),
  ]);

  // Create reviews for bookworm_jane
  const bookwormFictionCategories = getTabCategories(bookwormTabs[0].id);
  const bookwormComicsCategories = getTabCategories(bookwormTabs[2].id);

  const bookwormReviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: users[1].id,
        tabId: bookwormTabs[0].id, // Fiction
        title: 'The Name of the Wind',
        description: `Patrick Rothfuss weaves a tale that feels like a classic from the first page.

Kvothe's story is told with such lyrical prose that you forget you're reading fantasy. The magic system is elegant and the world-building is immersive.

*Still waiting for book 3...*`,
        mediaType: MediaType.IMAGE,
        mediaUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e',
        metaFields: [
          { label: 'Author', value: 'Patrick Rothfuss' },
          { label: 'Series', value: 'The Kingkiller Chronicle' },
          { label: 'Pages', value: '662' },
        ],
        sortOrder: 0,
        publishedAt: new Date(),
        categories: {
          create: [
            { categoryId: bookwormFictionCategories[0].id }, // Favorites
            { categoryId: bookwormFictionCategories[1].id }, // Fantasy
          ],
        },
      },
    }),
    prisma.review.create({
      data: {
        userId: users[1].id,
        tabId: bookwormTabs[0].id, // Fiction
        title: 'Project Hail Mary',
        description: `Andy Weir does it again with another science-heavy survival story.

The friendship that develops is unexpected and heartwarming. The science feels real and the problem-solving is engaging.

🎵 *Rocky is the best character in recent sci-fi.*`,
        mediaType: MediaType.TEXT,
        metaFields: [
          { label: 'Author', value: 'Andy Weir' },
          { label: 'Year', value: '2021' },
        ],
        sortOrder: 1,
        publishedAt: new Date(),
        categories: {
          create: [
            { categoryId: bookwormFictionCategories[2].id }, // Page-Turners
          ],
        },
      },
    }),
    prisma.review.create({
      data: {
        userId: users[1].id,
        tabId: bookwormTabs[2].id, // Comics
        title: 'Saga',
        description: `An epic space opera that defies genre conventions.

Brian K. Vaughan and Fiona Staples created something truly special. It's romantic, violent, funny, and deeply human despite being set in a fantastical universe.`,
        mediaType: MediaType.IMAGE,
        mediaUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe',
        metaFields: [
          { label: 'Writer', value: 'Brian K. Vaughan' },
          { label: 'Artist', value: 'Fiona Staples' },
        ],
        sortOrder: 0,
        publishedAt: new Date(),
        categories: {
          create: [
            { categoryId: bookwormComicsCategories[0].id }, // Favorites
            { categoryId: bookwormComicsCategories[1].id }, // Re-reads
          ],
        },
      },
    }),
  ]);

  // Create reviews for musichead
  const musicAlbumsCategories = getTabCategories(musicTabs[0].id);
  const musicArtistsCategories = getTabCategories(musicTabs[2].id);

  const musicReviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: users[2].id,
        tabId: musicTabs[0].id, // Albums
        title: 'Random Access Memories',
        description: `Daft Punk's magnum opus and a love letter to the golden age of music production.

Every track is meticulously crafted. "Touch" is an emotional journey, and "Giorgio by Moroder" is a masterclass in storytelling through music.`,
        mediaType: MediaType.SPOTIFY,
        mediaUrl: 'https://open.spotify.com/album/4m2880jivSbbyEGAKfITCa',
        metaFields: [
          { label: 'Artist', value: 'Daft Punk' },
          { label: 'Year', value: '2013' },
          { label: 'Genre', value: 'Electronic / Disco' },
        ],
        sortOrder: 0,
        publishedAt: new Date(),
        categories: {
          create: [
            { categoryId: musicAlbumsCategories[0].id }, // Favorites
            { categoryId: musicAlbumsCategories[2].id }, // Late Night
          ],
        },
      },
    }),
    prisma.review.create({
      data: {
        userId: users[2].id,
        tabId: musicTabs[0].id, // Albums
        title: 'Kind of Blue',
        description: `The most important jazz album ever recorded. Period.

Miles Davis assembled the perfect group and they created something timeless. "So What" and "Blue in Green" are essential listening for any music lover.`,
        mediaType: MediaType.SPOTIFY,
        mediaUrl: 'https://open.spotify.com/album/1weenld61qoidwYuZ1GESA',
        metaFields: [
          { label: 'Artist', value: 'Miles Davis' },
          { label: 'Year', value: '1959' },
          { label: 'Genre', value: 'Jazz' },
        ],
        sortOrder: 1,
        publishedAt: new Date(),
        categories: {
          create: [
            { categoryId: musicAlbumsCategories[0].id }, // Favorites
            { categoryId: musicAlbumsCategories[1].id }, // Chill Vibes
          ],
        },
      },
    }),
    prisma.review.create({
      data: {
        userId: users[2].id,
        tabId: musicTabs[2].id, // Artists
        title: 'Khruangbin',
        description: `A Houston trio making some of the most unique music today.

Their blend of global influences - Thai funk, dub, psychedelia - creates something entirely their own. Perfect for any mood.`,
        mediaType: MediaType.SPOTIFY,
        mediaUrl: 'https://open.spotify.com/artist/2mVVjNmdjXZZDvhgQWiakk',
        metaFields: [
          { label: 'Origin', value: 'Houston, TX' },
          { label: 'Genre', value: 'Psychedelic / Funk' },
        ],
        sortOrder: 0,
        publishedAt: new Date(),
        categories: {
          create: [
            { categoryId: musicArtistsCategories[0].id }, // Chill Vibes
          ],
        },
      },
    }),
    // Draft review (not published)
    prisma.review.create({
      data: {
        userId: users[2].id,
        tabId: musicTabs[1].id, // Playlists
        title: 'Work in Progress Playlist',
        description: `Still curating this one...`,
        mediaType: MediaType.SPOTIFY,
        sortOrder: 0,
        publishedAt: null, // Draft
      },
    }),
  ]);

  const totalReviews = filmfanaticReviews.length + bookwormReviews.length + musicReviews.length;
  console.log(`Created ${totalReviews} reviews`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
