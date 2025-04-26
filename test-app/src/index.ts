import { createApp } from '@vibing-ai/sdk/app';
import AppHome from './components/AppHome';

export default createApp({
  id: 'com.example.apptemplate',
  name: 'App Template',
  
  // Initialize when app is first loaded
  onInitialize: async (context) => {
    await Promise.resolve();
    console.log('App initialized with context:', context);
  },
  
  // Render the app UI
  render: ({ mount }) => {
    // Create root element
    const root = document.createElement('div');
    root.className = 'app-container';
    mount.appendChild(root);
    
    // Render the app
    const app = document.createElement('div');
    app.innerHTML = '<div id="app-root"></div>';
    root.appendChild(app);
    
    // In a real app, you would use React.render or similar
    // This is a simplified example
    const appRoot = document.getElementById('app-root');
    if (appRoot) {
      appRoot.innerHTML = `
        <div class="app-home">
          <h1>App Template</h1>
          <p>Welcome to your new app!</p>
          <button id="memory-test">Test Memory</button>
        </div>
      `;
      
      // Add event listener for the button
      const button = document.getElementById('memory-test');
      if (button) {
        button.addEventListener('click', () => {
          (async () => {
            try {
              // Example of using memory API
              const memoryData = await window.memory.get('test-key');
              alert(memoryData ? `Found data: ${JSON.stringify(memoryData)}` : 'No data found');
              
              // Set some data
              await window.memory.set('test-key', { timestamp: Date.now() });
              alert('Data saved to memory!');
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              alert(`Error: ${errorMessage}`);
            }
          })();
        });
      }
    }
    
    // Return cleanup function
    return () => {
      // Clean up event listeners, subscriptions, etc.
      const button = document.getElementById('memory-test');
      if (button) {
        // Create a function reference for the event handler
        const handleClick = () => {
          (async () => {
            try {
              // Example of using memory API
              const memoryData = await window.memory.get('test-key');
              alert(memoryData ? `Found data: ${JSON.stringify(memoryData)}` : 'No data found');
              
              // Set some data
              await window.memory.set('test-key', { timestamp: Date.now() });
              alert('Data saved to memory!');
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              alert(`Error: ${errorMessage}`);
            }
          })();
        };
        
        // Remove the event listener using the function reference
        button.removeEventListener('click', handleClick);
      }
    };
  }
}); 