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