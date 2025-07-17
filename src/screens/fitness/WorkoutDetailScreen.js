import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useApp } from '../../context/AppContext';

const WorkoutDetailScreen = ({ navigation, route }) => {
  const { addWorkout } = useApp();
  const [isActive, setIsActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [startTime, setStartTime] = useState(null);

  const workout = {
    name: 'Upper Body Strength',
    duration: '45-60 min',
    difficulty: 'Intermediate',
    calories: '300-400',
    exercises: [
      {
        id: 1,
        name: 'Push-ups',
        sets: 3,
        reps: '12-15',
        rest: '60 seconds',
        instructions: 'Keep your body straight, lower until chest nearly touches floor',
        targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
      },
      {
        id: 2,
        name: 'Pull-ups',
        sets: 3,
        reps: '8-12',
        rest: '90 seconds',
        instructions: 'Hang from bar, pull up until chin clears the bar',
        targetMuscles: ['Back', 'Biceps'],
      },
      {
        id: 3,
        name: 'Dumbbell Rows',
        sets: 3,
        reps: '10-12',
        rest: '60 seconds',
        instructions: 'Bend over, pull weight to your chest, squeeze shoulder blades',
        targetMuscles: ['Back', 'Biceps'],
      },
      {
        id: 4,
        name: 'Overhead Press',
        sets: 3,
        reps: '8-10',
        rest: '90 seconds',
        instructions: 'Press weight overhead, keep core tight',
        targetMuscles: ['Shoulders', 'Triceps'],
      },
    ],
  };

  const startWorkout = () => {
    setIsActive(true);
    setStartTime(new Date());
  };

  const completeSet = (exerciseId, setNumber) => {
    const key = `${exerciseId}-${setNumber}`;
    setCompletedSets({
      ...completedSets,
      [key]: !completedSets[key],
    });
  };

  const finishWorkout = () => {
    if (!startTime) return;

    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000 / 60); // minutes
    
    const completedExercises = workout.exercises.filter(exercise =>
      Array.from({ length: exercise.sets }, (_, i) =>
        completedSets[`${exercise.id}-${i + 1}`]
      ).every(Boolean)
    ).length;

    const workoutData = {
      name: workout.name,
      duration,
      exercises: completedExercises,
      calories: Math.round(duration * 6), // Rough calculation
      completed: true,
    };

    addWorkout(workoutData);
    
    Alert.alert(
      'Workout Complete!',
      `Great job! You completed ${completedExercises} exercises in ${duration} minutes.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const isSetCompleted = (exerciseId, setNumber) => {
    return completedSets[`${exerciseId}-${setNumber}`] || false;
  };

  const getExerciseProgress = (exercise) => {
    const completedCount = Array.from({ length: exercise.sets }, (_, i) =>
      isSetCompleted(exercise.id, i + 1)
    ).filter(Boolean).length;
    return `${completedCount}/${exercise.sets}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{workout.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Workout Info */}
        {!isActive && (
          <Card style={styles.infoCard}>
            <Text style={styles.workoutName}>{workout.name}</Text>
            <View style={styles.workoutMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#9ca3af" />
                <Text style={styles.metaText}>{workout.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="fitness-outline" size={16} color="#9ca3af" />
                <Text style={styles.metaText}>{workout.difficulty}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={16} color="#9ca3af" />
                <Text style={styles.metaText}>{workout.calories} cal</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Progress Bar */}
        {isActive && (
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Workout Progress</Text>
              <Text style={styles.progressText}>
                Exercise {currentExercise + 1} of {workout.exercises.length}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${((currentExercise + 1) / workout.exercises.length) * 100}%` }
                ]}
              />
            </View>
          </Card>
        )}

        {/* Exercises */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {workout.exercises.map((exercise, index) => (
            <Card key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDetails}>
                    {exercise.sets} sets • {exercise.reps} reps • {exercise.rest} rest
                  </Text>
                </View>
                {isActive && (
                  <Text style={styles.progressBadge}>
                    {getExerciseProgress(exercise)}
                  </Text>
                )}
              </View>

              <Text style={styles.instructions}>{exercise.instructions}</Text>

              <View style={styles.targetMuscles}>
                <Text style={styles.musclesLabel}>Target Muscles: </Text>
                <Text style={styles.musclesText}>
                  {exercise.targetMuscles.join(', ')}
                </Text>
              </View>

              {isActive && (
                <View style={styles.setsContainer}>
                  <Text style={styles.setsTitle}>Sets</Text>
                  <View style={styles.setsGrid}>
                    {Array.from({ length: exercise.sets }, (_, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.setButton,
                          isSetCompleted(exercise.id, i + 1) && styles.setCompleted
                        ]}
                        onPress={() => completeSet(exercise.id, i + 1)}
                      >
                        <Text style={[
                          styles.setButtonText,
                          isSetCompleted(exercise.id, i + 1) && styles.setCompletedText
                        ]}>
                          {i + 1}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        {!isActive ? (
          <Button
            title="Start Workout"
            onPress={startWorkout}
            icon={<Ionicons name="play" size={20} color="white" />}
          />
        ) : (
          <View style={styles.activeButtons}>
            <Button
              title="Pause"
              variant="outline"
              onPress={() => {/* Handle pause */}}
              style={styles.pauseButton}
            />
            <Button
              title="Finish Workout"
              onPress={finishWorkout}
              style={styles.finishButton}
            />
          </View>
        )}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    marginBottom: 20,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  workoutMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 4,
  },
  progressCard: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  exercisesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  exerciseCard: {
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#9ca3af',
  },
  progressBadge: {
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  instructions: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 12,
    lineHeight: 20,
  },
  targetMuscles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  musclesLabel: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
  },
  musclesText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  setsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 16,
  },
  setsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  setsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  setButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  setCompleted: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  setButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  setCompletedText: {
    color: '#ffffff',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  activeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    flex: 1,
  },
  finishButton: {
    flex: 2,
  },
});

export default WorkoutDetailScreen;