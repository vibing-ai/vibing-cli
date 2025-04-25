import React, { useState, useEffect } from 'react';
import { createContextPanel } from '@vibing-ai/sdk/surfaces/panels';
import { useEvents } from '@vibing-ai/sdk/common/events';

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