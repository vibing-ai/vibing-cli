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