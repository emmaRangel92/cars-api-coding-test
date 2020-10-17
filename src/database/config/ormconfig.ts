export function ormConfig(): unknown {
  return {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    autoLoadEntities: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    connectTimeout: parseInt(process.env.DB_CONNECTION_TIME_OUT, 10),
    acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIME_OUT, 10),
    extra: {
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10)
    },
    entities: [
      'dist/**/entity/*.entity.js',
    ],
    migrations: [
      'dist/database/migrations/*.js',
    ],
    subscribers: [
      'dist/observers/subscribers/*.subscriber.js',
    ],
    cli: {
      entitiesDir: 'src/components/**/entity',
      migrationsDir: 'src/database/migrations',
      subscribersDir: 'src/observers/subscribers',
    },
  };
};
