import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';
import { useMealSearch } from '../../hooks/meals/useMealSearch';
import { useWorkoutSearch } from '../../hooks/workouts/useWorkoutSearch';
import { useDebounce } from '../../hooks/meals/useDebounce';

interface SearchModalProps {
    visible: boolean;
    onClose: () => void;
    type: 'meal' | 'workout';
    onSelect: (item: any) => void;
}

export default function SearchModal({ visible, onClose, type, onSelect }: SearchModalProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const { searchMeals } = useMealSearch();
    const { searchWorkouts } = useWorkoutSearch();

    useEffect(() => {
        if (visible) {
            setQuery('');
            setResults([]);
        }
    }, [visible]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length === 0) {
                setLoading(true);
                try {
                    // Fetch some default suggestions based on type
                    // Ideally this would be "recent" or "popular" from backend
                    if (type === 'meal') {
                        const data = await searchMeals('chicken'); // Mock suggestions
                        setResults(data.slice(0, 5));
                    } else {
                        const data = await searchWorkouts('press'); // Mock suggestions
                        setResults(data.slice(0, 5));
                    }
                } catch (error) {
                    console.error('Suggestions error:', error);
                } finally {
                    setLoading(false);
                }
                return;
            }

            if (debouncedQuery.length < 2) {
                return;
            }

            setLoading(true);
            try {
                if (type === 'meal') {
                    const data = await searchMeals(debouncedQuery);
                    setResults(data);
                } else {
                    const data = await searchWorkouts(debouncedQuery);
                    setResults(data);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [debouncedQuery, type, query]);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.item, { borderBottomColor: colors.border }]}
            onPress={() => onSelect(item)}
        >
            <View>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                    {type === 'meal'
                        ? `${item.calories} kcal • ${item.brand || 'Generic'}`
                        : `${item.muscle_group || item.type}`
                    }
                </Text>
            </View>
            <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Add {type === 'meal' ? 'Food' : 'Workout'}
                    </Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={[styles.closeText, { color: colors.primary }]}>Close</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder={`Search ${type}s...`}
                        placeholderTextColor={colors.textSecondary}
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={results}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id || item.id}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            query.length > 1 ? (
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                    No results found
                                </Text>
                            ) : null
                        }
                        ListHeaderComponent={
                            query.length === 0 && results.length > 0 ? (
                                <Text style={{ color: colors.textSecondary, marginBottom: 10, fontWeight: '600' }}>
                                    Suggested
                                </Text>
                            ) : null
                        }
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    list: {
        paddingBottom: 40,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemSub: {
        fontSize: 14,
    },
    center: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
});
