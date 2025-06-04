import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import { resolvers, typeDefs } from './graphql/schema.js';

async function startServer() {
  const app = express();

  // Enable CORS
  app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  }));

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
  server.applyMiddleware({
    app,
    path: '/graphql',
    cors: false // We handle CORS above
  });

  const PORT = process.env.PORT || 5501; // Updated to use port 5501

  app.listen(PORT, () => {
    console.log(`🚀 GraphQL Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`📊 GraphQL Playground available at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🎯 Frontend should proxy GraphQL requests from http://localhost:3000/graphql`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
});
