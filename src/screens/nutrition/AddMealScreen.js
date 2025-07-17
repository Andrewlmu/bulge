import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import Button from '../../components/common/Button';
import AnimatedButton from '../../components/common/AnimatedButton';
import Card from '../../components/common/Card';
import AnimatedCard from '../../components/common/AnimatedCard';
import FormInput from '../../components/forms/FormInput';
import { mealSchema } from '../../utils/validation';
import { buttonPressHaptic, successHaptic } from '../../utils/haptics';
import { useApp } from '../../context/AppContext';
import { MEAL_TYPES } from '../../types';

const AddMealScreen = ({ navigation, route }) => {
  const { addMeal } = useApp();
  const [loading, setLoading] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(
    route.params?.mealType || MEAL_TYPES.BREAKFAST
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(mealSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      type: selectedMealType,
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
    },
  });

  const watchedCalories = watch('calories');
  const watchedProtein = watch('protein');
  const watchedCarbs = watch('carbs');
  const watchedFat = watch('fat');

  const mealTypes = [
    { 
      id: MEAL_TYPES.BREAKFAST, 
      label: 'Breakfast', 
      icon: 'sunny',
      color: '#f59e0b',
      time: '7:00 AM'
    },
    { 
      id: MEAL_TYPES.LUNCH, 
      label: 'Lunch', 
      icon: 'partly-sunny',
      color: '#10b981',
      time: '12:00 PM'
    },
    { 
      id: MEAL_TYPES.DINNER, 
      label: 'Dinner', 
      icon: 'moon',
      color: '#8b5cf6',
      time: '7:00 PM'
    },
    { 
      id: MEAL_TYPES.SNACK, 
      label: 'Snack', 
      icon: 'cafe',
      color: '#06b6d4',
      time: 'Anytime'
    },
  ];

  const quickAddFoods = [
    {
      name: 'Greek Yogurt (1 cup)',
      calories: 150,
      protein: 20,
      carbs: 9,
      fat: 4,
    },
    {
      name: 'Chicken Breast (100g)',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
    },
    {
      name: 'Brown Rice (1 cup)',
      calories: 216,
      protein: 5,
      carbs: 45,
      fat: 1.8,
    },
    {
      name: 'Avocado (1 medium)',
      calories: 234,
      protein: 3,
      carbs: 12,
      fat: 21,
    },
    {
      name: 'Banana (1 medium)',
      calories: 105,
      protein: 1,
      carbs: 27,
      fat: 0.3,
    },
    {
      name: 'Almonds (1 oz)',
      calories: 164,
      protein: 6,
      carbs: 6,
      fat: 14,
    },
  ];

  const handleMealTypeSelect = (mealType) => {
    buttonPressHaptic();
    setSelectedMealType(mealType);
    setValue('type', mealType);
  };

  const handleQuickAdd = (food) => {
    buttonPressHaptic();
    setValue('name', food.name);
    setValue('calories', food.calories.toString());
    setValue('protein', food.protein.toString());
    setValue('carbs', food.carbs.toString());
    setValue('fat', food.fat.toString());
  };

  const calculateMacros = () => {
    const protein = parseFloat(watchedProtein) || 0;
    const carbs = parseFloat(watchedCarbs) || 0;
    const fat = parseFloat(watchedFat) || 0;
    
    const proteinCals = protein * 4;
    const carbsCals = carbs * 4;
    const fatCals = fat * 9;
    const totalCals = proteinCals + carbsCals + fatCals;
    
    return {
      protein: { cals: proteinCals, percent: totalCals ? (proteinCals / totalCals * 100) : 0 },
      carbs: { cals: carbsCals, percent: totalCals ? (carbsCals / totalCals * 100) : 0 },
      fat: { cals: fatCals, percent: totalCals ? (fatCals / totalCals * 100) : 0 },
      total: totalCals,
    };
  };

  const macroBreakdown = calculateMacros();

  const handleSaveMeal = async (data) => {
    setLoading(true);
    
    try {
      const mealData = {
        name: data.name,
        type: selectedMealType,
        calories: parseInt(data.calories),
        protein: parseFloat(data.protein) || 0,
        carbs: parseFloat(data.carbs) || 0,
        fat: parseFloat(data.fat) || 0,
        time: format(new Date(), 'h:mm a'),
      };

      addMeal(mealData);
      successHaptic();
      
      Alert.alert(
        'Meal Added!',
        `${data.name} has been added to your food diary.`,
        [
          {
            text: 'Add Another',
            style: 'default',
            onPress: () => {
              // Reset form for another entry
              setValue('name', '');
              setValue('calories', '');
              setValue('protein', '');
              setValue('carbs', '');
              setValue('fat', '');
            },
          },
          {
            text: 'Done',
            style: 'default',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Meal</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FoodSearch')}>
          <Ionicons name="search" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Meal Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          <View style={styles.mealTypesGrid}>
            {mealTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.mealTypeCard,
                  selectedMealType === type.id && styles.selectedMealType,
                  { borderColor: type.color }
                ]}
                onPress={() => handleMealTypeSelect(type.id)}
              >
                <View style={[styles.mealTypeIcon, { backgroundColor: type.color }]}>
                  <Ionicons name={type.icon} size={20} color="white" />
                </View>
                <Text style={[
                  styles.mealTypeLabel,
                  selectedMealType === type.id && styles.selectedMealTypeLabel
                ]}>
                  {type.label}
                </Text>
                <Text style={styles.mealTypeTime}>{type.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Add Foods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickAddContainer}>
              {quickAddFoods.map((food, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickAddCard}
                  onPress={() => handleQuickAdd(food)}
                >
                  <Text style={styles.quickAddName}>{food.name}</Text>
                  <Text style={styles.quickAddCalories}>{food.calories} cal</Text>
                  <Text style={styles.quickAddMacros}>
                    P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Manual Entry Form */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Manual Entry</Text>
          
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Food Name"
                placeholder="e.g., Grilled Chicken Salad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                leftIcon="restaurant-outline"
                variant="outlined"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="calories"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Calories"
                placeholder="0"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.calories?.message}
                keyboardType="numeric"
                leftIcon="flame-outline"
                variant="outlined"
                required
              />
            )}
          />

          <View style={styles.macrosRow}>
            <Controller
              control={control}
              name="protein"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Protein (g)"
                  placeholder="0"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.protein?.message}
                  keyboardType="numeric"
                  variant="outlined"
                  style={styles.macroInput}
                />
              )}
            />

            <Controller
              control={control}
              name="carbs"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Carbs (g)"
                  placeholder="0"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.carbs?.message}
                  keyboardType="numeric"
                  variant="outlined"
                  style={styles.macroInput}
                />
              )}
            />

            <Controller
              control={control}
              name="fat"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Fat (g)"
                  placeholder="0"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.fat?.message}
                  keyboardType="numeric"
                  variant="outlined"
                  style={styles.macroInput}
                />
              )}
            />
          </View>

          {/* Macro Breakdown */}
          {(watchedProtein || watchedCarbs || watchedFat) && (
            <View style={styles.macroBreakdown}>
              <Text style={styles.breakdownTitle}>Macro Breakdown</Text>
              <View style={styles.breakdownBars}>
                <View style={styles.breakdownBar}>
                  <View 
                    style={[
                      styles.breakdownFill,
                      { 
                        width: `${macroBreakdown.protein.percent}%`,
                        backgroundColor: '#ef4444'
                      }
                    ]} 
                  />
                </View>
                <View style={styles.breakdownBar}>
                  <View 
                    style={[
                      styles.breakdownFill,
                      { 
                        width: `${macroBreakdown.carbs.percent}%`,
                        backgroundColor: '#10b981'
                      }
                    ]} 
                  />
                </View>
                <View style={styles.breakdownBar}>
                  <View 
                    style={[
                      styles.breakdownFill,
                      { 
                        width: `${macroBreakdown.fat.percent}%`,
                        backgroundColor: '#f59e0b'
                      }
                    ]} 
                  />
                </View>
              </View>
              <View style={styles.breakdownLabels}>
                <Text style={styles.breakdownLabel}>
                  <Text style={[styles.breakdownDot, { color: '#ef4444' }]}>●</Text>
                  Protein {Math.round(macroBreakdown.protein.percent)}%
                </Text>
                <Text style={styles.breakdownLabel}>
                  <Text style={[styles.breakdownDot, { color: '#10b981' }]}>●</Text>
                  Carbs {Math.round(macroBreakdown.carbs.percent)}%
                </Text>
                <Text style={styles.breakdownLabel}>
                  <Text style={[styles.breakdownDot, { color: '#f59e0b' }]}>●</Text>
                  Fat {Math.round(macroBreakdown.fat.percent)}%
                </Text>
              </View>
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <AnimatedButton
          title="Save Meal"
          onPress={handleSubmit(handleSaveMeal)}
          loading={loading}
          disabled={!isValid || loading}
          icon={<Ionicons name="checkmark" size={20} color="white" />}
          hapticFeedback={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  mealTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mealTypeCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMealType: {
    borderColor: '#2563eb',
    backgroundColor: '#1e40af',
  },
  mealTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  selectedMealTypeLabel: {
    color: '#ffffff',
  },
  mealTypeTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  quickAddContainer: {
    flexDirection: 'row',
    paddingLeft: 20,
  },
  quickAddCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 160,
  },
  quickAddName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  quickAddCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  quickAddMacros: {
    fontSize: 11,
    color: '#9ca3af',
  },
  formCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  macroInput: {
    flex: 1,
  },
  macroBreakdown: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  breakdownBars: {
    marginBottom: 8,
  },
  breakdownBar: {
    height: 6,
    backgroundColor: '#4b5563',
    borderRadius: 3,
    marginBottom: 4,
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  breakdownDot: {
    fontSize: 16,
    marginRight: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#111827',
  },
});

export default AddMealScreen;