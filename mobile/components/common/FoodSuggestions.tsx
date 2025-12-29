import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';
import FoodListItem from './FoodListItem';

interface FoodSuggestionProps {
    favorites: any[];
    recent: any[];
    onSelect: (item: any) => void;
}

export default function FoodSuggestions({ favorites, recent, onSelect }: FoodSuggestionProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];

    const renderList = (items: any[], title: string, icon: any, color: string, isFavorite: boolean) => {
        if (items.length === 0) return null;
        return (
            <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Ionicons name={icon} size={15} color={color} />
                    <Text style={[styles.header, { color: colors.text }]}>{title}</Text>
                </View>
                {items.map(item => (
                    <FoodListItem
                        key={item._id || item.id}
                        item={item}
                        onPress={onSelect}
                        isFavorite={isFavorite}
                        iconColor={colors.textSecondary} // Use neutral for recent
                    />
                ))}
            </View>
        );
    };

    if (favorites.length === 0 && recent.length === 0) return null;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
        >
            {renderList(favorites, 'Favorites', 'heart', '#f43f5e', true)}
            {renderList(recent, 'Recent History', 'time', colors.primary, false)}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingTop: 8,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 4,
        gap: 6
    },
    header: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.3
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 10,
        borderRadius: 16,
        borderWidth: 1,
        // Glossy simple shadow
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    textContainer: {
        flex: 1,
        marginRight: 12,
        gap: 4
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    brand: {
        fontSize: 13,
        fontWeight: '500',
    },
    calorieBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    calorieText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#b45309'
    },
    macrosRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    macro: {
        fontSize: 12,
        fontWeight: '600',
    },
    dot: {
        marginHorizontal: 4,
        color: '#cbd5e1',
        fontSize: 10
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
