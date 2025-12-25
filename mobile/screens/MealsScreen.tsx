import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/themeContext';
import Colors from '../constants/Colors';

export default function MealsScreen() {
    const { theme } = useTheme();
    const colors = Colors[theme];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.text, { color: colors.text }]}>Meals Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
