import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Dimensions, Pressable, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Keyboard } from 'react-native';
import NamePlanModal from '../components/plans/NamePlanModal';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/themeContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import { aiService, Conversation, Message } from '../services/aiService';
import { planService } from '../services/planService';
import { useFocusEffect } from '@react-navigation/native';
import { useStats } from '../context/StatsContext';
import { getMostRecentValues, getStatsForDate, calculateDailyTargets } from '../components/dashboard/dashboardUtils';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';


const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(320, SCREEN_WIDTH * 0.85);
const HEADER_HEIGHT = 64;

interface AiScreenProps {
  onTriggerWizard?: () => void;
}

const AiScreen = ({ onTriggerWizard }: AiScreenProps) => {
  const { theme } = useTheme();
  const { statsByDate } = useStats();
  const { user } = useAuth();
  const USER_NAME = (user?.fullName || 'Friend').split(' ')[0]; // First name only
  const isLight = theme === 'light';
  const ACCENT = isLight ? '#8b5cf6' : '#a78bfa'; // Violet consistent with Meals


  const insets = useSafeAreaInsets();
  const inputRef = React.useRef<TextInput>(null);
  const flatListRef = React.useRef<FlatList>(null);

  const [input, setInput] = React.useState('');
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const drawerX = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);

  // Derive active conversation from state
  const activeConversation = React.useMemo(
    () => conversations.find(c => c._id === activeId),
    [conversations, activeId]
  );

  // Load conversations on mount
  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
    }, [])
  );

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (activeConversation?.messages?.length) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeConversation?.messages?.length]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await aiService.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeId) {
        setActiveId(data[0]._id);
      } else if (data.length === 0) {
        setActiveId(null);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
    Animated.spring(drawerX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 9
    }).start();
  };

  const closeDrawer = () => {
    Animated.spring(drawerX, {
      toValue: -DRAWER_WIDTH,
      useNativeDriver: true,
      tension: 65,
      friction: 9
    }).start(({ finished }) => {
      if (finished) setIsDrawerOpen(false);
    });
  };

  const startNewChat = async () => {
    try {
      const { conversation } = await aiService.createConversation();
      setConversations(prev => [conversation, ...prev]);
      setActiveId(conversation._id);
      closeDrawer();
    } catch (error) {
      Alert.alert('Error', 'Failed to create new chat');
    }
  };

  const selectConversation = (id: string) => {
    setActiveId(id);
    closeDrawer();
  };

  const deleteConversation = async (id: string) => {
    try {
      await aiService.deleteConversation(id);
      setConversations(prev => {
        const remaining = prev.filter(c => c._id !== id);
        if (remaining.length === 0) {
          setActiveId(null);
        } else if (id === activeId) {
          setActiveId(remaining[0]._id);
        }
        return remaining;
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to delete conversation');
    }
  };

  /* 
   * Name Plan Modal State
   */
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [targetConversationId, setTargetConversationId] = useState<string | null>(null);

  const handleGeneratePlan = async (conversationId?: string) => {
    const targetId = conversationId || activeId;
    if (!targetId) {
      Alert.alert('Error', 'Please start a chat first');
      return;
    }
    setTargetConversationId(targetId);
    setIsNameModalVisible(true);
  };

  const handleConfirmGeneration = async (name: string) => {
    if (!targetConversationId) return;

    try {
      setGenerating(true);
      // specific plan name logic handled by backend if passed in payload

      const dateKey = format(new Date(), 'yyyy-MM-dd');
      const mostRecent = getMostRecentValues(statsByDate);
      const stats = getStatsForDate(dateKey, statsByDate, mostRecent);
      const dailyTargets = calculateDailyTargets(stats);

      let mealSections = ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner'];
      if (stats.goalWeight.includes('Lose Weight')) {
        mealSections = ['Breakfast', 'Snack', 'Lunch', 'Dinner'];
      } else if (stats.goalWeight.includes('Gain Weight')) {
        mealSections = ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner', 'Snack 3'];
      }

      const payload = {
        name: name, // User provided name
        targetCalories: dailyTargets.calories,
        targetProtein: dailyTargets.protein,
        targetCarbs: dailyTargets.carbs,
        targetFats: dailyTargets.fats,
        mealsPerDay: mealSections.length,
        mealSections: mealSections
      };

      const { plan, conversation } = await aiService.generatePlan(targetConversationId, payload);

      setIsNameModalVisible(false);

      setConversations(prev => {
        return prev.map(c => {
          if (c._id === targetConversationId) {
            return conversation;
          }
          return c;
        });
      });

      Alert.alert(
        'Success!',
        `"${name}" has been created successfully.\nWould you like to activate it now?`,
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Activate Now',
            onPress: async () => {
              try {
                await planService.activatePlan(plan._id);
                Alert.alert('Success', 'Plan activated! Check your Meals and Workouts screens.');
              } catch (err) {
                Alert.alert('Error', 'Failed to activate plan');
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Generate plan error:', error);
      Alert.alert('Error', 'Failed to generate plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    let currentId = activeId;

    // If no active conversation, create one first
    if (!currentId) {
      try {
        const { conversation } = await aiService.createConversation();
        setConversations(prev => [conversation, ...prev]);
        currentId = conversation._id;
        setActiveId(currentId);
      } catch (error) {
        Alert.alert('Error', 'Failed to start conversation');
        return;
      }
    }

    // Optimistic update
    const tempUserMsg: Message = { role: 'user', content: text, createdAt: new Date().toISOString() };
    setConversations(prev => {
      return prev.map(c => {
        if (c._id === currentId) {
          return { ...c, messages: [...c.messages, tempUserMsg] };
        }
        return c;
      });
    });
    setInput('');
    setSending(true);

    try {
      const response = await aiService.sendMessage(currentId, text);
      const { conversation, action } = response;

      // Update with real data from server
      setConversations(prev => {
        return prev.map(c => {
          if (c._id === currentId) {
            return conversation;
          }
          return c;
        });
      });

      // Trigger plan generation if AI detected intent
      if (action === 'generate_plan') {
        if (onTriggerWizard) {
          onTriggerWizard();
        } else {
          // Fallback if prop not provided
          handleGeneratePlan(currentId);
        }
      }
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const mine = item.role === 'user';
    const isFirst = index === 0;
    const isLast = index === (activeConversation?.messages?.length || 0) - 1;

    if (mine) {
      return (
        <Animated.View
          style={[
            styles.msgRow,
            { justifyContent: 'flex-end', marginTop: isFirst ? 0 : 12 }
          ]}
        >
          <View
            style={[
              styles.userBubble,
              {
                backgroundColor: isLight ? '#8b5cf6' : '#7c3aed',
                shadowColor: '#8b5cf6',
              }
            ]}
          >
            <Text style={styles.userText}>{item.content}</Text>
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.msgRow,
          { justifyContent: 'flex-start', marginTop: isFirst ? 0 : 12 }
        ]}
      >
        <View style={styles.aiBubbleContainer}>
          <View style={styles.aiAvatar}>
            <LinearGradient
              colors={isLight ? ['#8b5cf6', '#7c3aed'] : ['#a78bfa', '#8b5cf6']}
              style={styles.aiAvatarGradient}
            >
              <Ionicons name="sparkles" size={14} color="#fff" />
            </LinearGradient>
          </View>
          <View
            style={[
              styles.aiBubble,
              {
                backgroundColor: isLight ? '#ffffff' : '#1e1e1e',
                borderColor: isLight ? '#f1f5f9' : '#2a2a2a',
              },
            ]}
          >
            <Text style={[styles.aiText, { color: isLight ? '#334155' : '#e2e8f0' }]}>
              {item.content}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isLight ? '#f8fafc' : '#0a0a0a' }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: isLight ? '#f8fafc' : '#0f0f0f' }}>
        {/* Enhanced Header */}
        <View style={[styles.header, { borderBottomColor: isLight ? '#f1f5f9' : '#1e293b' }]}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuBtn} activeOpacity={0.7}>
            <View style={[styles.menuIconBg, { backgroundColor: isLight ? '#ffffff' : '#1a1a1a' }]}>
              <Ionicons name="menu" size={20} color={isLight ? '#334155' : '#e2e8f0'} />
            </View>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: isLight ? '#0f172a' : '#f8fafc' }]}>
                AI Coach
              </Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                <Text style={[styles.statusText, { color: isLight ? '#64748b' : '#94a3b8' }]}>
                  Online
                </Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -50 : 0}
      >
        {/* Messages Area */}
        <Pressable style={styles.messagesContainer} onPress={Keyboard.dismiss}>
          {loading && !conversations.length ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={ACCENT} />
            </View>
          ) : activeConversation?.messages?.length ? (
            <FlatList
              ref={flatListRef}
              data={activeConversation.messages}
              keyExtractor={(m, index) => m.id || index.toString()}
              renderItem={renderMessage}
              contentContainerStyle={[
                styles.messagesList,
                { paddingBottom: insets.bottom + 80 }
              ]}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
              ListFooterComponent={
                sending ? (
                  <View style={styles.typingIndicator}>
                    <View style={[styles.aiAvatar, { marginBottom: 0 }]}>
                      <LinearGradient
                        colors={isLight ? ['#8b5cf6', '#7c3aed'] : ['#a78bfa', '#8b5cf6']}
                        style={styles.aiAvatarGradient}
                      >
                        <Ionicons name="sparkles" size={14} color="#fff" />
                      </LinearGradient>
                    </View>
                    <View style={[styles.typingDots, { backgroundColor: isLight ? '#f1f5f9' : '#1a1a1a' }]}>
                      <View style={[styles.dot, { backgroundColor: isLight ? '#94a3b8' : '#64748b' }]} />
                      <View style={[styles.dot, { backgroundColor: isLight ? '#94a3b8' : '#64748b' }]} />
                      <View style={[styles.dot, { backgroundColor: isLight ? '#94a3b8' : '#64748b' }]} />
                    </View>
                  </View>
                ) : null
              }
            />
          ) : (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={isLight ? ['#f8fafc', '#f1f5f9'] : ['#0f0f0f', '#1a1a1a']}
                style={styles.emptyGradient}
              >
                <View style={styles.emptyIconContainer}>
                  <LinearGradient
                    colors={isLight ? ['#8b5cf6', '#7c3aed'] : ['#a78bfa', '#8b5cf6']}
                    style={styles.emptyIcon}
                  >
                    <Ionicons name="sparkles" size={32} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={[styles.emptyTitle, { color: isLight ? '#0f172a' : '#f8fafc' }]}>
                  Hey {USER_NAME} 👋
                </Text>
                <Text style={[styles.emptySub, { color: isLight ? '#64748b' : '#94a3b8' }]}>
                  I'm your AI Coach. Ask me to adjust your plan, swap meals, or give fitness tips.
                </Text>
                <View style={styles.suggestionsGrid}>
                  {[
                    { icon: 'help-circle', label: 'How am I doing?', color: '#8b5cf6' },
                    { icon: 'restaurant', label: 'Healthy snack ideas', color: '#10b981' },
                    { icon: 'barbell', label: 'Tips for better form', color: '#8b5cf6' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      style={[
                        styles.suggestionChip,
                        {
                          backgroundColor: isLight ? '#ffffff' : '#0f0f0f',
                          borderColor: isLight ? '#e2e8f0' : '#1e293b'
                        }
                      ]}
                      onPress={() => setInput(item.label)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.chipIcon, { backgroundColor: `${item.color}15` }]}>
                        <Ionicons name={item.icon as any} size={16} color={item.color} />
                      </View>
                      <Text style={[styles.chipText, { color: isLight ? '#334155' : '#e2e8f0' }]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </LinearGradient>
            </View>
          )}
        </Pressable>

        {/* Enhanced Input Composer */}
        <View
          style={[
            styles.composer,
            {
              backgroundColor: isLight ? '#ffffff' : '#0f0f0f',
              borderTopColor: isLight ? '#f1f5f9' : '#1a1a1a',
              paddingBottom: Math.max(insets.bottom, 8) + 72 // Extra spacing above tab bar
            }
          ]}
        >
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isLight ? '#ffffff' : '#1a1a1a',
                borderColor: isLight ? '#e5e7eb' : '#333',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isLight ? 0.05 : 0.2,
                shadowRadius: 8,
                elevation: 2,
              }
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[styles.textInput, { color: isLight ? '#0f172a' : '#f8fafc' }]}
              placeholder="Ask me anything..."
              placeholderTextColor={isLight ? '#94a3b8' : '#64748b'}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={1000}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              style={[styles.sendButton, { opacity: (!input.trim() || sending) ? 0.5 : 1 }]}
              onPress={sendMessage}
              activeOpacity={0.8}
              disabled={!input.trim() || sending}
            >
              <View
                style={[
                  styles.sendGradient,
                  {
                    backgroundColor: '#8b5cf6',
                    shadowColor: '#8b5cf6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  }
                ]}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={18} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <Pressable style={styles.overlay} onPress={closeDrawer} />
      )}

      {/* Enhanced Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: isLight ? '#ffffff' : '#0f0f0f',
            transform: [{ translateX: drawerX }],
            top: insets.top,
            bottom: 0,
          },
        ]}
      >
        <LinearGradient
          colors={isLight ? ['#f8fafc', '#ffffff'] : ['#0f0f0f', '#0a0a0a']}
          style={styles.drawerGradient}
        >
          <View style={[styles.drawerHeader, { borderBottomColor: isLight ? '#f1f5f9' : '#1a1a1a' }]}>
            <Text style={[styles.drawerTitle, { color: isLight ? '#0f172a' : '#f8fafc' }]}>
              Conversations
            </Text>
            <TouchableOpacity
              onPress={startNewChat}
              style={styles.newChatBtn}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.newChatGradient,
                  {
                    backgroundColor: '#8b5cf6',
                    shadowColor: '#8b5cf6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  }
                ]}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          <FlatList
            data={conversations}
            keyExtractor={c => c._id}
            contentContainerStyle={{ padding: 12, paddingBottom: insets.bottom + 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const active = item._id === activeId;
              return (
                <View
                  style={[
                    styles.conversationItem,
                    {
                      backgroundColor: active
                        ? (isLight ? '#dbeafe' : '#1e3a8a20')
                        : 'transparent',
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => selectConversation(item._id)}
                    style={styles.conversationContent}
                  >
                    <View style={[styles.convIcon, { backgroundColor: active ? '#8b5cf6' : (isLight ? '#f1f5f9' : '#1a1a1a') }]}>
                      <Ionicons
                        name="chatbubble-ellipses"
                        size={16}
                        color={active ? '#fff' : (isLight ? '#64748b' : '#94a3b8')}
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.convTitle,
                        { color: isLight ? '#334155' : '#e2e8f0' }
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteConversation(item._id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.deleteBtn}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="trash-outline" size={18} color={isLight ? '#ef4444' : '#f87171'} />
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyDrawer}>
                <Ionicons name="chatbubbles-outline" size={40} color={isLight ? '#cbd5e1' : '#334155'} />
                <Text style={[styles.emptyDrawerText, { color: isLight ? '#94a3b8' : '#64748b' }]}>
                  No conversations yet
                </Text>
              </View>
            }
          />
        </LinearGradient>
      </Animated.View>

      <NamePlanModal
        visible={isNameModalVisible}
        onClose={() => setIsNameModalVisible(false)}
        onSubmit={handleConfirmGeneration}
        isLoading={generating}
        title="Name Your Plan"
        placeholder="e.g., Summer Shred 2025"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    height: HEADER_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  menuBtn: {
    marginRight: 12,
  },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTextContainer: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  planBtn: {
    marginLeft: 8,
  },
  planBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  planBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Messages
  messagesContainer: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
  },
  msgRow: {
    width: '100%',
  },

  // User Message
  userBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    borderBottomRightRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  userText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },

  // AI Message
  aiBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '85%',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 2,
  },
  aiAvatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBubble: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  aiText: {
    fontSize: 15,
    lineHeight: 22,
  },

  // Typing Indicator
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Empty State
  emptyState: { flex: 1 },
  emptyGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptySub: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  chipIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Input Composer
  composer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 28,
    borderWidth: 1.5,
    paddingLeft: 18,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 52,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 100,
    paddingVertical: 10,
    paddingRight: 8,
  },
  sendButton: {
    marginLeft: 4,
  },
  sendGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Drawer
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    width: DRAWER_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  drawerGradient: {
    flex: 1,
  },
  drawerHeader: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    marginTop: 8,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  newChatBtn: {
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  newChatGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  conversationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  convIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 4,
  },
  emptyDrawer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyDrawerText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AiScreen;