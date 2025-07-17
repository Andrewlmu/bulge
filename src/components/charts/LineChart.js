import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Reusable Line Chart component with customizable styling
 * @param {Object} props - Component props
 * @param {Object} props.data - Chart data in react-native-chart-kit format
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Chart subtitle
 * @param {number} props.height - Chart height
 * @param {number} props.width - Chart width
 * @param {Object} props.chartConfig - Custom chart configuration
 * @param {boolean} props.bezier - Whether to use bezier curves
 * @param {boolean} props.showDots - Whether to show data points
 * @param {string} props.suffix - Suffix for y-axis values
 * @param {function} props.onDataPointClick - Callback for data point clicks
 * @param {Object} props.style - Container style
 */
const LineChart = ({
  data,
  title,
  subtitle,
  height = 220,
  width = screenWidth - 40,
  chartConfig = {},
  bezier = true,
  showDots = true,
  suffix = '',
  onDataPointClick,
  style = {},
}) => {
  const defaultChartConfig = {
    backgroundColor: '#1f2937',
    backgroundGradientFrom: '#1f2937',
    backgroundGradientTo: '#374151',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: showDots ? '4' : '0',
      strokeWidth: '2',
      stroke: '#2563eb',
      fill: '#ffffff',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#374151',
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 12,
      fontFamily: 'System',
    },
    formatYLabel: (value) => {
      const num = parseFloat(value);
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}k${suffix}`;
      }
      return `${num.toFixed(1)}${suffix}`;
    },
    formatXLabel: (value) => {
      // Truncate long labels
      return value.length > 3 ? value.substring(0, 3) : value;
    },
  };

  const mergedConfig = { ...defaultChartConfig, ...chartConfig };

  const handleDataPointClick = (data) => {
    if (onDataPointClick) {
      onDataPointClick({
        index: data.index,
        value: data.value,
        dataset: data.dataset,
        x: data.x,
        y: data.y,
      });
    }
  };

  // Validate data structure
  if (!data || !data.labels || !data.datasets) {
    return (
      <View style={[styles.container, style]}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      
      <View style={styles.chartContainer}>
        <RNLineChart
          data={data}
          width={width}
          height={height}
          chartConfig={mergedConfig}
          bezier={bezier}
          style={styles.chart}
          onDataPointClick={handleDataPointClick}
          withInnerLines={true}
          withOuterLines={true}
          withHorizontalLines={true}
          withVerticalLines={false}
          withShadow={false}
          transparent={true}
          segments={4}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 8,
  },
  chart: {
    borderRadius: 8,
  },
  errorContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  errorText: {
    color: '#9ca3af',
    fontSize: 16,
  },
});

export default LineChart;