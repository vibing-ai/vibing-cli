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