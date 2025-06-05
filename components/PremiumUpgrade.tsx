import logo from '@/assets/images/lgo-5.png';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

const PremiumUpgrade = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon') || '#666';
  const buttonBackground = useThemeColor({}, 'tint');

  const handleUpgradePress = () => {
    // Điều hướng đến màn hình hiển thị danh sách gói Premium
    router.push('/premium-packages');
    console.log('Pressed Premium Upgrade - Navigating to Premium Packages');
  };

  return (
    <TouchableOpacity
      style={[styles.premiumItem, { backgroundColor, borderBottomColor: iconColor }]}
      onPress={handleUpgradePress}
      activeOpacity={0.8}
    >
      <View style={styles.itemContent}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="stretch" />
        </View>
        <View style={styles.vipContainer}>
          <ThemedText style={styles.vipText}>VIP</ThemedText>
        </View>
      </View>
      <View style={styles.textContainer}>
        {/* Lợi ích 1 */}
        <View style={styles.benefitContainer}>
          <MaterialIcons name="group" size={20} color={iconColor} style={styles.benefitIcon} />
          <ThemedText style={[styles.benefitText, { color: iconColor }]}>Tham gia nhóm chat VIP</ThemedText>
        </View>
        {/* Lợi ích 2 */}
        <View style={styles.benefitContainer}>
          <MaterialIcons name="support-agent" size={20} color={iconColor} style={styles.benefitIcon} />
          <ThemedText style={[styles.benefitText, { color: iconColor }]}>Nhận hỗ trợ ưu tiên</ThemedText>
        </View>
        {/* Lợi ích 3 */}
        <View style={styles.benefitContainer}>
          <MaterialIcons name="event" size={20} color={iconColor} style={styles.benefitIcon} />
          <ThemedText style={[styles.benefitText, { color: iconColor }]}>Truy cập sự kiện đặc biệt</ThemedText>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.upgradeButton, { backgroundColor: buttonBackground }]}
        onPress={handleUpgradePress}
        activeOpacity={0.8}
      >
        <ThemedText style={styles.upgradeButtonText}>Nâng cấp Premium</ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  premiumItem: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 40,
  },
  vipContainer: {
    backgroundColor: '#ffec00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vipText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#b39700',
  },
  textContainer: {
    minHeight: 100,
  },
  benefitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  benefitIcon: {
    marginRight: 8,
  },
  benefitText: {
    fontSize: 14,
  },
  upgradeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PremiumUpgrade;