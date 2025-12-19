import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Tab {
  label: string;
  icon: string;
}

interface DashboardNavbarProps {
  TABS: Tab[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  styles: { [key: string]: any };
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  TABS,
  activeTab,
  setActiveTab,
  styles
}) => (
  <View style={styles.navbar}>
    {TABS.map(tab => (
      <TouchableOpacity
        key={tab.label}
        style={styles.navItem}
        onPress={() => setActiveTab(tab.label)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={tab.icon as any}
          size={24}
          color={activeTab === tab.label ? '#2563eb' : (styles.navLabel?.color || '#888')}
        />
        <Text style={[styles.navLabel, activeTab === tab.label && styles.navLabelActive]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default DashboardNavbar; 