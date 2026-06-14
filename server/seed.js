require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('./models/Video');

const sampleVideos = [
  {
    title: 'Big Buck Bunny',
    thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 596, // 9 min 56 s
    category: 'Animation'
  },
  {
    title: 'Sintel (HLS Multi-Bitrate)',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    duration: 888, // 14 min 48 s
    category: 'Fantasy'
  },
  {
    title: 'Tears of Steel',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: 734, // 12 min 14 s
    category: 'Sci-Fi'
  },
  {
    title: 'Elephants Dream',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 653, // 10 min 53 s
    category: 'Animation'
  },
  {
    title: 'For Bigger Blazes',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 15,
    category: 'Promo'
  },
  {
    title: 'For Bigger Escapes',
    thumbnail: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: 15,
    category: 'Promo'
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Deleting existing video records...');
    await Video.deleteMany({});
    console.log('Existing videos cleared.');

    console.log('Inserting sample videos...');
    const createdVideos = await Video.insertMany(sampleVideos);
    console.log(`Successfully seeded ${createdVideos.length} videos.`);

    mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
