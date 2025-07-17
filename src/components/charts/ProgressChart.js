import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ProgressChart as RNProgressChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Circular Progress Chart component for displaying multiple progress metrics
 * @param {Object} props - Component props
 * @param {Object} props.data - Progress data with labels and data array
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Chart subtitle
 * @param {number} props.size - Chart size (width and height)
 * @param {Object} props.chartConfig - Custom chart configuration
 * @param {number} props.strokeWidth - Stroke width for progress rings
 * @param {number} props.radius - Radius of progress rings
 * @param {boolean} props.hideLegend - Whether to hide the legend
 * @param {Array} props.colors - Custom colors for progress rings
 * @param {Object} props.style - Container style
 */
const ProgressChart = ({
  data,
  title,
  subtitle,
  size = Math.min(screenWidth - 80, 200),
  chartConfig = {},
  strokeWidth = 16,
  radius = 32,
  hideLegend = false,
  colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  style = {},
}) => {
  const defaultChartConfig = {
    backgroundColor: '#1f2937',
    backgroundGradientFrom: '#1f2937',
    backgroundGradientTo: '#1f2937',
    color: (opacity = 1, index = 0) => {
      const colorIndex = index % colors.length;
      const baseColor = colors[colorIndex];
      // Convert hex to rgba
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: 12,
    },
  };

  const mergedConfig = { ...defaultChartConfig, ...chartConfig };

  // Validate data structure
  if (!data || !data.labels || !data.data) {
    return (
      <View style={[styles.container, style]}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <View style={[styles.errorContainer, { width: size, height: size }]}>
          <Text style={styles.errorText}>No data available</Text>
        </View>
      </View>
    );
  }

  // Ensure data values are between 0 and 1
  const normalizedData = {
    ...data,
    data: data.data.map(value => Math.max(0, Math.min(1, value))),
  };

  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      
      <View style={styles.chartContainer}>
        <RNProgressChart
          data={normalizedData}
          width={size}
          height={size}
          strokeWidth={strokeWidth}
          radius={radius}
          chartConfig={mergedConfig}
          hideLegend={hideLegend}
          style={styles.chart}
        />
        
        {!hideLegend && (
          <View style={styles.legend}>
            {data.labels.map((label, index) => (
              <View key={index} style={styles.legendItem}>
                <View 
                  style={[
                    styles.legendColor, 
                    { backgroundColor: colors[index % colors.length] }
                  ]} 
                />
                <Text style={styles.legendLabel}>{label}</Text>
                <Text style={styles.legendValue}>
                  {Math.round(data.data[index] * 100)}%
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * Simple Progress Ring component for single progress value
 * @param {Object} props - Component props
 * @param {number} props.progress - Progress value (0-1)
 * @param {number} props.size - Ring size
 * @param {number} props.strokeWidth - Ring stroke width
 * @param {string} props.color - Ring color
 * @param {string} props.backgroundColor - Background ring color
 * @param {string} props.label - Label text
 * @param {string} props.value - Value text
 * @param {Object} props.style - Container style
 */
export const ProgressRing = ({
  progress = 0,
  size = 120,
  strokeWidth = 12,
  color = '#2563eb',
  backgroundColor = '#374151',
  label,
  value,
  style = {},
}) => {
  // Normalize progress to 0-1 range
  const normalizedProgress = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedProgress * circumference);

  return (
    <View style={[styles.ringContainer, { width: size, height: size }, style]}>
      <View style={styles.ringWrapper}>
        {/* Background circle */}
        <View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
            },
          ]}
        />
        
        {/* Progress circle */}
        <View
          style={[
            styles.progressRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              transform: [
                { rotate: `${(normalizedProgress * 360) - 90}deg` }
              ],
            },
          ]}
        />
      </View>
      
      <View style={styles.ringContent}>
        {value && <Text style={styles.ringValue}>{value}</Text>}
        {label && <Text style={styles.ringLabel}>{label}</Text>}
        <Text style={styles.ringPercentage}>
          {Math.round(normalizedProgress * 100)}%
        </Text>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  errorText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  legend: {
    marginTop: 16,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
  },
  // Progress Ring styles
  ringContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringWrapper: {
    position: 'relative',
  },
  ring: {
    position: 'absolute',
  },
  progressRing: {
    position: 'absolute',
  },
  ringContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  ringValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  ringLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  ringPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 4,
  },
});

export default ProgressChart;