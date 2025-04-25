# Vibing-CLI: Stage 2 Implementation Plan

With the core functionality of the Vibing-CLI successfully implemented, this Stage 2 plan focuses on enhancing the developer experience, adding advanced features, and creating a more robust ecosystem for the AI Marketplace. Each section includes Cursor Agent prompts for implementation.

## 1. Enhanced Templates & Examples

### 1.1 Advanced App Templates

**Cursor Agent Prompt:**
```
Enhance the app template with more sophisticated examples, including:

1. Create templates/app/src/examples/memory-example.tsx with a comprehensive example of using the Memory System:
```tsx
import React, { useState, useEffect } from 'react';
import { useMemory } from '@ai-marketplace/sdk/common/memory';

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
```

2. Create templates/app/src/examples/permission-example.tsx with an example of permission handling:
```tsx
import React, { useState, useEffect } from 'react';
import { usePermissions } from '@ai-marketplace/sdk/common/permissions';

/**
 * Example component demonstrating permission request patterns
 */
export const PermissionExample: React.FC = () => {
  const { request, check, requestAll, revoke } = usePermissions();
  
  // Track permission states
  const [hasMemoryReadPermission, setHasMemoryReadPermission] = useState(false);
  const [hasMemoryWritePermission, setHasMemoryWritePermission] = useState(false);
  const [hasUserProfilePermission, setHasUserProfilePermission] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);
  
  // Check existing permissions on mount
  useEffect(() => {
    const checkExistingPermissions = async () => {
      setIsCheckingPermissions(true);
      
      // Check memory read permission
      const canReadMemory = await check({
        type: 'memory',
        access: ['read'],
        scope: 'project'
      });
      setHasMemoryReadPermission(canReadMemory);
      
      // Check memory write permission
      const canWriteMemory = await check({
        type: 'memory',
        access: ['write'],
        scope: 'project'
      });
      setHasMemoryWritePermission(canWriteMemory);
      
      // Check user profile permission
      const canAccessProfile = await check({
        type: 'user',
        access: ['profile'],
        scope: 'read'
      });
      setHasUserProfilePermission(canAccessProfile);
      
      setIsCheckingPermissions(false);
    };
    
    checkExistingPermissions();
  }, []);
  
  // Request memory read permission
  const requestMemoryReadPermission = async () => {
    try {
      const granted = await request({
        type: 'memory',
        access: ['read'],
        scope: 'project',
        purpose: 'Access your project data for enhanced functionality',
        duration: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      setHasMemoryReadPermission(granted);
      
      if (!granted) {
        console.log('User denied memory read permission');
      }
    } catch (error) {
      console.error('Error requesting memory read permission:', error);
    }
  };
  
  // Request memory write permission
  const requestMemoryWritePermission = async () => {
    try {
      const granted = await request({
        type: 'memory',
        access: ['write'],
        scope: 'project',
        purpose: 'Save your project data for future sessions',
        duration: 24 * 60 * 60 * 1000 // 1 day
      });
      
      setHasMemoryWritePermission(granted);
      
      if (!granted) {
        console.log('User denied memory write permission');
      }
    } catch (error) {
      console.error('Error requesting memory write permission:', error);
    }
  };
  
  // Request user profile permission
  const requestUserProfilePermission = async () => {
    try {
      const granted = await request({
        type: 'user',
        access: ['profile'],
        scope: 'read',
        purpose: 'Access your profile information to personalize your experience',
        duration: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      
      setHasUserProfilePermission(granted);
      
      if (!granted) {
        console.log('User denied profile permission');
      }
    } catch (error) {
      console.error('Error requesting profile permission:', error);
    }
  };
  
  // Request all permissions at once
  const requestAllPermissions = async () => {
    try {
      const results = await requestAll([
        {
          type: 'memory',
          access: ['read', 'write'],
          scope: 'project',
          purpose: 'Access and save your project data'
        },
        {
          type: 'user',
          access: ['profile'],
          scope: 'read',
          purpose: 'Access your profile information'
        }
      ]);
      
      setHasMemoryReadPermission(!!results['memory.read.project']);
      setHasMemoryWritePermission(!!results['memory.write.project']);
      setHasUserProfilePermission(!!results['user.profile.read']);
    } catch (error) {
      console.error('Error requesting all permissions:', error);
    }
  };
  
  // Revoke memory permissions
  const revokeMemoryPermissions = async () => {
    try {
      if (hasMemoryReadPermission) {
        await revoke('memory.read.project');
        setHasMemoryReadPermission(false);
      }
      
      if (hasMemoryWritePermission) {
        await revoke('memory.write.project');
        setHasMemoryWritePermission(false);
      }
    } catch (error) {
      console.error('Error revoking permissions:', error);
    }
  };
  
  // Revoke user profile permission
  const revokeProfilePermission = async () => {
    try {
      if (hasUserProfilePermission) {
        await revoke('user.profile.read');
        setHasUserProfilePermission(false);
      }
    } catch (error) {
      console.error('Error revoking permission:', error);
    }
  };
  
  if (isCheckingPermissions) {
    return <div>Checking permissions...</div>;
  }
  
  return (
    <div className="permission-example">
      <h2>Permission System Example</h2>
      
      <section className="permission-section">
        <h3>Current Permission Status</h3>
        
        <div className="permission-status">
          <div className={`status-item ${hasMemoryReadPermission ? 'granted' : 'denied'}`}>
            <span className="status-icon">{hasMemoryReadPermission ? '✅' : '❌'}</span>
            <span className="status-name">Memory Read</span>
          </div>
          
          <div className={`status-item ${hasMemoryWritePermission ? 'granted' : 'denied'}`}>
            <span className="status-icon">{hasMemoryWritePermission ? '✅' : '❌'}</span>
            <span className="status-name">Memory Write</span>
          </div>
          
          <div className={`status-item ${hasUserProfilePermission ? 'granted' : 'denied'}`}>
            <span className="status-icon">{hasUserProfilePermission ? '✅' : '❌'}</span>
            <span className="status-name">User Profile</span>
          </div>
        </div>
      </section>
      
      <section className="permission-section">
        <h3>Request Individual Permissions</h3>
        <p>Request specific permissions with custom durations and purposes.</p>
        
        <div className="permission-actions">
          <button 
            onClick={requestMemoryReadPermission} 
            disabled={hasMemoryReadPermission}
          >
            Request Memory Read
          </button>
          
          <button 
            onClick={requestMemoryWritePermission} 
            disabled={hasMemoryWritePermission}
          >
            Request Memory Write
          </button>
          
          <button 
            onClick={requestUserProfilePermission} 
            disabled={hasUserProfilePermission}
          >
            Request User Profile
          </button>
        </div>
      </section>
      
      <section className="permission-section">
        <h3>Request All Permissions</h3>
        <p>Request multiple permissions in a single dialog.</p>
        
        <button 
          onClick={requestAllPermissions}
          disabled={hasMemoryReadPermission && hasMemoryWritePermission && hasUserProfilePermission}
        >
          Request All Permissions
        </button>
      </section>
      
      <section className="permission-section">
        <h3>Revoke Permissions</h3>
        <p>Programmatically revoke previously granted permissions.</p>
        
        <div className="permission-actions">
          <button 
            onClick={revokeMemoryPermissions}
            disabled={!hasMemoryReadPermission && !hasMemoryWritePermission}
          >
            Revoke Memory Permissions
          </button>
          
          <button 
            onClick={revokeProfilePermission}
            disabled={!hasUserProfilePermission}
          >
            Revoke Profile Permission
          </button>
        </div>
      </section>
    </div>
  );
};
```

3. Create templates/app/src/examples/super-agent-example.tsx with an example of Super Agent integration:
```tsx
import React, { useState, useEffect } from 'react';
import { useSuperAgent } from '@ai-marketplace/sdk/common/super-agent';

/**
 * Example component demonstrating Super Agent integration
 */
export const SuperAgentExample: React.FC = () => {
  const { askSuperAgent, suggestAction, onIntent, getConversationContext } = useSuperAgent();
  
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [context, setContext] = useState<any>(null);
  
  // Register intent handler on mount
  useEffect(() => {
    // Handle "summarize" intent from Super Agent
    const unsubscribe = onIntent('summarize', async (params, context) => {
      const { text } = params;
      
      // In a real implementation, this would do more sophisticated processing
      const summary = `Summary of "${text.substring(0, 50)}...": This is ${text.length} characters long.`;
      
      // Return result to Super Agent
      return { summary };
    });
    
    return unsubscribe;
  }, []);
  
  // Get conversation context on mount
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const conversationContext = await getConversationContext();
        setContext(conversationContext);
      } catch (error) {
        console.error('Error fetching conversation context:', error);
      }
    };
    
    fetchContext();
  }, []);
  
  // Ask Super Agent (non-streaming)
  const handleAskSuperAgent = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setResponse('');
    
    try {
      const result = await askSuperAgent(query);
      setResponse(result.text || 'No response');
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Ask Super Agent with streaming response
  const handleStreamingAsk = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setStreamingText('');
    
    try {
      // Use streaming option
      await askSuperAgent(query, {
        stream: true,
        onStream: (chunk) => {
          setStreamingText(prev => prev + chunk);
        }
      });
    } catch (error) {
      setStreamingText(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Suggest an action to the user
  const handleSuggestAction = () => {
    suggestAction({
      type: 'summarize',
      title: 'Summarize this text',
      description: 'Create a concise summary of the selected text',
      icon: 'summary-icon.svg',
      action: () => {
        // This would typically call a function to summarize text
        console.log('Summarize action triggered');
        setResponse('Summary action was triggered!');
      }
    });
  };
  
  return (
    <div className="super-agent-example">
      <h2>Super Agent Integration Example</h2>
      
      <section className="query-section">
        <h3>Ask Super Agent</h3>
        <p>Send queries to the Super Agent and receive responses.</p>
        
        <div className="query-input">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your query here..."
            rows={3}
          />
          
          <div className="query-actions">
            <button onClick={handleAskSuperAgent} disabled={isLoading || !query.trim()}>
              Ask Super Agent
            </button>
            
            <button onClick={handleStreamingAsk} disabled={isLoading || !query.trim()}>
              Stream Response
            </button>
          </div>
        </div>
        
        {isLoading && <div className="loading">Loading response...</div>}
        
        {response && (
          <div className="response">
            <h4>Response:</h4>
            <div className="response-content">{response}</div>
          </div>
        )}
        
        {streamingText && (
          <div className="response">
            <h4>Streaming Response:</h4>
            <div className="response-content">{streamingText}</div>
          </div>
        )}
      </section>
      
      <section className="action-section">
        <h3>Suggest Actions</h3>
        <p>Suggest actions to the user through the Super Agent interface.</p>
        
        <button onClick={handleSuggestAction}>
          Suggest "Summarize" Action
        </button>
        
        <div className="info-box">
          <p>
            <strong>Note:</strong> When this button is clicked, a suggestion appears in the Super Agent interface.
            The user can then choose whether to accept the suggestion.
          </p>
        </div>
      </section>
      
      <section className="context-section">
        <h3>Conversation Context</h3>
        <p>Access the current conversation context.</p>
        
        {context ? (
          <pre className="context-data">
            {JSON.stringify(context, null, 2)}
          </pre>
        ) : (
          <div>Loading context...</div>
        )}
      </section>
    </div>
  );
};
```

4. Create templates/app/src/examples/index.ts to export all examples:
```typescript
export * from './memory-example';
export * from './permission-example';
export * from './super-agent-example';
```

5. Update templates/app/src/components/AppHome.tsx to include navigation to examples:
```tsx
import React, { useState } from 'react';
import { MemoryExample } from '../examples/memory-example';
import { PermissionExample } from '../examples/permission-example';
import { SuperAgentExample } from '../examples/super-agent-example';

type ExampleType = 'memory' | 'permission' | 'super-agent' | 'none';

const AppHome: React.FC = () => {
  const [currentExample, setCurrentExample] = useState<ExampleType>('none');
  
  // Render the selected example or main menu
  const renderContent = () => {
    switch (currentExample) {
      case 'memory':
        return <MemoryExample />;
      case 'permission':
        return <PermissionExample />;
      case 'super-agent':
        return <SuperAgentExample />;
      case 'none':
      default:
        return (
          <div className="examples-menu">
            <h2>AI Marketplace App Examples</h2>
            <p>Select an example to see it in action:</p>
            
            <div className="example-buttons">
              <button onClick={() => setCurrentExample('memory')}>
                Memory System Example
              </button>
              
              <button onClick={() => setCurrentExample('permission')}>
                Permission System Example
              </button>
              
              <button onClick={() => setCurrentExample('super-agent')}>
                Super Agent Integration Example
              </button>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="app-home">
      {currentExample !== 'none' && (
        <button className="back-button" onClick={() => setCurrentExample('none')}>
          ← Back to Examples
        </button>
      )}
      
      {renderContent()}
    </div>
  );
};

export default AppHome;
```

Also add some basic styling in templates/app/src/styles.css to enhance the examples.
```

### 1.2 Plugin Template Enhancement

**Cursor Agent Prompt:**
```
Create a comprehensive plugin template by implementing these files:

1. Create templates/plugin/src/components/ConversationCard.tsx:
```tsx
import React, { useState } from 'react';
import { createConversationCard } from '@ai-marketplace/sdk/surfaces/cards';

interface DataItem {
  id: string;
  name: string;
  value: number;
}

interface ConversationCardProps {
  data: DataItem[];
  title: string;
}

/**
 * Example Conversation Card component
 * Displays data in an interactive card within the Super Agent chat
 */
export const ConversationCard: React.FC<ConversationCardProps> = ({ data, title }) => {
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
  const [view, setView] = useState<'chart' | 'table'>('chart');
  
  // Calculate totals and percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return createConversationCard({
    content: (
      <div className="data-card">
        <h3 className="card-title">{title}</h3>
        
        <div className="view-toggle">
          <button 
            className={view === 'chart' ? 'active' : ''}
            onClick={() => setView('chart')}
          >
            Chart View
          </button>
          <button 
            className={view === 'table' ? 'active' : ''}
            onClick={() => setView('table')}
          >
            Table View
          </button>
        </div>
        
        {view === 'chart' ? (
          <div className="chart-view">
            {data.map(item => {
              const percentage = (item.value / total) * 100;
              return (
                <div 
                  key={item.id} 
                  className={`chart-bar ${selectedItem?.id === item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="bar-label">{item.name}</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="bar-value">{item.value.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="table-view">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Value</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => {
                  const percentage = (item.value / total) * 100;
                  return (
                    <tr 
                      key={item.id}
                      className={selectedItem?.id === item.id ? 'selected' : ''}
                      onClick={() => setSelectedItem(item)}
                    >
                      <td>{item.name}</td>
                      <td>{item.value.toLocaleString()}</td>
                      <td>{percentage.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total</strong></td>
                  <td><strong>{total.toLocaleString()}</strong></td>
                  <td><strong>100%</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        
        {selectedItem && (
          <div className="detail-panel">
            <h4>Details: {selectedItem.name}</h4>
            <div>Value: {selectedItem.value.toLocaleString()}</div>
            <div>Percentage: {((selectedItem.value / total) * 100).toFixed(1)}%</div>
          </div>
        )}
      </div>
    ),
    
    actions: (
      <div className="card-actions">
        <button onClick={() => console.log('Data exported:', data)}>
          Export Data
        </button>
        
        {selectedItem && (
          <button onClick={() => setSelectedItem(null)}>
            Clear Selection
          </button>
        )}
      </div>
    )
  });
};

export default ConversationCard;
```

2. Create templates/plugin/src/components/ContextPanel.tsx:
```tsx
import React, { useState, useEffect } from 'react';
import { createContextPanel } from '@ai-marketplace/sdk/surfaces/panels';
import { useEvents } from '@ai-marketplace/sdk/common/events';

interface DataPoint {
  timestamp: number;
  value: number;
}

interface DataSeries {
  id: string;
  name: string;
  color: string;
  data: DataPoint[];
}

/**
 * Example Context Panel component
 * Shows relevant data and tools in a sidebar panel
 */
export const ContextPanel: React.FC = () => {
  const { subscribe } = useEvents();
  const [dataSeries, setDataSeries] = useState<DataSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '1d' | '1w' | '1m'>('1d');
  
  // Simulate loading data and subscribing to updates
  useEffect(() => {
    // Generate some sample data
    const generateData = (count: number, baseValue: number, variance: number): DataPoint[] => {
      const now = Date.now();
      const result: DataPoint[] = [];
      
      for (let i = 0; i < count; i++) {
        const timestamp = now - (count - i) * 3600000; // hourly points
        const value = baseValue + (Math.random() * variance * 2) - variance;
        result.push({ timestamp, value });
      }
      
      return result;
    };
    
    // Create sample data series
    const sampleData: DataSeries[] = [
      {
        id: 'series1',
        name: 'Temperature',
        color: '#ff6b6b',
        data: generateData(24, 70, 5)
      },
      {
        id: 'series2',
        name: 'Humidity',
        color: '#4ecdc4',
        data: generateData(24, 45, 10)
      },
      {
        id: 'series3',
        name: 'Pressure',
        color: '#ffd166',
        data: generateData(24, 1015, 15)
      }
    ];
    
    // Simulate loading delay
    setTimeout(() => {
      setDataSeries(sampleData);
      setIsLoading(false);
    }, 1000);
    
    // Subscribe to data updates
    const unsubscribe = subscribe('data.update', (updatedData: any) => {
      console.log('Received data update:', updatedData);
      // In a real implementation, this would update the data series
    });
    
    return unsubscribe;
  }, []);
  
  // Filter data based on selected time range
  const getFilteredData = (series: DataSeries): DataPoint[] => {
    const now = Date.now();
    let cutoff: number;
    
    switch (timeRange) {
      case '1h':
        cutoff = now - 3600000; // 1 hour in ms
        break;
      case '1w':
        cutoff = now - 7 * 24 * 3600000; // 1 week in ms
        break;
      case '1m':
        cutoff = now - 30 * 24 * 3600000; // 1 month in ms
        break;
      case '1d':
      default:
        cutoff = now - 24 * 3600000; // 1 day in ms
        break;
    }
    
    return series.data.filter(point => point.timestamp >= cutoff);
  };
  
  // Get the selected series data
  const getSelectedSeriesData = (): DataSeries | null => {
    if (!selectedSeries) return null;
    return dataSeries.find(series => series.id === selectedSeries) || null;
  };
  
  // Calculate statistics for the selected series
  const calculateStats = (data: DataPoint[]) => {
    if (data.length === 0) return { min: 0, max: 0, avg: 0 };
    
    const values = data.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    
    return { min, max, avg };
  };
  
  // Render the chart for a data series
  const renderChart = (series: DataSeries) => {
    const filteredData = getFilteredData(series);
    const stats = calculateStats(filteredData);
    
    // Find min and max for scaling
    const minValue = Math.floor(stats.min);
    const maxValue = Math.ceil(stats.max);
    const range = maxValue - minValue;
    
    // Simple SVG line chart
    return (
      <div className="chart-container">
        <h3>{series.name}</h3>
        
        <svg width="100%" height="200" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={filteredData.map((point, index) => {
              const x = (index / (filteredData.length - 1)) * 100;
              const y = 100 - (((point.value - minValue) / range) * 80 + 10);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke={series.color}
            strokeWidth="2"
          />
        </svg>
        
        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">Min:</span>
            <span className="stat-value">{stats.min.toFixed(1)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg:</span>
            <span className="stat-value">{stats.avg.toFixed(1)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Max:</span>
            <span className="stat-value">{stats.max.toFixed(1)}</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Create the context panel
  return createContextPanel({
    title: 'Data Analysis',
    
    content: (
      <div className="context-panel">
        {isLoading ? (
          <div className="loading-indicator">Loading data...</div>
        ) : (
          <>
            <div className="time-range-selector">
              <label>Time Range:</label>
              <div className="button-group">
                <button 
                  className={timeRange === '1h' ? 'active' : ''}
                  onClick={() => setTimeRange('1h')}
                >
                  1h
                </button>
                <button 
                  className={timeRange === '1d' ? 'active' : ''}
                  onClick={() => setTimeRange('1d')}
                >
                  1d
                </button>
                <button 
                  className={timeRange === '1w' ? 'active' : ''}
                  onClick={() => setTimeRange('1w')}
                >
                  1w
                </button>
                <button 
                  className={timeRange === '1m' ? 'active' : ''}
                  onClick={() => setTimeRange('1m')}
                >
                  1m
                </button>
              </div>
            </div>
            
            <div className="series-selector">
              <label>Data Series:</label>
              <div className="series-buttons">
                {dataSeries.map(series => (
                  <button
                    key={series.id}
                    className={selectedSeries === series.id ? 'active' : ''}
                    onClick={() => setSelectedSeries(series.id)}
                    style={{ borderColor: series.color }}
                  >
                    {series.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="chart-section">
              {selectedSeries ? (
                getSelectedSeriesData() ? renderChart(getSelectedSeriesData()!) : null
              ) : (
                <div className="no-selection-message">
                  Select a data series to view details
                </div>
              )}
            </div>
          </>
        )}
      </div>
    ),
    
    actions: dataSeries.length > 0 && (
      <div className="panel-actions">
        <button onClick={() => console.log('Exporting data:', dataSeries)}>
          Export Data
        </button>
        
        <button onClick={() => console.log('Analyzing data:', dataSeries)}>
          Analyze Trends
        </button>
      </div>
    ),
    
    width: 300 // Width in pixels
  });
};

export default ContextPanel;
```

3. Create templates/plugin/src/index.ts with plugin initialization:
```typescript
import { createPlugin } from '@ai-marketplace/sdk/plugin';
import ConversationCard from './components/ConversationCard';
import ContextPanel from './components/ContextPanel';

export default createPlugin({
  id: 'com.example.dataplugin',
  name: 'Data Analysis Plugin',
  version: '0.1.0',
  description: 'A plugin for analyzing and visualizing data',
  
  // Required permissions
  permissions: [
    {
      type: 'memory',
      access: ['read'],
      scope: 'conversation'
    }
  ],
  
  // Function that Super Agent can call
  functions: [
    {
      name: 'analyzeData',
      description: 'Analyze a set of numeric data and return statistics',
      parameters: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'number'
            },
            description: 'Array of numeric values to analyze'
          },
          title: {
            type: 'string',
            description: 'Title for the analysis'
          }
        },
        required: ['data']
      },
      handler: async ({ data, title = 'Data Analysis' }) => {
        // Basic statistical analysis
        const sum = data.reduce((a, b) => a + b, 0);
        const avg = sum / data.length;
        
        // Calculate standard deviation
        const squareDiffs = data.map(value => {
          const diff = value - avg;
          return diff * diff;
        });
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
        const stdDev = Math.sqrt(avgSquareDiff);
        
        // Find min, max, median
        const sortedData = [...data].sort((a, b) => a - b);
        const min = sortedData[0];
        const max = sortedData[sortedData.length - 1];
        
        let median;
        const mid = Math.floor(sortedData.length / 2);
        if (sortedData.length % 2 === 0) {
          median = (sortedData[mid - 1] + sortedData[mid]) / 2;
        } else {
          median = sortedData[mid];
        }
        
        // Transform data for visualization
        const dataItems = data.map((value, index) => ({
          id: `item-${index}`,
          name: `Item ${index + 1}`,
          value
        }));
        
        // Return analysis results
        return {
          title,
          dataItems,
          statistics: {
            count: data.length,
            sum,
            min,
            max,
            avg,
            median,
            stdDev
          }
        };
      }
    }
  ],
  
  // Define interface surfaces
  surfaces: {
    // Conversation card renderer
    conversationCard: {
      render: (props) => {
        const { data } = props;
        
        // Check if this is the expected data format from our function
        if (data.dataItems && data.statistics && data.title) {
          return <ConversationCard 
            data={data.dataItems} 
            title={data.title} 
          />;
        }
        
        // Fallback for unexpected data format
        return <div>Unable to render data. Invalid format.</div>;
      }
    },
    
    // Context panel
    contextPanel: {
      title: 'Data Analysis',
      render: () => <ContextPanel />
    },
    
    // Command interface
    commandInterface: {
      commands: [
        {
          name: 'analyze',
          description: 'Analyze numerical data',
          parameters: [
            {
              name: 'data',
              description: 'Comma-separated numbers to analyze',
              required: true
            },
            {
              name: 'title',
              description: 'Title for the analysis',
              required: false
            }
          ],
          handler: async (args) => {
            // Parse the comma-separated data
            const dataStr = args.data || '';
            const data = dataStr.split(',')
              .map(s => s.trim())
              .filter(s => s.length > 0)
              .map(s => parseFloat(s))
              .filter(n => !isNaN(n));
            
            const title = args.title || 'Data Analysis';
            
            // Use our analyzeData function
            const analysis = await window.functions.analyzeData({
              data,
              title
            });
            
            return analysis;
          }
        }
      ]
    }
  },
  
  // Initialize when plugin is first loaded
  onInitialize: async () => {
    console.log('Data Analysis Plugin initialized');
  }
});
```

4. Create templates/plugin/manifest.json:
```json
{
  "id": "com.example.dataplugin",
  "name": "Data Analysis Plugin",
  "version": "0.1.0",
  "description": "A plugin for analyzing and visualizing data",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "type": "plugin",
  "permissions": [
    {
      "type": "memory",
      "access": ["read"],
      "scope": "conversation"
    }
  ],
  "surfaces": {
    "conversationCard": {
      "entryPoint": "./src/components/ConversationCard.tsx"
    },
    "contextPanel": {
      "entryPoint": "./src/components/ContextPanel.tsx",
      "title": "Data Analysis"
    },
    "commandInterface": {
      "commands": [
        {
          "name": "analyze",
          "description": "Analyze numerical data"
        }
      ]
    }
  }
}
```

5. Update templates/plugin/README.md with usage instructions:
```markdown
# Data Analysis Plugin

A plugin for the AI Marketplace that provides data analysis and visualization capabilities.

## Features

- **Data Analysis**: Analyze numeric data sets with statistical methods
- **Visualization**: Display data in charts and tables
- **Integration**: Works with Super Agent to process data requests
- **Context Panel**: Provides data insights in a sidebar panel
- **Conversation Cards**: Displays interactive data visualizations in chat

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

4. Test your plugin:
   ```
   npm test
   ```

## Usage Examples

### Via Super Agent

You can use the plugin through natural language requests to Super Agent:

```
Analyze this data: 10, 25, 15, 30, 20, 35
```

### Via Command Interface

You can also use the slash command directly:

```
/analyze data=10,25,15,30,20,35 title="Sample Data Analysis"
```

### Manual Integration

The plugin provides components that can be used programmatically:

```typescript
import { ConversationCard } from './components/ConversationCard';
import { ContextPanel } from './components/ContextPanel';

// Use conversation card with custom data
const data = [
  { id: '1', name: 'Item 1', value: 10 },
  { id: '2', name: 'Item 2', value: 20 },
  { id: '3', name: 'Item 3', value: 30 }
];

return <ConversationCard data={data} title="Custom Analysis" />;
```

## Documentation

For more information, see the [AI Marketplace documentation](https://example.com/docs).
```
```

### 1.3 Agent Template Enhancement

**Cursor Agent Prompt:**
```
Create an enhanced agent template with the following files:

1. Create templates/agent/src/agent.ts with a comprehensive example:
```typescript
import { memory } from '@ai-marketplace/sdk/common/memory';
import { events } from '@ai-marketplace/sdk/common/events';
import { createConversationCard } from '@ai-marketplace/sdk/surfaces/cards';

// Types for domain-specific knowledge
interface KnowledgeItem {
  id: string;
  category: string;
  content: string;
  confidence: number;
  source?: string;
}

// Types for agent responses
interface AgentResponse {
  text: string;
  sources?: string[];
  followupQuestions?: string[];
  data?: any;
}

/**
 * Specialized AI agent implementation
 * This example shows a financial advisor agent that provides investment advice
 */
export class FinancialAdvisorAgent {
  private knowledgeBase: KnowledgeItem[] = [];
  private conversationHistory: { role: 'user' | 'agent', text: string }[] = [];
  private userProfile: any = null;
  
  constructor() {
    // Initialize the agent
    this.loadKnowledgeBase();
    this.subscribeToEvents();
  }
  
  /**
   * Process a user query and generate a response
   */
  async processQuery(query: string): Promise<AgentResponse> {
    // Add query to conversation history
    this.conversationHistory.push({ role: 'user', text: query });
    
    // Get user profile from memory if available
    try {
      this.userProfile = await memory.get('user.financialProfile', { scope: 'user' });
    } catch (error) {
      console.log('No financial profile found, using defaults');
    }
    
    // Analyze the query to determine intent
    const intent = this.analyzeIntent(query);
    
    let response: AgentResponse;
    
    // Generate response based on intent
    switch (intent) {
      case 'investment_advice':
        response = await this.generateInvestmentAdvice(query);
        break;
      case 'stock_information':
        response = await this.getStockInformation(query);
        break;
      case 'retirement_planning':
        response = await this.generateRetirementPlan(query);
        break;
      case 'tax_advice':
        response = await this.generateTaxAdvice(query);
        break;
      case 'general_question':
      default:
        response = await this.generateGeneralResponse(query);
        break;
    }
    
    // Add response to conversation history
    this.conversationHistory.push({ role: 'agent', text: response.text });
    
    // Publish event for other components to react
    events.publish('financialAgent.response', {
      query,
      response,
      timestamp: Date.now()
    });
    
    return response;
  }
  
  /**
   * Analyze the user's query to determine the intent
   */
  private analyzeIntent(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    // Simple rule-based intent detection
    // In a real implementation, this would use more sophisticated NLU
    if (lowerQuery.includes('invest') || lowerQuery.includes('stock') || lowerQuery.includes('share') || lowerQuery.includes('bond')) {
      return 'investment_advice';
    } else if (lowerQuery.includes('ticker') || lowerQuery.includes('price') || lowerQuery.includes('market')) {
      return 'stock_information';
    } else if (lowerQuery.includes('retire') || lowerQuery.includes('401k') || lowerQuery.includes('pension')) {
      return 'retirement_planning';
    } else if (lowerQuery.includes('tax') || lowerQuery.includes('deduction') || lowerQuery.includes('write off')) {
      return 'tax_advice';
    } else {
      return 'general_question';
    }
  }
  
  /**
   * Generate investment advice based on user profile and query
   */
  private async generateInvestmentAdvice(query: string): Promise<AgentResponse> {
    // Get relevant knowledge items
    const relevantItems = this.retrieveRelevantKnowledge(query, 'investments');
    
    // Determine risk profile
    const riskProfile = this.userProfile?.riskTolerance || 'moderate';
    
    // Generate advice based on risk profile and knowledge
    let advice = '';
    let sources: string[] = [];
    
    switch (riskProfile) {
      case 'conservative':
        advice = "Based on your conservative risk profile, I recommend a portfolio weighted towards bonds and dividend stocks. Consider a 60/40 split between bonds and high-quality dividend stocks for stable income with some growth potential.";
        break;
      case 'moderate':
        advice = "With your moderate risk tolerance, a balanced portfolio would be appropriate. Consider a mix of index funds, blue-chip stocks, and some bonds – perhaps a 60/40 stocks to bonds ratio.";
        break;
      case 'aggressive':
        advice = "Given your aggressive risk profile, you might consider growth-oriented investments. A portfolio weighted towards growth stocks, emerging markets, and potentially some alternative investments could align with your goals.";
        break;
      default:
        advice = "I recommend a balanced approach to investing with a diversified portfolio across different asset classes.";
    }
    
    // Add information from knowledge base
    if (relevantItems.length > 0) {
      advice += "\n\nHere's some additional information that might help:";
      
      relevantItems.forEach(item => {
        advice += `\n• ${item.content}`;
        if (item.source) {
          sources.push(item.source);
        }
      });
    }
    
    // Generate follow-up questions
    const followupQuestions = [
      "Would you like a more detailed breakdown of asset allocation?",
      "Are you interested in specific investment vehicles like ETFs or mutual funds?",
      "Would you like to discuss retirement planning in conjunction with your investments?"
    ];
    
    return {
      text: advice,
      sources: sources.length > 0 ? sources : undefined,
      followupQuestions,
      data: {
        riskProfile,
        recommendedAllocation: this.generateAllocationData(riskProfile)
      }
    };
  }
  
  /**
   * Generate allocation data for visualization
   */
  private generateAllocationData(riskProfile: string): any[] {
    switch (riskProfile) {
      case 'conservative':
        return [
          { category: 'Bonds', percentage: 60 },
          { category: 'Dividend Stocks', percentage: 25 },
          { category: 'Cash', percentage: 10 },
          { category: 'Growth Stocks', percentage: 5 }
        ];
      case 'moderate':
        return [
          { category: 'Index Funds', percentage: 40 },
          { category: 'Bonds', percentage: 30 },
          { category: 'Blue-chip Stocks', percentage: 20 },
          { category: 'Cash', percentage: 5 },
          { category: 'Alternative Investments', percentage: 5 }
        ];
      case 'aggressive':
        return [
          { category: 'Growth Stocks', percentage: 50 },
          { category: 'Index Funds', percentage: 20 },
          { category: 'Emerging Markets', percentage: 15 },
          { category: 'Bonds', percentage: 10 },
          { category: 'Alternative Investments', percentage: 5 }
        ];
      default:
        return [
          { category: 'Stocks', percentage: 50 },
          { category: 'Bonds', percentage: 30 },
          { category: 'Cash', percentage: 10 },
          { category: 'Alternative Investments', percentage: 10 }
        ];
    }
  }
  
  /**
   * Get stock information based on the query
   */
  private async getStockInformation(query: string): Promise<AgentResponse> {
    // In a real implementation, this would call a financial data API
    // For this example, we'll return simulated data
    
    // Extract ticker symbols from query using a simple pattern
    const tickerPattern = /\b[A-Z]{1,5}\b/g;
    const tickers = query.match(tickerPattern) || ['AAPL']; // Default to AAPL if no ticker found
    
    const stockData: any = {};
    
    // Generate mock data for each ticker
    tickers.forEach(ticker => {
      stockData[ticker] = {
        price: Math.floor(Math.random() * 1000) + 50,
        change: (Math.random() * 6) - 3,
        volume: Math.floor(Math.random() * 10000000),
        pe: Math.floor(Math.random() * 30) + 5,
        marketCap: Math.floor(Math.random() * 1000) + 10
      };
    });
    
    // Create response text
    let responseText = `Here's the current information for ${tickers.join(', ')}:\n\n`;
    
    Object.entries(stockData).forEach(([ticker, data]: [string, any]) => {
      const changeSymbol = data.change >= 0 ? '↑' : '↓';
      const changeAbs = Math.abs(data.change).toFixed(2);
      responseText += `${ticker}: $${data.price.toFixed(2)} ${changeSymbol}${changeAbs}% | Volume: ${data.volume.toLocaleString()} | P/E: ${data.pe.toFixed(2)} | Market Cap: $${data.marketCap}B\n`;
    });
    
    // Add some analysis
    responseText += "\nMarket Analysis:\n";
    if (tickers.length === 1) {
      const data = stockData[tickers[0]];
      if (data.pe > 25) {
        responseText += "This stock has a relatively high P/E ratio, which might indicate that it's overvalued or that investors expect high growth in the future.";
      } else if (data.pe < 15) {
        responseText += "This stock has a relatively low P/E ratio, which might indicate that it's undervalued or that investors expect slower growth.";
      } else {
        responseText += "This stock has a moderate P/E ratio, which is generally in line with market averages.";
      }
    } else {
      responseText += "Multiple stocks selected. Consider comparing their performance metrics to make informed investment decisions.";
    }
    
    return {
      text: responseText,
      followupQuestions: [
        `Would you like a technical analysis of ${tickers[0]}?`,
        "Should I show you the historical performance chart?",
        "Would you like to compare this with sector peers?"
      ],
      data: stockData
    };
  }
  
  /**
   * Generate retirement plan based on user profile and query
   */
  private async generateRetirementPlan(query: string): Promise<AgentResponse> {
    // Get user profile information or use defaults
    const age = this.userProfile?.age || 35;
    const retirementAge = this.userProfile?.retirementAge || 65;
    const currentSavings = this.userProfile?.retirementSavings || 50000;
    const annualContribution = this.userProfile?.annualContribution || 10000;
    const expectedReturn = this.userProfile?.expectedReturn || 0.07; // 7% annual return
    
    // Calculate years until retirement
    const yearsToRetirement = retirementAge - age;
    
    // Simple future value calculation
    const futureValue = this.calculateFutureValue(
      currentSavings,
      annualContribution,
      expectedReturn,
      yearsToRetirement
    );
    
    // Calculate estimated monthly income in retirement (4% withdrawal rule)
    const monthlyIncome = (futureValue * 0.04) / 12;
    
    // Generate response text
    let responseText = `Based on your current profile, here's a summary of your retirement outlook:\n\n`;
    responseText += `Current Age: ${age}\n`;
    responseText += `Planned Retirement Age: ${retirementAge}\n`;
    responseText += `Years Until Retirement: ${yearsToRetirement}\n`;
    responseText += `Current Retirement Savings: $${currentSavings.toLocaleString()}\n`;
    responseText += `Annual Contribution: $${annualContribution.toLocaleString()}\n\n`;
    
    responseText += `Projected Retirement Savings at Age ${retirementAge}: $${Math.round(futureValue).toLocaleString()}\n`;
    responseText += `Estimated Monthly Income in Retirement: $${Math.round(monthlyIncome).toLocaleString()}/month\n\n`;
    
    // Add recommendations
    responseText += "Recommendations:\n";
    
    if (annualContribution / (this.userProfile?.income || 100000) < 0.15) {
      responseText += "• Consider increasing your annual retirement contributions to at least 15% of your income.\n";
    }
    
    if (!this.userProfile?.hasRothIRA && age < 50) {
      responseText += "• You might benefit from opening a Roth IRA for tax-free growth, especially given your age.\n";
    }
    
    if (yearsToRetirement > 20) {
      responseText += "• With more than 20 years until retirement, you could consider a more aggressive investment allocation.\n";
    } else if (yearsToRetirement < 10) {
      responseText += "• As you're getting closer to retirement, consider gradually shifting to a more conservative allocation.\n";
    }
    
    return {
      text: responseText,
      followupQuestions: [
        "Would you like to see how changing your retirement age affects these projections?",
        "Should we explore increasing your annual contributions?",
        "Would you like information on catch-up contributions if you're over 50?"
      ],
      data: {
        currentAge: age,
        retirementAge,
        yearsToRetirement,
        currentSavings,
        annualContribution,
        expectedReturn,
        projectedSavings: futureValue,
        monthlyIncome
      }
    };
  }
  
  /**
   * Calculate future value of retirement savings
   */
  private calculateFutureValue(
    principal: number,
    annualContribution: number,
    rate: number,
    years: number
  ): number {
    let futureValue = principal;
    
    for (let i = 0; i < years; i++) {
      futureValue = futureValue * (1 + rate) + annualContribution;
    }
    
    return futureValue;
  }
  
  /**
   * Generate tax advice based on user profile and query
   */
  private async generateTaxAdvice(query: string): Promise<AgentResponse> {
    // In a real implementation, this would be more sophisticated
    const relevantItems = this.retrieveRelevantKnowledge(query, 'taxes');
    
    let advice = "Here are some tax considerations that might be helpful:\n\n";
    let sources: string[] = [];
    
    if (relevantItems.length > 0) {
      relevantItems.forEach(item => {
        advice += `• ${item.content}\n`;
        if (item.source) {
          sources.push(item.source);
        }
      });
    } else {
      advice += "• Consider maximizing contributions to tax-advantaged accounts like 401(k)s and IRAs.\n";
      advice += "• Keep track of tax-deductible expenses related to investments, such as advisory fees.\n";
      advice += "• Be aware of the tax implications of different investment accounts and strategies.\n";
      advice += "• Consider tax-efficient investment vehicles like ETFs for taxable accounts.\n";
      advice += "• Tax-loss harvesting can help offset capital gains with capital losses.\n";
    }
    
    advice += "\nPlease note that this is general information, not personalized tax advice. For specific guidance tailored to your situation, consult with a qualified tax professional.";
    
    return {
      text: advice,
      sources: sources.length > 0 ? sources : undefined,
      followupQuestions: [
        "Would you like information on specific tax-advantaged investment accounts?",
        "Are you interested in strategies for reducing investment-related taxes?",
        "Should we discuss tax considerations for retirement withdrawals?"
      ]
    };
  }
  
  /**
   * Generate a general response for questions not matching specific intents
   */
  private async generateGeneralResponse(query: string): Promise<AgentResponse> {
    const relevantItems = this.retrieveRelevantKnowledge(query, 'general');
    
    let response = '';
    let sources: string[] = [];
    
    if (relevantItems.length > 0) {
      // Use knowledge base items for response
      response = "Based on my knowledge:\n\n";
      
      relevantItems.forEach(item => {
        response += `${item.content}\n\n`;
        if (item.source) {
          sources.push(item.source);
        }
      });
    } else {
      // Generic response
      response = "I'm a financial advisor AI assistant, specialized in providing guidance on investments, retirement planning, and other financial matters. While I can provide general information, please remember that personal financial decisions should consider your specific circumstances and goals. For personalized advice, consider consulting with a certified financial planner.";
    }
    
    return {
      text: response,
      sources: sources.length > 0 ? sources : undefined,
      followupQuestions: [
        "Would you like to know more about investment strategies?",
        "Can I help you with retirement planning?",
        "Are you interested in tax-efficient investing?"
      ]
    };
  }
  
  /**
   * Retrieve relevant knowledge items for a given query and category
   */
  private retrieveRelevantKnowledge(query: string, category?: string): KnowledgeItem[] {
    // In a real implementation, this would use more sophisticated retrieval
    // For now, we'll use a simple keyword matching approach
    const keywords = query.toLowerCase().split(/\s+/);
    
    return this.knowledgeBase
      .filter(item => {
        // Filter by category if provided
        if (category && item.category !== category && item.category !== 'general') {
          return false;
        }
        
        // Check if item content contains any keywords
        const content = item.content.toLowerCase();
        return keywords.some(keyword => content.includes(keyword));
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3); // Get top 3 most relevant items
  }
  
  /**
   * Manually load the knowledge base
   * In a real implementation, this would load from a database or API
   */
  private loadKnowledgeBase(): void {
    this.knowledgeBase = [
      {
        id: '1',
        category: 'investments',
        content: 'Diversification across asset classes can help reduce risk in a portfolio.',
        confidence: 0.95,
        source: 'Investment Principles Handbook'
      },
      {
        id: '2',
        category: 'investments',
        content: 'Dollar-cost averaging involves investing a fixed amount at regular intervals, regardless of market conditions.',
        confidence: 0.9,
        source: 'Investment Strategies Guide'
      },
      {
        id: '3',
        category: 'retirement',
        content: 'The 4% rule suggests withdrawing 4% of your retirement savings in the first year, then adjusting for inflation annually.',
        confidence: 0.85,
        source: 'Retirement Planning Fundamentals'
      },
      {
        id: '4',
        category: 'taxes',
        content: 'Tax-loss harvesting involves selling investments at a loss to offset capital gains tax liability.',
        confidence: 0.8,
        source: 'Tax-Efficient Investing'
      },
      {
        id: '5',
        category: 'investments',
        content: 'Index funds typically have lower expense ratios than actively managed funds.',
        confidence: 0.9,
        source: 'Guide to Fund Investing'
      },
      // Add more knowledge items as needed
    ];
  }
  
  /**
   * Subscribe to relevant events
   */
  private subscribeToEvents(): void {
    // Subscribe to user profile updates
    events.subscribe('user.profile.updated', (profile) => {
      if (profile.financialData) {
        this.userProfile = profile.financialData;
      }
    });
    
    // Subscribe to knowledge base updates
    events.subscribe('knowledgeBase.updated', (updatedKnowledge) => {
      if (Array.isArray(updatedKnowledge)) {
        this.knowledgeBase = updatedKnowledge;
      }
    });
  }
  
  /**
   * Create a visual response card for display in the conversation
   */
  createResponseCard(data: any): any {
    // This would create a card visualization based on the data
    // For example, a portfolio allocation pie chart
    
    if (data.recommendedAllocation) {
      return createConversationCard({
        content: (
          <div className="allocation-card">
            <h3>Recommended Portfolio Allocation</h3>
            <div className="allocation-chart">
              {/* This would be a chart component in a real implementation */}
              {data.recommendedAllocation.map((item: any) => (
                <div key={item.category} className="allocation-item">
                  <div className="category-name">{item.category}</div>
                  <div className="percentage-bar">
                    <div 
                      className="fill" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                    <span className="percentage-label">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
        actions: (
          <div className="card-actions">
            <button>Customize Allocation</button>
            <button>View Details</button>
          </div>
        )
      });
    }
    
    // Default empty card if no suitable data
    return null;
  }
}

// Export a singleton instance
export const financialAdvisor = new FinancialAdvisorAgent();
```

2. Create templates/agent/src/index.ts with agent initialization:
```typescript
import { createAgent } from '@ai-marketplace/sdk/agent';
import { financialAdvisor } from './agent';
import AgentHome from './components/AgentHome';

export default createAgent({
  id: 'com.example.financialadvisor',
  name: 'Financial Advisor',
  version: '0.1.0',
  description: 'AI financial advisor providing investment and retirement planning guidance',
  domain: 'finance',
  capabilities: ['investment-advice', 'retirement-planning', 'tax-guidance'],
  
  // Required permissions
  permissions: [
    {
      type: 'memory',
      access: ['read', 'write'],
      scope: 'user',
      purpose: 'Store your financial profile and preferences'
    }
  ],
  
  // Initialize agent
  onInitialize: async (context) => {
    console.log('Financial Advisor Agent initialized with context:', context);
  },
  
  // Process queries directed to this agent
  processQuery: async (query, context) => {
    // Use our agent implementation to process the query
    const response = await financialAdvisor.processQuery(query);
    
    // Check if we should create a visualization card
    let card = null;
    if (response.data) {
      card = financialAdvisor.createResponseCard(response.data);
    }
    
    // Return the response
    return {
      text: response.text,
      data: response.data,
      card,
      followupQuestions: response.followupQuestions,
      sources: response.sources
    };
  },
  
  // Optional UI surfaces
  surfaces: {
    // App tab for full experience
    appTab: {
      title: 'Financial Advisor',
      render: (props) => <AgentHome {...props} />
    }
  }
});
```

3. Create templates/agent/src/components/AgentHome.tsx for the agent's UI:
```tsx
import React, { useState, useEffect } from 'react';
import { useMemory } from '@ai-marketplace/sdk/common/memory';
import { useSuperAgent } from '@ai-marketplace/sdk/common/super-agent';
import { financialAdvisor } from '../agent';

const AgentHome: React.FC = () => {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Access the user's financial profile
  const { data: profile, update: updateProfile } = useMemory('user.financialProfile', {
    fallback: {
      age: 35,
      income: 85000,
      retirementAge: 65,
      retirementSavings: 120000,
      annualContribution: 15000,
      riskTolerance: 'moderate',
      hasRothIRA: false,
      expectedReturn: 0.07
    },
    scope: 'user'
  });
  
  // Access Super Agent
  const { askSuperAgent } = useSuperAgent();
  
  // Handle profile form submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profile);
  };
  
  // Handle field changes in the profile form
  const handleProfileChange = (field: string, value: any) => {
    updateProfile(current => ({
      ...current,
      [field]: value
    }));
  };
  
  // Handle query submission
  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Process the query using our agent
      const response = await financialAdvisor.processQuery(query);
      
      // Add to responses list
      setResponses(prev => [...prev, {
        query,
        response,
        timestamp: Date.now()
      }]);
      
      // Clear the input
      setQuery('');
    } catch (error) {
      console.error('Error processing query:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle follow-up question click
  const handleFollowupClick = (question: string) => {
    setQuery(question);
  };
  
  // Send a query to Super Agent
  const askSuperAgentQuestion = async (question: string) => {
    try {
      // This will route through Super Agent, which might use our agent
      await askSuperAgent(question);
    } catch (error) {
      console.error('Error asking Super Agent:', error);
    }
  };
  
  return (
    <div className="agent-home">
      <div className="agent-container">
        <aside className="profile-sidebar">
          <h2>Financial Profile</h2>
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                value={profile.age}
                onChange={(e) => handleProfileChange('age', parseInt(e.target.value))}
                min="18"
                max="100"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="income">Annual Income</label>
              <input
                type="number"
                id="income"
                value={profile.income}
                onChange={(e) => handleProfileChange('income', parseInt(e.target.value))}
                min="0"
                step="1000"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="retirementAge">Planned Retirement Age</label>
              <input
                type="number"
                id="retirementAge"
                value={profile.retirementAge}
                onChange={(e) => handleProfileChange('retirementAge', parseInt(e.target.value))}
                min={profile.age}
                max="100"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="retirementSavings">Current Retirement Savings</label>
              <input
                type="number"
                id="retirementSavings"
                value={profile.retirementSavings}
                onChange={(e) => handleProfileChange('retirementSavings', parseInt(e.target.value))}
                min="0"
                step="1000"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="annualContribution">Annual Retirement Contribution</label>
              <input
                type="number"
                id="annualContribution"
                value={profile.annualContribution}
                onChange={(e) => handleProfileChange('annualContribution', parseInt(e.target.value))}
                min="0"
                step="500"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="riskTolerance">Risk Tolerance</label>
              <select
                id="riskTolerance"
                value={profile.riskTolerance}
                onChange={(e) => handleProfileChange('riskTolerance', e.target.value)}
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="hasRothIRA"
                checked={profile.hasRothIRA}
                onChange={(e) => handleProfileChange('hasRothIRA', e.target.checked)}
              />
              <label htmlFor="hasRothIRA">Has Roth IRA</label>
            </div>
            
            <button type="submit" className="update-button">
              Update Profile
            </button>
          </form>
          
          <div className="quick-questions">
            <h3>Quick Questions</h3>
            <button onClick={() => askSuperAgentQuestion("What's the best investment strategy for someone my age?")}>
              Best investment strategy?
            </button>
            <button onClick={() => askSuperAgentQuestion("How much should I be saving for retirement?")}>
              Retirement savings goal?
            </button>
            <button onClick={() => askSuperAgentQuestion("What are tax-efficient investment strategies?")}>
              Tax-efficient investments?
            </button>
          </div>
        </aside>
        
        <main className="conversation-area">
          <h2>Financial Advisor</h2>
          
          <div className="conversation-container">
            {responses.length === 0 ? (
              <div className="empty-state">
                <p>Ask me anything about investments, retirement planning, or financial advice.</p>
              </div>
            ) : (
              <div className="conversation-history">
                {responses.map((item, index) => (
                  <div key={index} className="conversation-item">
                    <div className="user-query">
                      <strong>You:</strong> {item.query}
                    </div>
                    <div className="agent-response">
                      <strong>Financial Advisor:</strong> {item.response.text}
                      
                      {item.response.followupQuestions && (
                        <div className="followup-questions">
                          <p>You might also want to ask:</p>
                          <div className="followup-buttons">
                            {item.response.followupQuestions.map((question: string, qIndex: number) => (
                              <button 
                                key={qIndex}
                                onClick={() => handleFollowupClick(question)}
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {item.response.sources && (
                        <div className="sources">
                          <p>Sources:</p>
                          <ul>
                            {item.response.sources.map((source: string, sIndex: number) => (
                              <li key={sIndex}>{source}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <form onSubmit={handleQuerySubmit} className="query-form">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about investments, retirement, or financial planning..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? 'Processing...' : 'Ask'}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AgentHome;
```

4. Create templates/agent/manifest.json:
```json
{
  "id": "com.example.financialadvisor",
  "name": "Financial Advisor",
  "version": "0.1.0",
  "description": "AI financial advisor providing investment and retirement planning guidance",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "type": "agent",
  "domain": "finance",
  "capabilities": [
    "investment-advice",
    "retirement-planning",
    "tax-guidance"
  ],
  "permissions": [
    {
      "type": "memory",
      "access": ["read", "write"],
      "scope": "user",
      "purpose": "Store your financial profile and preferences"
    }
  ],
  "surfaces": {
    "appTab": {
      "entryPoint": "./src/components/AgentHome.tsx",
      "title": "Financial Advisor"
    }
  }
}
```

5. Update templates/agent/README.md with comprehensive documentation:
```markdown
# Financial Advisor Agent

An AI financial advisor agent for the AI Marketplace that provides personalized investment advice, retirement planning, and tax guidance.

## Features

- **Investment Advice**: Personalized investment recommendations based on risk profile
- **Retirement Planning**: Retirement savings projections and planning tools
- **Tax Guidance**: Information on tax-efficient investing strategies
- **Financial Knowledge Base**: Access to financial information and best practices
- **Personalized Experience**: Adapts to user's financial profile and goals

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

4. Test your agent:
   ```
   npm test
   ```

## Usage Examples

### Financial Profile

The agent stores and uses a financial profile to provide personalized advice:

```typescript
// Financial profile structure
interface FinancialProfile {
  age: number;
  income: number;
  retirementAge: number;
  retirementSavings: number;
  annualContribution: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  hasRothIRA: boolean;
  expectedReturn: number;
}
```

### Query Examples

The agent can respond to various types of financial queries:

**Investment Advice:**
```
What investments should I consider for a moderate risk tolerance?
How should I allocate my portfolio given my age and risk profile?
What are the best index funds to invest in?
```

**Retirement Planning:**
```
Am I on track for retirement?
How much should I be saving each month for retirement?
When can I retire based on my current savings rate?
```

**Tax Guidance:**
```
What are tax-efficient investment strategies?
How can I minimize taxes on my investments?
Should I consider a Roth IRA?
```

## Extending the Agent

The agent is designed to be extensible. Here's how you can enhance it:

### Adding New Knowledge

Expand the knowledge base in `agent.ts`:

```typescript
private loadKnowledgeBase(): void {
  this.knowledgeBase = [
    // Existing items...
    
    // Add new knowledge items
    {
      id: 'new-id',
      category: 'investments',
      content: 'Your new knowledge content here.',
      confidence: 0.9,
      source: 'Source Reference'
    },
  ];
}
```

### Adding New Capabilities

To add new capabilities, extend the intent detection and response generation:

1. Add new intent in `analyzeIntent` method:
```typescript
if (lowerQuery.includes('budget') || lowerQuery.includes('spending')) {
  return 'budgeting_advice';
}
```

2. Add a corresponding response method:
```typescript
private async generateBudgetingAdvice(query: string): Promise<AgentResponse> {
  // Implementation
}
```

3. Update the `processQuery` method to handle the new intent:
```typescript
case 'budgeting_advice':
  response = await this.generateBudgetingAdvice(query);
  break;
```

## Documentation

For more information, see the [AI Marketplace documentation](https://example.com/docs).
```
```

