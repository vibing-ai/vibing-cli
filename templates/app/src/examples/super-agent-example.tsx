import React, { useState, useEffect } from 'react';
import { useSuperAgent } from '@vibing-ai/sdk/common/super-agent';

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