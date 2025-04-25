import path from 'path';
import fs from 'fs-extra';
import { Manifest } from '../types';
import { createServer } from 'http';
import { Server } from 'http';
import open from 'open'; // You'll need to install this: npm install open

interface SandboxOptions {
  projectDir: string;
  manifest: Manifest;
  port: number;
  openBrowser: boolean;
}

export async function startSandbox(options: SandboxOptions): Promise<Server> {
  const { projectDir, manifest, port, openBrowser } = options;
  
  // In a real implementation, this would:
  // 1. Set up a local development server
  // 2. Configure sandboxed environment for the project
  // 3. Handle hot reloading
  // 4. Simulate platform APIs
  // 5. Provide development tools
  
  // For this example, we'll create a simple HTTP server
  const server = createServer(async (req, res) => {
    // Serve a simple HTML page
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${manifest.name} - Development Sandbox</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              h1 { color: #333; }
              .card {
                background: #f5f5f5;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .info {
                display: grid;
                grid-template-columns: 150px 1fr;
                gap: 10px;
              }
              .info div:nth-child(odd) {
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <h1>${manifest.name} - Development Sandbox</h1>
            <div class="card">
              <h2>Project Information</h2>
              <div class="info">
                <div>ID:</div>
                <div>${manifest.id}</div>
                <div>Version:</div>
                <div>${manifest.version}</div>
                <div>Type:</div>
                <div>${manifest.type}</div>
                <div>Description:</div>
                <div>${manifest.description || 'No description'}</div>
              </div>
            </div>
            <div class="card">
              <h2>Development Tools</h2>
              <ul>
                <li><a href="/debug">Debug Console</a></li>
                <li><a href="/inspector">Component Inspector</a></li>
                <li><a href="/memory">Memory Inspector</a></li>
                <li><a href="/permissions">Permission Tester</a></li>
              </ul>
            </div>
            <div class="card">
              <h2>Preview</h2>
              <iframe 
                src="/preview" 
                style="width: 100%; height: 500px; border: 1px solid #ddd; border-radius: 4px;"
              ></iframe>
            </div>
          </body>
        </html>
      `);
      return;
    }
    
    // Serve project preview
    if (req.url === '/preview') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      
      // Create a simple preview based on project type
      let preview = '<h1>Project Preview</h1><p>Preview not available for this project type.</p>';
      
      if (manifest.type === 'app') {
        preview = `
          <div style="padding: 20px;">
            <h2>${manifest.name}</h2>
            <p>${manifest.description || 'No description'}</p>
            <div id="app-root">Loading app...</div>
            <script>
              // In a real implementation, this would load the actual app
              document.getElementById('app-root').innerHTML = '<div style="padding: 20px; background: #f9f9f9; border-radius: 4px;">App UI would render here</div>';
            </script>
          </div>
        `;
      } else if (manifest.type === 'plugin') {
        preview = `
          <div style="padding: 20px;">
            <h2>${manifest.name} Plugin</h2>
            <p>${manifest.description || 'No description'}</p>
            <div style="margin-top: 20px;">
              <h3>Conversation Card Preview</h3>
              <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: white; max-width: 400px;">
                <div id="conversation-card">Loading conversation card...</div>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <h3>Context Panel Preview</h3>
              <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: white; width: 300px; height: 400px;">
                <div id="context-panel">Loading context panel...</div>
              </div>
            </div>
            <script>
              // In a real implementation, this would load the actual plugin components
              document.getElementById('conversation-card').innerHTML = '<div style="padding: 10px; background: #f5f5f5; border-radius: 4px;">Conversation Card would render here</div>';
              document.getElementById('context-panel').innerHTML = '<div style="padding: 10px; background: #f5f5f5; border-radius: 4px;">Context Panel would render here</div>';
            </script>
          </div>
        `;
      } else if (manifest.type === 'agent') {
        preview = `
          <div style="padding: 20px;">
            <h2>${manifest.name} Agent</h2>
            <p>${manifest.description || 'No description'}</p>
            <div style="margin-top: 20px; border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: white;">
              <div style="display: flex; align-items: flex-start;">
                <div style="width: 40px; height: 40px; background: #e0e0e0; border-radius: 50%; margin-right: 15px;"></div>
                <div>
                  <div style="font-weight: bold; margin-bottom: 5px;">${manifest.name}</div>
                  <div id="agent-response">Agent would respond here based on user query...</div>
                </div>
              </div>
              <div style="margin-top: 20px;">
                <input type="text" placeholder="Type your question..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
            </div>
          </div>
        `;
      }
      
      res.end(preview);
      return;
    }
    
    // Serve mock API endpoints for development
    if (req.url?.startsWith('/api/')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      
      // Simple API responses based on endpoint
      if (req.url === '/api/manifest') {
        res.end(JSON.stringify(manifest));
      } else if (req.url === '/api/memory') {
        res.end(JSON.stringify({
          items: [
            { key: 'user.preferences', value: { theme: 'light', language: 'en-US' } },
            { key: 'project.notes', value: ['Example note 1', 'Example note 2'] }
          ]
        }));
      } else {
        res.end(JSON.stringify({ error: 'Not implemented' }));
      }
      return;
    }
    
    // Serve static files from project
    const staticPath = path.join(projectDir, 'src', req.url || '');
    if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
      const ext = path.extname(staticPath);
      const contentType = getContentType(ext);
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fs.readFileSync(staticPath));
      return;
    }
    
    // 404 for everything else
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });
  
  // Start the server
  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      resolve();
    });
  });
  
  // Open browser if requested
  if (openBrowser) {
    await open(`http://localhost:${port}`);
  }
  
  return server;
}

/**
 * Helper function to get content type from file extension
 */
function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  
  return contentTypes[ext] || 'text/plain';
} 