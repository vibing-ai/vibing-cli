import { memory } from '@vibing-ai/sdk/common/memory';
import { events } from '@vibing-ai/sdk/common/events';
import { createConversationCard } from '@vibing-ai/sdk/surfaces/cards';

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

interface MessageData {
  content: string;
  additionalInfo?: Record<string, unknown>;
}

interface UserProfile {
  name?: string;
  age?: number;
  income?: number;
  occupation?: string;
  riskTolerance?: string;
  investmentGoals?: string[];
  [key: string]: string | number | string[] | undefined;
}

interface StockData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
}

interface AllocationItem {
  assetClass: string;
  percentage: number;
  description: string;
}

interface ResponseCardData {
  title: string;
  content: string;
  recommendedAllocation?: AllocationItem[];
  stockData?: Record<string, StockData>;
  [key: string]: unknown;
}

/**
 * Specialized AI agent implementation
 * This example shows a financial advisor agent that provides investment advice
 */
export class FinancialAdvisorAgent {
  private knowledgeBase: KnowledgeItem[] = [];
  private conversationHistory: { role: 'user' | 'agent', text: string }[] = [];
  private userProfile: UserProfile | null = null;
  
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
    
    // Check each intent category
    if (this.isInvestmentIntent(lowerQuery)) {
      return 'investment_advice';
    } else if (this.isStockInfoIntent(lowerQuery)) {
      return 'stock_information';
    } else if (this.isRetirementIntent(lowerQuery)) {
      return 'retirement_planning';
    } else if (this.isTaxIntent(lowerQuery)) {
      return 'tax_advice';
    } else {
      return 'general_question';
    }
  }
  
  /**
   * Check if query is related to investments
   */
  private isInvestmentIntent(query: string): boolean {
    const investmentTerms = ['invest', 'stock', 'share', 'bond'];
    return investmentTerms.some(term => query.includes(term));
  }
  
  /**
   * Check if query is related to stock information
   */
  private isStockInfoIntent(query: string): boolean {
    const stockInfoTerms = ['ticker', 'price', 'market'];
    return stockInfoTerms.some(term => query.includes(term));
  }
  
  /**
   * Check if query is related to retirement
   */
  private isRetirementIntent(query: string): boolean {
    const retirementTerms = ['retire', '401k', 'pension'];
    return retirementTerms.some(term => query.includes(term));
  }
  
  /**
   * Check if query is related to taxes
   */
  private isTaxIntent(query: string): boolean {
    const taxTerms = ['tax', 'deduction', 'write off'];
    return taxTerms.some(term => query.includes(term));
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
  private generateAllocationData(riskProfile: string): AllocationItem[] {
    switch (riskProfile) {
      case 'conservative':
        return [
          { assetClass: 'Bonds', percentage: 60, description: 'Bonds' },
          { assetClass: 'Dividend Stocks', percentage: 25, description: 'High-quality dividend stocks' },
          { assetClass: 'Cash', percentage: 10, description: 'Cash' },
          { assetClass: 'Growth Stocks', percentage: 5, description: 'Growth stocks' }
        ];
      case 'moderate':
        return [
          { assetClass: 'Index Funds', percentage: 40, description: 'Diversified index funds' },
          { assetClass: 'Bonds', percentage: 30, description: 'Bonds' },
          { assetClass: 'Blue-chip Stocks', percentage: 20, description: 'Blue-chip stocks' },
          { assetClass: 'Cash', percentage: 5, description: 'Cash' },
          { assetClass: 'Alternative Investments', percentage: 5, description: 'Alternative investments' }
        ];
      case 'aggressive':
        return [
          { assetClass: 'Growth Stocks', percentage: 50, description: 'Growth stocks' },
          { assetClass: 'Index Funds', percentage: 20, description: 'Diversified index funds' },
          { assetClass: 'Emerging Markets', percentage: 15, description: 'Emerging markets' },
          { assetClass: 'Bonds', percentage: 10, description: 'Bonds' },
          { assetClass: 'Alternative Investments', percentage: 5, description: 'Alternative investments' }
        ];
      default:
        return [
          { assetClass: 'Stocks', percentage: 50, description: 'Diversified stocks' },
          { assetClass: 'Bonds', percentage: 30, description: 'Bonds' },
          { assetClass: 'Cash', percentage: 10, description: 'Cash' },
          { assetClass: 'Alternative Investments', percentage: 10, description: 'Alternative investments' }
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
    
    const stockData: Record<string, StockData> = {};
    
    // Generate mock data for each ticker
    tickers.forEach(ticker => {
      stockData[ticker] = {
        ticker,
        price: Math.floor(Math.random() * 1000) + 50,
        change: (Math.random() * 6) - 3,
        changePercent: (Math.random() * 10) - 5,
        marketCap: Math.floor(Math.random() * 1000) + 10
      };
    });
    
    // Create response text
    let responseText = `Here's the current information for ${tickers.join(', ')}:\n\n`;
    
    Object.entries(stockData).forEach(([ticker, data]: [string, StockData]) => {
      const changeSymbol = data.change >= 0 ? '↑' : '↓';
      const changeAbs = Math.abs(data.change).toFixed(2);
      responseText += `${ticker}: $${data.price.toFixed(2)} ${changeSymbol}${changeAbs}% | Change: ${data.changePercent.toFixed(2)}%\n`;
    });
    
    // Add some analysis
    responseText += "\nMarket Analysis:\n";
    if (tickers.length === 1) {
      const data = stockData[tickers[0]];
      if (data.changePercent > 2.5) {
        responseText += "This stock has a relatively high change percentage, which might indicate that it's overvalued or that investors expect high growth in the future.";
      } else if (data.changePercent < -2.5) {
        responseText += "This stock has a relatively low change percentage, which might indicate that it's undervalued or that investors expect slower growth.";
      } else {
        responseText += "This stock has a moderate change percentage, which is generally in line with market averages.";
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
  createResponseCard(data: ResponseCardData): ResponseCardData {
    // This would create a card visualization based on the data
    // For example, a portfolio allocation pie chart
    
    if (data.recommendedAllocation) {
      return {
        title: 'Recommended Portfolio Allocation',
        content: (
          <div className="allocation-card">
            <div className="allocation-chart">
              {/* This would be a chart component in a real implementation */}
              {data.recommendedAllocation.map((item: AllocationItem) => (
                <div key={item.assetClass} className="allocation-item">
                  <div className="category-name">{item.assetClass}</div>
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
        recommendedAllocation: data.recommendedAllocation,
        stockData: data.stockData
      };
    }
    
    // Default empty card if no suitable data
    return {
      title: '',
      content: ''
    };
  }
}

// Export a singleton instance
export const financialAdvisor = new FinancialAdvisorAgent(); 