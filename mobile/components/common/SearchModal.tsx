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

    const renderItem = ({ item }: { item: any }) => {
        if (type === 'workout') {
            return (
                <TouchableOpacity
                    style={{
                        backgroundColor: theme === 'light' ? '#ffffff' : '#18181b', // Match SearchContainer bg
                        padding: 16,
                        borderRadius: 16,
                        marginBottom: 12,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(139, 92, 246, 0.15)',
                    }}
                    onPress={() => onSelect(item)}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        {/* Workout Icon */}
                        <View style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: theme === 'light' ? '#f3e8ff' : 'rgba(139, 92, 246, 0.15)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 14
                        }}>
                            {/* Distinguish Cardio vs Strength Icon */}
                            {(item.category?.toLowerCase() === 'cardio' || item.type === 'cardio' || item.muscle_group?.toLowerCase() === 'cardio')
                                ? <Ionicons name="speedometer" size={22} color="#8b5cf6" />
                                : <Ionicons name="barbell" size={22} color="#8b5cf6" />
                            }
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '700',
                                color: theme === 'light' ? '#0f172a' : '#fff',
                                marginBottom: 4
                            }}>
                                {item.name}
                            </Text>
                            <Text style={{
                                fontSize: 13,
                                color: theme === 'light' ? '#64748b' : '#a1a1aa',
                                fontWeight: '500'
                            }}>
                                {item.muscle_group || 'General'} • {item.category || item.equipment || 'No Eq'}
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="add-circle" size={28} color="#8b5cf6" />
                </TouchableOpacity>
            );
        }

        return (
            <FoodListItem
                item={item}
                onPress={onSelect}
            // For general search results, we don't know if it's a favorite, so defaults apply
            />
        );
    };


    return (
        <Modal visible={visible} animationType="fade" presentationStyle="pageSheet">
            <View style={[styles.container, { backgroundColor: theme === 'light' ? '#f8fafc' : '#09090b' }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme === 'light' ? '#0f172a' : '#fff' }]}>
                        Add {type === 'meal' ? 'Food' : 'Workout'}
                    </Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close-circle" size={32} color={theme === 'light' ? '#cbd5e1' : '#27272a'} />
                    </TouchableOpacity>
                </View>

                <View style={[
                    styles.searchContainer,
                    {
                        backgroundColor: theme === 'light' ? '#ffffff' : '#18181b', // Zinc 900
                        borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(139, 92, 246, 0.3)' // Subtle violet border
                    }
                ]}>
                    <Ionicons name="search" size={24} color="#8b5cf6" />
                    <TextInput
                        style={[styles.input, { color: theme === 'light' ? '#0f172a' : '#fff' }]}
                        placeholder={`Search ${type === 'meal' ? 'foods...' : 'workouts...'}`}
                        placeholderTextColor={theme === 'light' ? '#94a3b8' : '#71717a'}
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                        selectionColor="#8b5cf6"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
                            <Ionicons name="close" size={20} color={theme === 'light' ? '#94a3b8' : '#71717a'} />
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#8b5cf6" />
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
                                <Text style={[styles.emptyText, { color: theme === 'light' ? '#64748b' : '#52525b' }]}>
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
        paddingTop: 20, // Modal handle spacing
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    closeText: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginHorizontal: 20,
        borderRadius: 20,
        marginBottom: 32,
        gap: 12,
        borderWidth: 1,
        // The Search Glow
        shadowColor: '#8b5cf6',
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
    },
    clearButton: {
        padding: 4,
    },
    list: {
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    center: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        fontWeight: '500',
    },
});
