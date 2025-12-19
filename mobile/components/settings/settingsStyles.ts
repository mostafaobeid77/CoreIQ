import { StyleSheet } from 'react-native';

export function createSettingsStyles(isLight: boolean) {
  const palette = {
    bg: isLight ? '#ffffff' : '#0f0f0f',
    headerBg: isLight ? '#ffffff' : '#0f0f0f',
    border: isLight ? '#e5e7eb' : '#1d1d1d',
    cardBg: isLight ? '#ffffff' : '#151515',
    text: isLight ? '#111827' : '#fff',
    textMuted: isLight ? '#6b7280' : '#9aa0a6',
  };
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    header: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
      backgroundColor: palette.headerBg,
    },
    headerTitle: { color: palette.text, fontSize: 20, fontWeight: '700', textAlign: 'center' },

    section: { paddingHorizontal: 16, paddingTop: 16 },
    sectionTitle: { color: palette.textMuted, fontSize: 13, marginBottom: 8 },

    accountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.cardBg,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: palette.border,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      marginRight: 12,
    },
    accountLabel: { color: palette.textMuted, fontSize: 12 },
    accountEmail: { color: palette.text, fontSize: 16, fontWeight: '600' },

    row: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: palette.cardBg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: palette.border, marginBottom: 10
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center' },
    rowIcon: { marginRight: 10 },
    rowLabel: { color: palette.text, fontSize: 15, fontWeight: '600' },
    rowSub: { color: palette.textMuted, fontSize: 12, marginTop: 2 },

    link: { color: '#2563eb', fontSize: 15, fontWeight: '600' },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    modalCard: {
      backgroundColor: palette.cardBg,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      padding: 20,
      borderTopWidth: 1,
      borderColor: palette.border,
    },
    modalAvatar: { width: 72, height: 72, borderRadius: 36, marginBottom: 10 },
    modalEmail: { color: palette.text, fontSize: 18, fontWeight: '700' },

    modalButton: {
      marginTop: 8,
      backgroundColor: '#2563eb',
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    dangerButton: { backgroundColor: '#ef4444', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
    dangerText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  });
}

export default createSettingsStyles;
