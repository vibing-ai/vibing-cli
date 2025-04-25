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