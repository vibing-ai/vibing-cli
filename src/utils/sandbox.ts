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
  const server = createServer((req, res) => {
    (async () => {
      try {
        // Route requests to appropriate handlers
        if (req.url === '/') {
          handleRootRequest(res, manifest);
        } else if (req.url === '/preview') {
          handlePreviewRequest(res, manifest);
        } else if (req.url?.startsWith('/api/')) {
          handleApiRequest(req, res, manifest);
        } else {
          handleStaticFileRequest(req, res, projectDir);
        }
      } catch (error) {
        handleServerError(res);
      }
    })();
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
 * Handle request for the root page
 */
function handleRootRequest(res: http.ServerResponse, manifest: Manifest): void {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  // Generate a simple dev dashboard
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${manifest.name} - Development Sandbox</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          
          h1, h2 {
            color: #444;
          }
          
          .card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          
          .info {
            display: grid;
            grid-template-columns: 120px 1fr;
            gap: 8px;
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
}

/**
 * Handle request for the preview page
 */
function handlePreviewRequest(res: http.ServerResponse, manifest: Manifest): void {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  // Create a simple preview based on project type
  let previewContent = '<h1>Project Preview</h1><p>Preview not available for this project type.</p>';
  
  // Sanitize any user-provided inputs before including in HTML
  const sanitizedName = manifest.name ? manifest.name.replace(/[<>&"']/g, (c) => {
    return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#039;' }[c] || c;
  }) : 'Unnamed Project';
  
  const sanitizedDescription = manifest.description ? manifest.description.replace(/[<>&"']/g, (c) => {
    return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#039;' }[c] || c;
  }) : 'No description';
  
  if (manifest.type === 'app') {
    previewContent = getAppPreviewContent(sanitizedName, sanitizedDescription);
  } else if (manifest.type === 'plugin') {
    previewContent = getPluginPreviewContent(sanitizedName, sanitizedDescription);
  } else if (manifest.type === 'agent') {
    previewContent = getAgentPreviewContent(sanitizedName, sanitizedDescription);
  }
  
  res.end(previewContent);
}

/**
 * Generate preview content for App type
 */
function getAppPreviewContent(name: string, description: string): string {
  return `
    <div style="padding: 20px;">
      <h2>${name}</h2>
      <p>${description}</p>
      <div id="app-root">Loading app...</div>
      <script>
        // In a real implementation, this would load the actual app
        document.getElementById('app-root').innerHTML = '<div style="padding: 20px; background: #f9f9f9; border-radius: 4px;">App UI would render here</div>';
      </script>
    </div>
  `;
}

/**
 * Generate preview content for Plugin type
 */
function getPluginPreviewContent(name: string, description: string): string {
  return `
    <div style="padding: 20px;">
      <h2>${name} Plugin</h2>
      <p>${description}</p>
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
}

/**
 * Generate preview content for Agent type
 */
function getAgentPreviewContent(name: string, description: string): string {
  return `
    <div style="padding: 20px;">
      <h2>${name} Agent</h2>
      <p>${description}</p>
      <div style="margin-top: 20px; border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: white;">
        <div style="display: flex; align-items: flex-start;">
          <div style="width: 40px; height: 40px; background: #e0e0e0; border-radius: 50%; margin-right: 15px;"></div>
          <div>
            <div style="font-weight: bold; margin-bottom: 5px;">${name}</div>
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

/**
 * Handle API requests
 */
function handleApiRequest(req: http.IncomingMessage, res: http.ServerResponse, manifest: Manifest): void {
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
}

/**
 * Handle requests for static files
 */
function handleStaticFileRequest(req: http.IncomingMessage, res: http.ServerResponse, projectDir: string): void {
  // Serve static files from project
  const staticPath = path.join(projectDir, 'src', req.url ?? '');
  
  // Validate path to prevent directory traversal
  const normalizedPath = path.normalize(staticPath);
  if (!normalizedPath.startsWith(path.join(projectDir, 'src'))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  
  if (fs.existsSync(normalizedPath) && fs.statSync(normalizedPath).isFile()) {
    const ext = path.extname(normalizedPath);
    const contentType = getContentType(ext);
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(normalizedPath));
    return;
  }
  
  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
}

/**
 * Handle server errors
 */
function handleServerError(res: http.ServerResponse): void {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Internal Server Error');
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
  
  // Sanitize the extension and validate against whitelist
  const sanitizedExt = ext.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(contentTypes, sanitizedExt)) {
    return contentTypes[sanitizedExt];
  }
  
  return 'text/plain';
} 