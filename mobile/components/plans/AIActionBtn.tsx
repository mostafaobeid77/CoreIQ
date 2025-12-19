import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AIActionBtnProps {
    onPress: () => void;
    label?: string;
}

export default function AIActionBtn({ onPress, label = "Ask AI to Improve Plan" }: AIActionBtnProps) {
    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.container}>
            <LinearGradient
                colors={['#4f46e5', '#7c3aed']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name="sparkles" size={20} color="#fff" />
                </View>
                <Text style={styles.text}>{label}</Text>
                <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 12,
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
    },
    iconContainer: {
        marginRight: 12,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
});
