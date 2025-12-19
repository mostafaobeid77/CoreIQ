import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../context/themeContext';
import Colors from '../../constants/Colors';

const { width } = Dimensions.get('window');

export default function PlanSkeleton() {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    const SkeletonItem = ({ style }: { style: any }) => (
        <Animated.View
            style={[
                style,
                {
                    backgroundColor: colors.card,
                    opacity,
                    borderRadius: 8,
                },
            ]}
        />
    );

    return (
        <View style={styles.container}>
            {/* Header Skeleton */}
            <View style={styles.header}>
                <SkeletonItem style={{ width: 200, height: 32, marginBottom: 8 }} />
                <SkeletonItem style={{ width: 120, height: 20 }} />
            </View>

            {/* Timeline Skeleton */}
            <View style={styles.timeline}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <SkeletonItem key={i} style={{ width: 60, height: 70, borderRadius: 12 }} />
                    ))}
                </View>
            </View>

            {/* Content Skeleton */}
            <View style={styles.content}>
                <SkeletonItem style={{ width: 150, height: 24, marginBottom: 20 }} />

                {/* Workout Section */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                        <SkeletonItem style={{ width: 100, height: 24 }} />
                        <SkeletonItem style={{ width: 30, height: 30, borderRadius: 15 }} />
                    </View>
                    <SkeletonItem style={{ width: '100%', height: 80, marginBottom: 8 }} />
                    <SkeletonItem style={{ width: '100%', height: 80 }} />
                </View>

                {/* Meal Section */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                        <SkeletonItem style={{ width: 100, height: 24 }} />
                        <SkeletonItem style={{ width: 30, height: 30, borderRadius: 15 }} />
                    </View>
                    <SkeletonItem style={{ width: '100%', height: 60, marginBottom: 8 }} />
                    <SkeletonItem style={{ width: '100%', height: 60, marginBottom: 8 }} />
                    <SkeletonItem style={{ width: '100%', height: 60 }} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 30,
        marginTop: 20,
    },
    timeline: {
        marginBottom: 30,
    },
    content: {
        flex: 1,
    },
    section: {
        marginBottom: 30,
    },
});
