module.exports = {
    apps: [
      {
        name: 'lms-backend',
        script: 'dist/main.js',
        env: {
          SUPABASE_URL: 'https://nhqbqlouqpxzgggiptbf.supabase.co',
          SUPABASE_ANON_KEY: 'your-anon-key-here',
          DATABASE_HOST: 'aws-0-ap-southeast-1.pooler.supabase.com',
          DATABASE_PORT: 6543,
          DATABASE_USERNAME: 'postgres.nhqbqlouqpxzgggiptbf',
          DATABASE_PASSWORD: 'Asdert313@..',
          DATABASE_NAME: 'postgres',
          PORT: 3000,
        },
      },
    ],
  };
  