import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Reusable Bar Chart component with customizable styling
 * @param {Object} props - Component props
 * @param {Object} props.data - Chart data in react-native-chart-kit format
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Chart subtitle
 * @param {number} props.height - Chart height
 * @param {number} props.width - Chart width
 * @param {Object} props.chartConfig - Custom chart configuration
 * @param {boolean} props.showBarTops - Whether to show values on top of bars
 * @param {boolean} props.showValuesOnTopOfBars - Show values on bars
 * @param {string} props.suffix - Suffix for values
 * @param {function} props.onDataPointClick - Callback for bar clicks
 * @param {Object} props.style - Container style
 * @param {boolean} props.horizontal - Whether to display horizontally
 */
const BarChart = ({
  data,
  title,
  subtitle,
  height = 220,
  width = screenWidth - 40,
  chartConfig = {},
  showBarTops = true,
  showValuesOnTopOfBars = true,
  suffix = '',
  onDataPointClick,
  style = {},
  horizontal = false,
}) => {
  const defaultChartConfig = {
    backgroundColor: '#1f2937',
    backgroundGradientFrom: '#1f2937',
    backgroundGradientTo: '#374151',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: 12,
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
      return `${Math.round(num)}${suffix}`;
    },
    formatXLabel: (value) => {
      return value.length > 3 ? value.substring(0, 3) : value;
    },
    barPercentage: 0.7,
    fillShadowGradient: '#2563eb',
    fillShadowGradientOpacity: 0.8,
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
        <RNBarChart
          data={data}
          width={width}
          height={height}
          chartConfig={mergedConfig}
          style={styles.chart}
          onDataPointClick={handleDataPointClick}
          showBarTops={showBarTops}
          showValuesOnTopOfBars={showValuesOnTopOfBars}
          withInnerLines={true}
          withHorizontalLines={true}
          withVerticalLines={false}
          fromZero={true}
          segments={4}
          yAxisSuffix={suffix}
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

export default BarChart;