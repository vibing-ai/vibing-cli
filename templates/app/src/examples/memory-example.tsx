import React, { useState, useEffect } from 'react';
import { useMemory } from '@vibing-ai/sdk/common/memory';

/**
 * Example component demonstrating advanced Memory System usage patterns
 */
export const MemoryExample: React.FC = () => {
  // Basic memory usage with namespaced keys
  const { data: userPrefs, update: updatePrefs } = useMemory('user.preferences', {
    fallback: { theme: 'light', fontSize: 'medium', notifications: true },
    scope: 'global' // User preferences should be globally available
  });
  
  // Project-specific memory
  const { data: projectData, update: updateProject } = useMemory('project.currentProject', {
    fallback: { id: '', name: '', lastEdited: '' },
    scope: 'project' // Scoped to current project
  });
  
  // Session-based temporary memory
  const { data: sessionData, update: updateSession } = useMemory('session.temporaryData', {
    fallback: { startTime: Date.now(), views: [] },
    scope: 'conversation' // Tied to the current conversation session
  });

  // State for UI
  const [theme, setTheme] = useState(userPrefs.theme);
  const [fontSize, setFontSize] = useState(userPrefs.fontSize);
  const [notifications, setNotifications] = useState(userPrefs.notifications);
  
  // Update local state when memory changes
  useEffect(() => {
    setTheme(userPrefs.theme);
    setFontSize(userPrefs.fontSize);
    setNotifications(userPrefs.notifications);
  }, [userPrefs]);
  
  // Track page view in session memory
  useEffect(() => {
    updateSession(current => ({
      ...current,
      views: [...current.views, { page: 'MemoryExample', time: Date.now() }]
    }));
  }, []);
  
  // Handle preference changes
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    updatePrefs(current => ({ ...current, theme: newTheme }));
  };
  
  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize);
    updatePrefs(current => ({ ...current, fontSize: newSize }));
  };
  
  const handleNotificationsChange = (value: boolean) => {
    setNotifications(value);
    updatePrefs(current => ({ ...current, notifications: value }));
  };
  
  // Save project data
  const saveProjectData = () => {
    updateProject({
      id: 'proj-' + Date.now(),
      name: `Project at ${new Date().toLocaleTimeString()}`,
      lastEdited: new Date().toISOString()
    });
  };
  
  return (
    <div className="memory-example">
      <h2>Memory System Example</h2>
      
      <section className="memory-section">
        <h3>Global User Preferences</h3>
        <p>These settings persist across all projects and sessions.</p>
        
        <div className="preference-controls">
          <div className="control-group">
            <label>Theme:</label>
            <select value={theme} onChange={(e) => handleThemeChange(e.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Font Size:</label>
            <select value={fontSize} onChange={(e) => handleFontSizeChange(e.target.value)}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Notifications:</label>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => handleNotificationsChange(e.target.checked)}
            />
            <span>Enabled</span>
          </div>
        </div>
      </section>
      
      <section className="memory-section">
        <h3>Project-Specific Memory</h3>
        <p>This data is scoped to the current project.</p>
        
        <div className="project-info">
          <div>Project ID: {projectData.id || 'None'}</div>
          <div>Project Name: {projectData.name || 'Unnamed'}</div>
          <div>Last Edited: {projectData.lastEdited 
            ? new Date(projectData.lastEdited).toLocaleString() 
            : 'Never'}</div>
          
          <button onClick={saveProjectData}>
            Update Project Data
          </button>
        </div>
      </section>
      
      <section className="memory-section">
        <h3>Session Memory</h3>
        <p>This data exists only for the current conversation session.</p>
        
        <div className="session-info">
          <div>Session Start: {new Date(sessionData.startTime).toLocaleString()}</div>
          <div>Page Views: {sessionData.views.length}</div>
          
          <div className="views-list">
            {sessionData.views.map((view, index) => (
              <div key={index} className="view-item">
                {view.page} - {new Date(view.time).toLocaleTimeString()}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}; 