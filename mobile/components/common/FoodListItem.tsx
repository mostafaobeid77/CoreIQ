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
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            {/* Icon Box */}
            <View style={[styles.iconContainer, { backgroundColor: isFavorite ? '#fff1f2' : (theme === 'light' ? '#f8fafc' : '#2d2d2d') }]}>
                <Ionicons
                    name={isFavorite ? 'heart' : icon}
                    size={18}
                    color={isFavorite ? '#f43f5e' : displayIconColor}
                />
            </View>

            {/* Content */}
            <View style={styles.textContainer}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                </Text>

                <View style={[styles.metaRow, { gap: 8 }]}>
                    <Text style={[styles.brand, { color: colors.textSecondary }]}>
                        {item.brand || 'Generic'}
                    </Text>
                    {item.calories > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.border, marginRight: 8 }} />
                            <Text style={[styles.calorieText, { color: colors.textSecondary }]}>
                                {item.calories} kcal
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Removed detailed macro row to reduce visual clutter as per user request */}

            {/* Add Action with Proper Radius */}
            {showAddButton && (
                <View style={[styles.addAction, { backgroundColor: theme === 'light' ? '#f1f5f9' : '#333' }]}>
                    <Ionicons name="add" size={20} color={colors.primary} />
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 8,
        borderRadius: 12,
        borderWidth: 1,
        // Very subtle shadow
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
        gap: 2
    },
    name: {
        fontSize: 15, // Reduced from 16
        fontWeight: '600',
        letterSpacing: 0.1,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    brand: {
        fontSize: 12,
        fontWeight: '500',
    },
    calorieText: {
        fontSize: 12,
        fontWeight: '600',
    },
    macrosRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginRight: 8
    },
    macro: {
        fontSize: 11,
        fontWeight: '600',
    },
    addAction: {
        width: 36,
        height: 36,
        borderRadius: 12, // Fixed radius as requested
        justifyContent: 'center',
        alignItems: 'center',
    }
});
