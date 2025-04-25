import React, { useState } from 'react';
import { createConversationCard } from '@vibing-ai/sdk/surfaces/cards';

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