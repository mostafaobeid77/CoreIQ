import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
    withDelay,
    Easing
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PlanHeroProps {
    planName: string;
    daysCompleted: number;
    totalDays: number;
    isAiGenerated: boolean;
}

export default function PlanHero({ planName, daysCompleted, totalDays, isAiGenerated }: PlanHeroProps) {
    const progress = useSharedValue(0);
    const radius = 28;
    const strokeWidth = 6;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        const targetProgress = daysCompleted / totalDays;
        progress.value = withDelay(500, withTiming(targetProgress, {
            duration: 1500,
            easing: Easing.out(Easing.exp),
        }));
    }, [daysCompleted, totalDays]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference * (1 - progress.value);
        return {
            strokeDashoffset,
        };
    });

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a1a', '#0f0f0f']}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Glass Effect Border */}
                <View style={styles.borderOverlay} />

                <View style={styles.content}>
                    {/* Progress Ring */}
                    <View style={styles.progressContainer}>
                        <Svg width={70} height={70} viewBox="0 0 70 70">
                            {/* Background Circle */}
                            <Circle
                                cx="35"
                                cy="35"
                                r={radius}
                                stroke="#333"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                            />
                            {/* Progress Circle */}
                            <AnimatedCircle
                                cx="35"
                                cy="35"
                                r={radius}
                                stroke="#8b5cf6"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeLinecap="round"
                                animatedProps={animatedProps}
                                rotation="-90"
                                origin="35, 35"
                            />
                        </Svg>
                        <View style={styles.progressTextContainer}>
                            <Text style={styles.progressText}>{daysCompleted}</Text>
                            <Text style={styles.progressSub}>/{totalDays}</Text>
                        </View>
                    </View>

                    {/* Info */}
                    <View style={styles.infoContainer}>
                        <View style={styles.badgeRow}>
                            {isAiGenerated && (
                                <LinearGradient
                                    colors={['#4c1d95', '#6d28d9']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.aiBadge}
                                >
                                    <Ionicons name="sparkles" size={10} color="#fff" style={{ marginRight: 4 }} />
                                    <Text style={styles.aiBadgeText}>AI GENERATED</Text>
                                </LinearGradient>
                            )}
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>ACTIVE</Text>
                            </View>
                        </View>
                        <Text style={styles.planName} numberOfLines={1}>{planName}</Text>
                        <Text style={styles.subtext}>14-Day Transformation</Text>
                    </View>

                    {/* Mini Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Ionicons name="flame" size={16} color="#f59e0b" />
                            <Text style={styles.statValue}>85%</Text>
                        </View>
                        <Text style={styles.statLabel}>Adherence</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    card: {
        borderRadius: 24,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    borderOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressContainer: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    progressTextContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 22,
    },
    progressSub: {
        color: '#666',
        fontSize: 10,
        fontWeight: '600',
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 8,
    },
    aiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 100,
    },
    aiBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    statusBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    statusText: {
        color: '#10b981',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    planName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    subtext: {
        color: '#888',
        fontSize: 12,
    },
    statsContainer: {
        alignItems: 'center',
        paddingLeft: 16,
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255,255,255,0.1)',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    statValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    statLabel: {
        color: '#666',
        fontSize: 10,
    },
});
