import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GoalsSectionProps {
  stats: any;
  setIsActivityModalVisible: (val: boolean) => void;
  setIsGoalWeightModalVisible: (val: boolean) => void;
  styles: { [key: string]: any };
}

const GoalsSection: React.FC<GoalsSectionProps> = ({
  stats,
  setIsActivityModalVisible,
  setIsGoalWeightModalVisible,
  styles
}) => (
  <View style={styles.profileSection}>
    <Text style={styles.sectionHeader}>Goals & Activity</Text>
    <View style={styles.goalsGrid}>
      <TouchableOpacity 
        style={styles.goalCard}
        onPress={() => {
          setIsActivityModalVisible(true);
        }}
      >
        <View style={styles.goalCardContent}>
          <Ionicons name="fitness" size={24} color="#f97316" />
          <View style={styles.goalCardText}>
            <Text style={styles.goalCardTitle}>Activity Level</Text>
            <Text style={styles.goalCardValue}>{stats.activityLevel}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.goalCard}
        onPress={() => {
          setIsGoalWeightModalVisible(true);
        }}
      >
        <View style={styles.goalCardContent}>
          <Ionicons name="trending-up" size={24} color="#10b981" />
          <View style={styles.goalCardText}>
            <Text style={styles.goalCardTitle}>Weight Goal</Text>
            <Text style={styles.goalCardValue}>
              {stats.goalWeight === 'Not set' ? 'Not set' : 
                stats.goalWeight.includes(':') ? 
                  `${stats.goalWeight.split(':')[0]}\n${stats.goalWeight.split(':')[1]}` : 
                  stats.goalWeight}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  </View>
);

export default GoalsSection; 