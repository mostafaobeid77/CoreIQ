import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';
import { useMealSearch } from '../../hooks/meals/useMealSearch';
import { useWorkoutSearch } from '../../hooks/workouts/useWorkoutSearch';
import { useDebounce } from '../../hooks/meals/useDebounce';
import FoodSuggestions from './FoodSuggestions';
import FoodListItem from './FoodListItem';

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
    const [suggestions, setSuggestions] = useState<{ favorites: any[], recent: any[] }>({ favorites: [], recent: [] });

    const { searchMeals, getSuggestions } = useMealSearch();
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
                        // Load suggestions from backend
                        const data = await getSuggestions();
                        setSuggestions(data);
                        // Mock data commented out in favor of real suggestions
                        // const data = await searchMeals('chicken');
                        // setResults(data.slice(0, 5));
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
        <FoodListItem
            item={item}
            onPress={onSelect}
        // For general search results, we don't know if it's a favorite, so defaults apply
        />
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

                <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.primary} />
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder={`Search ${type === 'meal' ? 'foods via AI...' : 'workouts...'}`}
                        placeholderTextColor={colors.textSecondary}
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
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
                            query.length === 0 && type === 'meal' ? (
                                <FoodSuggestions
                                    favorites={suggestions.favorites}
                                    recent={suggestions.recent}
                                    onSelect={onSelect}
                                />
                            ) : query.length > 1 ? (
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                    No results found
                                </Text>
                            ) : null
                        }
                        ListHeaderComponent={null}
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
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        gap: 12,
        borderWidth: 1,
        // Shadow for search bar
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: 17,
        fontWeight: '500',
    },
    clearButton: {
        padding: 4,
    },
    list: {
        paddingBottom: 40,
        paddingHorizontal: 4, // Add breathing room for shadows
    },
    item: {
        marginBottom: 8
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
