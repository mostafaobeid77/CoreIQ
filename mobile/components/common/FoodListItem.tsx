import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';

interface FoodListItemProps {
    item: any;
    onPress: (item: any) => void;
    icon?: any;
    iconColor?: string;
    isFavorite?: boolean;
    showAddButton?: boolean;
}

export default function FoodListItem({
    item,
    onPress,
    icon = 'restaurant-outline',
    iconColor,
    isFavorite = false,
    showAddButton = true
}: FoodListItemProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const displayIconColor = iconColor || colors.primary;

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: theme === 'light' ? '#ffffff' : '#18181b', // Future Dark
                    borderColor: theme === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)'
                }
            ]}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            {/* Icon Box */}
            <View style={[
                styles.iconContainer,
                { backgroundColor: isFavorite ? '#fff1f2' : (theme === 'light' ? '#f8fafc' : '#27272a') }
            ]}>
                <Ionicons
                    name={isFavorite ? 'heart' : icon}
                    size={20}
                    color={isFavorite ? '#f43f5e' : (theme === 'light' ? colors.primary : '#a1a1aa')}
                />
            </View>

            {/* Content */}
            <View style={styles.textContainer}>
                <Text style={[styles.name, { color: theme === 'light' ? '#0f172a' : '#fff' }]} numberOfLines={1}>
                    {item.name}
                </Text>

                <View style={[styles.metaRow, { gap: 8 }]}>
                    <Text style={[styles.brand, { color: theme === 'light' ? '#64748b' : '#71717a' }]}>
                        {item.brand || 'GENERIC'}
                    </Text>
                    {item.calories > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: theme === 'light' ? '#cbd5e1' : '#52525b', marginRight: 8 }} />
                            <Text style={[styles.calorieText, { color: theme === 'light' ? '#64748b' : '#e4e4e7' }]}>
                                {item.calories} KCAL
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Add Action (Glowing Button) */}
            {showAddButton && (
                <View style={[styles.addAction, { backgroundColor: '#8b5cf6' }]}>
                    <Ionicons name="add" size={24} color="#fff" />
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16, // More breathing room
        paddingHorizontal: 16,
        marginBottom: 12, // Spacing between cards
        borderRadius: 24, // Future Squircle
        borderWidth: 1,
        // Glossy reflection effect
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.3,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brand: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    calorieText: {
        fontSize: 12,
        fontWeight: '700',
    },
    addAction: {
        width: 36,
        height: 36,
        borderRadius: 12, // Fixed radius as requested
        justifyContent: 'center',
        alignItems: 'center',
    }
});
