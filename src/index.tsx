import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers, typeDefs } from "@graphql/schema";
import { serve } from "bun";
import { readFileSync } from "fs";
import { join } from "path";

// Create GraphQL schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Read HTML template and CSS
const htmlTemplate = readFileSync(join(import.meta.dir, "index.html"), "utf-8");
const cssContent = readFileSync(join(import.meta.dir, "index.css"), "utf-8");

// Function to inject SSR content and CSS into HTML template
const injectContent = (reactHtml: string) => {
  return htmlTemplate
    .replace('<div id="root"></div>', '<div id="root"></div>')
    .replace("<title>Bun + React</title>", "<title>Soulframe Builder</title>")
    .replace(
      "</head>",
      `
    <style>${cssContent}</style>
    </head>`
    )
    .replace(
      '<script type="module" src="./frontend.tsx"></script>',
      `
    <script>
      // Simple vanilla JS app without React dependencies
      document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, creating app...');
        
        const root = document.getElementById('root');
        if (!root) {
          console.error('Root element not found!');
          return;
        }

        // Create the app structure with vanilla DOM
        const app = document.createElement('div');
        app.style.minHeight = '100vh';
        app.style.backgroundColor = 'var(--bg-darkest)';
        app.style.color = 'var(--text-primary)';
        app.style.display = 'flex';
        app.style.flexDirection = 'column';

        // Header
        const header = document.createElement('header');
        header.style.backgroundColor = 'var(--bg-darker)';
        header.style.borderBottom = '1px solid var(--divider-color)';
        header.style.padding = '1rem';
        header.style.flexShrink = '0';

        const headerContainer = document.createElement('div');
        headerContainer.style.maxWidth = '1280px';
        headerContainer.style.margin = '0 auto';
        headerContainer.style.display = 'flex';
        headerContainer.style.justifyContent = 'space-between';
        headerContainer.style.alignItems = 'center';
        headerContainer.style.width = '100%';

        const title = document.createElement('h1');
        title.textContent = 'Soulframe Builder';
        title.style.fontSize = '2rem';
        title.style.fontWeight = 'bold';
        title.style.color = 'var(--accent-tertiary)';
        title.style.margin = '0';

        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear All';
        clearButton.style.backgroundColor = 'var(--courage-color)';
        clearButton.style.color = 'var(--text-lightest)';
        clearButton.style.border = '1px solid #7a2b2c';
        clearButton.style.borderRadius = '6px';
        clearButton.style.padding = '0.5rem 1rem';
        clearButton.style.fontWeight = '600';
        clearButton.style.cursor = 'pointer';
        clearButton.onclick = () => console.log('Clear all clicked');

        headerContainer.appendChild(title);
        headerContainer.appendChild(clearButton);
        header.appendChild(headerContainer);

        // Main content container
        const main = document.createElement('main');
        main.style.flex = '1';
        main.style.maxWidth = '1280px';
        main.style.margin = '0 auto';
        main.style.padding = '1.5rem';
        main.style.width = '100%';
        main.style.boxSizing = 'border-box';

        // Three column grid container
        const gridContainer = document.createElement('div');
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = '1fr 1fr 1fr';
        gridContainer.style.gap = '2rem';
        gridContainer.style.height = 'calc(100vh - 120px)'; // Full height minus header
        gridContainer.style.minHeight = '600px';

        // Responsive breakpoints
        gridContainer.style.setProperty('--mobile-breakpoint', '768px');
        
        // Media query simulation for mobile
        const updateLayout = () => {
          if (window.innerWidth <= 768) {
            gridContainer.style.gridTemplateColumns = '1fr';
            gridContainer.style.height = 'auto';
            gridContainer.style.gap = '1.5rem';
          } else {
            gridContainer.style.gridTemplateColumns = '1fr 1fr 1fr';
            gridContainer.style.height = 'calc(100vh - 120px)';
            gridContainer.style.gap = '2rem';
          }
        };
        
        // Initial layout and resize listener
        updateLayout();
        window.addEventListener('resize', updateLayout);

        // LEFT COLUMN - Equipment Selection
        const leftColumn = document.createElement('div');
        leftColumn.className = 'card';
        leftColumn.style.display = 'flex';
        leftColumn.style.flexDirection = 'column';
        leftColumn.style.overflow = 'hidden';
        
        const leftHeader = document.createElement('div');
        leftHeader.className = 'card-header';
        leftHeader.style.flexShrink = '0';
        
        const leftTitle = document.createElement('h2');
        leftTitle.textContent = 'Equipment Selection';
        leftTitle.style.color = 'var(--accent-tertiary)';
        leftTitle.style.margin = '0';
        leftTitle.style.fontSize = '1.25rem';
        leftTitle.style.fontWeight = '600';
        
        leftHeader.appendChild(leftTitle);
        
        const leftBody = document.createElement('div');
        leftBody.className = 'card-body';
        leftBody.style.flex = '1';
        leftBody.style.overflow = 'auto';
        leftBody.style.display = 'flex';
        leftBody.style.flexDirection = 'column';
        
        const leftText = document.createElement('div');
        leftText.textContent = 'Select your equipment:';
        leftText.style.color = 'var(--text-muted)';
        leftText.style.marginBottom = '1rem';
        leftText.style.flexShrink = '0';
        
        leftBody.appendChild(leftText);
        
        // Equipment slots container
        const slotsContainer = document.createElement('div');
        slotsContainer.style.display = 'flex';
        slotsContainer.style.flexDirection = 'column';
        slotsContainer.style.gap = '0.75rem';
        slotsContainer.style.flex = '1';
        
        const slots = ['Helm', 'Upper Body', 'Lower Body', 'Totem', 'Primary Weapon', 'Secondary Weapon', 'Pact'];
        slots.forEach(slotName => {
          const slot = document.createElement('div');
          slot.style.padding = '0.75rem';
          slot.style.backgroundColor = 'var(--bg-medium)';
          slot.style.border = '1px solid var(--accent-subtle)';
          slot.style.borderRadius = '6px';
          slot.style.cursor = 'pointer';
          slot.style.transition = 'all 0.2s ease';
          slot.style.flexShrink = '0';
          
          const slotTitle = document.createElement('div');
          slotTitle.textContent = slotName;
          slotTitle.style.color = 'var(--text-secondary)';
          slotTitle.style.fontWeight = '600';
          slotTitle.style.marginBottom = '0.25rem';
          
          const slotDesc = document.createElement('div');
          slotDesc.textContent = 'Click to select...';
          slotDesc.style.color = 'var(--text-muted)';
          slotDesc.style.fontSize = '0.875rem';
          
          slot.appendChild(slotTitle);
          slot.appendChild(slotDesc);
          
          slot.onmouseenter = () => {
            slot.style.backgroundColor = 'var(--accent-subtle)';
            slot.style.borderColor = 'var(--accent-primary)';
          };
          slot.onmouseleave = () => {
            slot.style.backgroundColor = 'var(--bg-medium)';
            slot.style.borderColor = 'var(--accent-subtle)';
          };
          
          slotsContainer.appendChild(slot);
        });
        
        leftBody.appendChild(slotsContainer);
        leftColumn.appendChild(leftHeader);
        leftColumn.appendChild(leftBody);

        // MIDDLE COLUMN - Build Preview
        const middleColumn = document.createElement('div');
        middleColumn.className = 'card';
        middleColumn.style.display = 'flex';
        middleColumn.style.flexDirection = 'column';
        middleColumn.style.overflow = 'hidden';
        
        const middleHeader = document.createElement('div');
        middleHeader.className = 'card-header';
        middleHeader.style.flexShrink = '0';
        
        const middleTitle = document.createElement('h2');
        middleTitle.textContent = 'Build Preview';
        middleTitle.style.color = 'var(--grace-color)';
        middleTitle.style.margin = '0';
        middleTitle.style.fontSize = '1.25rem';
        middleTitle.style.fontWeight = '600';
        
        middleHeader.appendChild(middleTitle);
        
        const middleBody = document.createElement('div');
        middleBody.className = 'card-body';
        middleBody.style.flex = '1';
        middleBody.style.display = 'flex';
        middleBody.style.flexDirection = 'column';
        middleBody.style.alignItems = 'center';
        middleBody.style.justifyContent = 'center';
        
        const placeholderContainer = document.createElement('div');
        placeholderContainer.style.display = 'flex';
        placeholderContainer.style.flexDirection = 'column';
        placeholderContainer.style.alignItems = 'center';
        placeholderContainer.style.gap = '1rem';
        placeholderContainer.style.textAlign = 'center';
        
        const placeholderIcon = document.createElement('div');
        placeholderIcon.style.width = '80px';
        placeholderIcon.style.height = '80px';
        placeholderIcon.style.backgroundColor = 'var(--bg-dark)';
        placeholderIcon.style.border = '2px dashed var(--accent-subtle)';
        placeholderIcon.style.borderRadius = '50%';
        placeholderIcon.style.display = 'flex';
        placeholderIcon.style.alignItems = 'center';
        placeholderIcon.style.justifyContent = 'center';
        placeholderIcon.style.color = 'var(--accent-subtle)';
        placeholderIcon.style.fontSize = '2rem';
        placeholderIcon.textContent = '⚔️';
        
        const placeholderText = document.createElement('div');
        placeholderText.textContent = 'Build preview and visualization will appear here.';
        placeholderText.style.color = 'var(--text-muted)';
        
        placeholderContainer.appendChild(placeholderIcon);
        placeholderContainer.appendChild(placeholderText);
        middleBody.appendChild(placeholderContainer);
        middleColumn.appendChild(middleHeader);
        middleColumn.appendChild(middleBody);

        // RIGHT COLUMN - Build Stats
        const rightColumn = document.createElement('div');
        rightColumn.className = 'card';
        rightColumn.style.display = 'flex';
        rightColumn.style.flexDirection = 'column';
        rightColumn.style.overflow = 'hidden';
        
        const rightHeader = document.createElement('div');
        rightHeader.className = 'card-header';
        rightHeader.style.flexShrink = '0';
        
        const rightTitle = document.createElement('h2');
        rightTitle.textContent = 'Build Stats';
        rightTitle.style.color = 'var(--spirit-color)';
        rightTitle.style.margin = '0';
        rightTitle.style.fontSize = '1.25rem';
        rightTitle.style.fontWeight = '600';
        
        rightHeader.appendChild(rightTitle);
        
        const rightBody = document.createElement('div');
        rightBody.className = 'card-body';
        rightBody.style.flex = '1';
        rightBody.style.overflow = 'auto';
        rightBody.style.display = 'flex';
        rightBody.style.flexDirection = 'column';
        
        const rightText = document.createElement('div');
        rightText.textContent = 'Your build statistics:';
        rightText.style.color = 'var(--text-muted)';
        rightText.style.marginBottom = '1rem';
        rightText.style.flexShrink = '0';
        
        rightBody.appendChild(rightText);
        
        // Stats container
        const statsContainer = document.createElement('div');
        statsContainer.style.display = 'flex';
        statsContainer.style.flexDirection = 'column';
        statsContainer.style.gap = '0.75rem';
        statsContainer.style.flex = '1';
        
        const statCategories = [
          { name: 'Virtue Stats', items: ['Grace: 0', 'Spirit: 0', 'Courage: 0'] },
          { name: 'Defense', items: ['Physical Defense: 0', 'Magick Defense: 0', 'Stability: 0'] },
          { name: 'Weapon Stats', items: ['Primary Damage: 0', 'Secondary Damage: 0'] }
        ];
        
        statCategories.forEach(category => {
          const categoryContainer = document.createElement('div');
          categoryContainer.style.marginBottom = '1rem';
          categoryContainer.style.flexShrink = '0';
          
          const categoryTitle = document.createElement('div');
          categoryTitle.textContent = category.name;
          categoryTitle.style.color = 'var(--accent-tertiary)';
          categoryTitle.style.fontWeight = '600';
          categoryTitle.style.marginBottom = '0.5rem';
          categoryTitle.style.borderBottom = '1px solid var(--accent-subtle)';
          categoryTitle.style.paddingBottom = '0.25rem';
          
          categoryContainer.appendChild(categoryTitle);
          
          category.items.forEach(item => {
            const statItem = document.createElement('div');
            statItem.textContent = item;
            statItem.style.color = 'var(--text-secondary)';
            statItem.style.fontSize = '0.9rem';
            statItem.style.padding = '0.25rem 0';
            categoryContainer.appendChild(statItem);
          });
          
          statsContainer.appendChild(categoryContainer);
        });
        
        rightBody.appendChild(statsContainer);
        rightColumn.appendChild(rightHeader);
        rightColumn.appendChild(rightBody);

        // Assemble the grid
        gridContainer.appendChild(leftColumn);
        gridContainer.appendChild(middleColumn);
        gridContainer.appendChild(rightColumn);
        main.appendChild(gridContainer);
        
        app.appendChild(header);
        app.appendChild(main);
        
        root.appendChild(app);
        
        console.log('Soulframe Builder loaded successfully!');
      });
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

          // Handle slot-based queries
          if (query?.includes("helms")) {
            const { fetchData } = await import("@utils/api");
            const armors = await fetchData("MAS");
            const helms = armors.filter((a) => a.Slot === "Helm");
            return Response.json({ data: { helms } });
          }

          if (query?.includes("upperBodyArmor")) {
            const { fetchData } = await import("@utils/api");
            const armors = await fetchData("MAS");
            const upperBodyArmor = armors.filter((a) => a.Slot === "UpperBody");
            return Response.json({ data: { upperBodyArmor } });
          }

          if (query?.includes("lowerBodyArmor")) {
            const { fetchData } = await import("@utils/api");
            const armors = await fetchData("MAS");
            const lowerBodyArmor = armors.filter((a) => a.Slot === "LowerBody");
            return Response.json({ data: { lowerBodyArmor } });
          }

          if (query?.includes("totems")) {
            const { fetchData } = await import("@utils/api");
            const armors = await fetchData("MAS");
            const totems = armors.filter((a) => a.Slot === "Totem");
            return Response.json({ data: { totems } });
          }

          if (query?.includes("primaryWeapons")) {
            const { fetchData } = await import("@utils/api");
            const weapons = await fetchData("MWS");
            const primaryWeapons = weapons.filter((w) => w.Slot === "Primary");
            return Response.json({ data: { primaryWeapons } });
          }

          if (query?.includes("secondaryWeapons")) {
            const { fetchData } = await import("@utils/api");
            const weapons = await fetchData("MWS");
            const secondaryWeapons = weapons.filter(
              (w) => w.Slot === "Secondary"
            );
            return Response.json({ data: { secondaryWeapons } });
          }

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

    // Serve the React app for all other routes - NO SSR
    try {
      const html = injectContent(""); // Empty string - no SSR content

      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    } catch (error) {
      console.error("HTML Template Error:", error);
      return new Response("Error loading page", { status: 500 });
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
