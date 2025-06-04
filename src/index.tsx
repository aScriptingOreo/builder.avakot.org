import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers, typeDefs } from "@graphql/schema";
import { serve } from "bun";
import { readFileSync } from "fs";
import { join } from "path";
import React from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App";

// Create GraphQL schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Read HTML template and CSS
const htmlTemplate = readFileSync(join(import.meta.dir, "index.html"), "utf-8");
const cssContent = readFileSync(join(import.meta.dir, "index.css"), "utf-8");

// Function to inject SSR content and CSS into HTML template
const injectContent = (reactHtml: string) => {
  return htmlTemplate
    .replace('<div id="root"></div>', `<div id="root">${reactHtml}</div>`)
    .replace("<title>Bun + React</title>", "<title>Soulframe Builder</title>")
    .replace(
      "</head>",
      `
    <script src="https://unpkg.com/react@19/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>${cssContent}</style>
    </head>`
    )
    .replace(
      '<script type="module" src="./frontend.tsx"></script>',
      `
    <script>
      // Enhanced client-side App component with proper theming
      function App() {
        const [isLoading, setIsLoading] = React.useState(true);

        React.useEffect(() => {
          setTimeout(() => setIsLoading(false), 1000);
        }, []);

        if (isLoading) {
          return React.createElement('div', { 
            className: 'min-h-screen flex items-center justify-center',
            style: { backgroundColor: 'var(--bg-darkest)', color: 'var(--text-primary)' }
          },
            React.createElement('div', { 
              className: 'text-xl text-shadow'
            }, 'Loading your build...')
          );
        }

        return React.createElement('div', { 
          className: 'min-h-screen',
          style: { backgroundColor: 'var(--bg-darkest)', color: 'var(--text-primary)' }
        },
          // Header
          React.createElement('header', { 
            className: 'border-b',
            style: { 
              backgroundColor: 'var(--bg-darker)', 
              borderColor: 'var(--divider-color)',
              padding: '1rem'
            }
          },
            React.createElement('div', { 
              className: 'max-w-7xl mx-auto flex justify-between items-center' 
            },
              React.createElement('h1', { 
                className: 'text-3xl font-bold text-shadow',
                style: { color: 'var(--accent-tertiary)' }
              }, 'Soulframe Builder'),
              React.createElement('button', { 
                className: 'btn-danger',
                style: {
                  backgroundColor: 'var(--courage-color)',
                  color: 'var(--text-lightest)',
                  border: '1px solid #7a2b2c',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }
              }, 'Clear All')
            )
          ),
          // Main Content
          React.createElement('main', { 
            className: 'max-w-7xl mx-auto p-6' 
          },
            React.createElement('div', { 
              className: 'grid grid-cols-1 lg:grid-cols-2 gap-8' 
            },
              // Equipment Selection Card
              React.createElement('div', { 
                className: 'card'
              },
                React.createElement('div', { 
                  className: 'card-header'
                },
                  React.createElement('h2', { 
                    className: 'text-xl font-semibold',
                    style: { color: 'var(--accent-tertiary)', margin: 0 }
                  }, 'Equipment Selection')
                ),
                React.createElement('div', { 
                  className: 'card-body'
                },
                  React.createElement('p', { 
                    style: { color: 'var(--text-muted)' }
                  }, 'Item selector component will load here...')
                )
              ),
              // Build Stats Card
              React.createElement('div', { 
                className: 'card'
              },
                React.createElement('div', { 
                  className: 'card-header'
                },
                  React.createElement('h2', { 
                    className: 'text-xl font-semibold',
                    style: { color: 'var(--spirit-color)', margin: 0 }
                  }, 'Build Stats')
                ),
                React.createElement('div', { 
                  className: 'card-body'
                },
                  React.createElement('p', { 
                    style: { color: 'var(--text-muted)' }
                  }, 'Stats display component will load here...')
                )
              )
            )
          )
        );
      }

      // Wait for React libraries to load, then render
      function initApp() {
        if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(React.createElement(App));
        } else {
          setTimeout(initApp, 100);
        }
      }
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
      } else {
        initApp();
      }
    </script>`
    );
};

const server = serve({
  port: process.env.PORT || 3000,

  async fetch(req) {
    const url = new URL(req.url);

    // Handle CSS requests
    if (url.pathname === "/index.css") {
      return new Response(cssContent, {
        headers: {
          "Content-Type": "text/css",
        },
      });
    }

    // Handle GraphQL endpoint
    if (url.pathname === "/graphql") {
      if (req.method === "POST") {
        try {
          const body = await req.json();
          const { query, variables } = body;

          // Simple GraphQL execution
          if (query?.includes("weapons")) {
            const { fetchData } = await import("@utils/api");
            const weapons = await fetchData("MWS");
            return Response.json({ data: { weapons } });
          }

          if (query?.includes("armors")) {
            const { fetchData } = await import("@utils/api");
            const armors = await fetchData("MAS");
            return Response.json({ data: { armors } });
          }

          if (query?.includes("pacts")) {
            const { fetchData } = await import("@utils/api");
            const pacts = await fetchData("MPS");
            return Response.json({ data: { pacts } });
          }

          if (query?.includes("defaultDict")) {
            const { fetchData } = await import("@utils/api");
            const defaultDict = await fetchData("defaultDict");
            return Response.json({ data: { defaultDict } });
          }

          return Response.json(
            { error: "Query not supported" },
            { status: 400 }
          );
        } catch (error) {
          return Response.json(
            { error: "GraphQL execution error" },
            { status: 500 }
          );
        }
      }

      // GraphQL playground for development
      if (req.method === "GET" && process.env.NODE_ENV !== "production") {
        return new Response(
          `
          <!DOCTYPE html>
          <html>
          <head>
            <title>GraphQL Playground</title>
          </head>
          <body>
            <div id="graphiql">
              <h1>GraphQL Endpoint Available</h1>
              <p>POST to /graphql with your queries</p>
              <pre>
Example query:
{
  weapons {
    LinkusAlias
    DisplayName
    Art
    DamageType
  }
}
              </pre>
            </div>
          </body>
          </html>
        `,
          {
            headers: { "Content-Type": "text/html" },
          }
        );
      }
    }

    // Serve the React app for all other routes
    try {
      const reactHtml = renderToString(React.createElement(App));
      const html = injectContent(reactHtml);

      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    } catch (error) {
      console.error("SSR Error:", error);
      // Fallback to client-side rendering
      const html = injectContent("");
      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,
    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(
  `🚀 Soulframe Builder running at http://localhost:${server.port || 3000}`
);
console.log(
  `📊 GraphQL endpoint: http://localhost:${server.port || 3000}/graphql`
);
