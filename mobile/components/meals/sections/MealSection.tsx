import React from 'react';
import { View, Text } from 'react-native';

const MealSection = ({ title }: { title: string }) => (
  <View>
    <Text>{title} Section</Text>
  </View>
);

export default MealSection; 