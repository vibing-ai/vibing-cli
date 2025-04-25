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