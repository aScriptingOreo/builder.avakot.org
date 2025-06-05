import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import { resolvers, typeDefs } from './graphql/schema.js';

async function startServer() {
  const app = express();

  // Enable CORS - updated to accept Docker environment
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://builderclient:3000',
      process.env.ALLOWED_ORIGIN || '*'
    ].filter(Boolean),
    credentials: true,
  }));

  // Serve static files for production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
  }

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
    context: ({ req }) => ({
      // Add any context you need here
    }),
  });

  await server.start();

  // Always use root path when USE_ROOT_PATH is true for proper Traefik routing
  const graphqlPath = process.env.USE_ROOT_PATH === 'true' ? '/' : '/graphql';

  console.log(`GraphQL endpoint will be served at path: ${graphqlPath}`);

  server.applyMiddleware({
    app,
    path: graphqlPath,
    cors: false // We handle CORS above
  });

  const PORT = process.env.PORT || 5501;
  const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces

  app.listen(PORT, HOST, () => {
    console.log(`🚀 GraphQL Server ready at http://${HOST}:${PORT}${server.graphqlPath}`);
    console.log(`📊 GraphQL Playground available at http://${HOST}:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
});
