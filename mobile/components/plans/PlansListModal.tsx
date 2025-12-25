import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';
import { Swipeable, GestureHandlerRootView, FlatList } from 'react-native-gesture-handler';

interface PlanSummary {
    _id: string;
    name: string;
    status: 'active' | 'draft' | 'completed';
    startDate: string;
    endDate: string;
    duration?: number;
    progress?: {
        daysCompleted: number;
    };
}

interface PlansListModalProps {
    visible: boolean;
    onClose: () => void;
    plans: PlanSummary[];
    currentPlanId?: string;
    currentDay?: number; // Currently selected day for the active plan
    onSelectPlan: (planId: string) => void;
    onCreateNew: () => void;
    onDeletePlan: (planId: string) => void;
    onRepeatPlan?: (planId: string) => void;
    isLoading?: boolean;
}

export default function PlansListModal({
    visible,
    onClose,
    plans,
    currentPlanId,
    currentDay: selectedDay,
    onSelectPlan,
    onCreateNew,
    onDeletePlan,
    onRepeatPlan,
    isLoading
}: PlansListModalProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];

    const renderRightActions = (id: string, close: () => void) => {
        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => {
                    close();
                    onDeletePlan(id);
                }}
            >
                <Ionicons name="trash-outline" size={24} color="#FFF" />
                <Text style={styles.deleteActionText}>Delete</Text>
            </TouchableOpacity>
        );
    };

    const renderPlanItem = ({ item }: { item: PlanSummary }) => {
        const isActive = item._id === currentPlanId;
        const statusColor = item.status === 'active' ? colors.primary :
            item.status === 'completed' ? '#4CAF50' : colors.textSecondary;

        let swipeableRef: Swipeable | null = null;

        return (
            <Swipeable
                ref={ref => { swipeableRef = ref; }}
                renderRightActions={() => renderRightActions(item._id, () => swipeableRef?.close())}
                overshootRight={false}
                friction={2}
                leftThreshold={30}
                rightThreshold={40}
                activeOffsetX={[-10, 10]}
            >
                <TouchableOpacity
                    style={[
                        styles.planCard,
                        {
                            backgroundColor: colors.card,
                            borderColor: isActive ? colors.primary : 'transparent',
                            borderWidth: 1
                        }
                    ]}
                    onPress={() => onSelectPlan(item._id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.planHeader}>
                        <Text style={[styles.planName, { color: colors.text }]}>{item.name}</Text>
                        {isActive && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                    </View>

                    <View style={styles.planDetails}>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {item.status.toUpperCase()}
                            </Text>
                        </View>
                        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                            {new Date(item.startDate).toLocaleDateString()}
                        </Text>
                        {item.status === 'completed' && (
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: '#8b5cf615',
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    borderRadius: 12,
                                    marginLeft: 10,
                                    gap: 4
                                }}
                                onPress={(e) => {
                                    e.stopPropagation(); // Prevent card selection
                                    onRepeatPlan?.(item._id);
                                }}
                            >
                                <Ionicons name="refresh" size={14} color="#8b5cf6" />
                                <Text style={{ fontSize: 12, color: '#8b5cf6', fontWeight: '600' }}>Repeat</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {(() => {
                        const duration = item.duration || 14;
                        let displayDay: number;

                        // If this is the currently selected plan and we have a selectedDay, use it
                        if (isActive && selectedDay) {
                            displayDay = selectedDay;
                        } else {
                            // Calculate current day based on today's date vs plan start date
                            const planStart = new Date(item.startDate);
                            const today = new Date();
                            const diffTime = today.getTime() - planStart.getTime();
                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                            // Day 1 is the start date, clamp between 1 and duration
                            displayDay = Math.max(1, Math.min(diffDays + 1, duration));
                        }

                        return (
                            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                                Day {displayDay} of {duration}
                            </Text>
                        );
                    })()}
                </TouchableOpacity>
            </Swipeable>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.overlay}>
                    <View style={[styles.content, { backgroundColor: colors.background }]}>
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: colors.text }]}>My Plans</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {isLoading ? (
                            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
                        ) : (
                            <FlatList
                                data={plans}
                                renderItem={renderPlanItem}
                                keyExtractor={item => item._id}
                                contentContainerStyle={styles.listContent}
                                ListEmptyComponent={
                                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                        No plans found. Create one to get started!
                                    </Text>
                                }
                            />
                        )}

                        <TouchableOpacity
                            style={[styles.createButton, { backgroundColor: colors.primary }]}
                            onPress={onCreateNew}
                        >
                            <Ionicons name="add" size={24} color="#FFFFFF" />
                            <Text style={styles.createButtonText}>Create New Plan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        height: '80%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    loader: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    planCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    planName: {
        fontSize: 18,
        fontWeight: '600',
    },
    planDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 14,
    },
    progressText: {
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 10,
        gap: 8,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteAction: {
        backgroundColor: '#FF5252',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        borderRadius: 12,
        marginLeft: 10,
        marginBottom: 12, // Match planCard margin
    },
    deleteActionText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
        marginTop: 4,
    },
});
