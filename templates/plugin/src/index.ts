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