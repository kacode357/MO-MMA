import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SearchPurchaseApi } from '@/services/purchase.services';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

interface Purchase {
  purchase_id: string;
  user_id: string;
  username: string;
  package_id: string;
  package_name: string;
  price: number;
  group_id: string | null;
  status: string;
  purchase_date: string;
}

const HistoryScreen = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Theme colors
  const colors = {
    background: useThemeColor({}, 'background'),
    text: useThemeColor({}, 'text'),
    icon: useThemeColor({}, 'icon'),
    border: useThemeColor({}, 'icon'),
    listItem: useThemeColor({}, 'background'),
  };

  // Fetch purchases from API
  const fetchPurchases = useCallback(async (page: number, reset: boolean = false) => {
    if (isLoading || isLoadingMore || !hasMore) return;

    reset ? setIsLoading(true) : setIsLoadingMore(true);

    try {
      const response = await SearchPurchaseApi({
        searchCondition: { keyword: '', status: '' },
        pageInfo: { pageNum: page, pageSize: 10 },
      });

      if (response?.data) {
        const newPurchases = response.data.pageData;
        const totalPages = response.data.pageInfo.totalPages;

        setPurchases(prev => (reset ? newPurchases : [...prev, ...newPurchases]));
        setHasMore(page < totalPages);
        setPageNum(page);
      } else {
        throw new Error('Không thể lấy danh sách giao dịch.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lấy danh sách giao dịch.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoading, isLoadingMore]);

  // Initial data load
  useEffect(() => {
    fetchPurchases(1, true);
  }, [fetchPurchases]);

  // Load more data on scroll
  const handleLoadMore = () => {
    if (!isLoading && !isLoadingMore && hasMore) {
      fetchPurchases(pageNum + 1);
    }
  };

  // Render purchase item
  const renderPurchaseItem = ({ item }: { item: Purchase }) => (
    <ThemedView style={[styles.purchaseItem, { backgroundColor: colors.listItem, borderColor: colors.border }]}>
      <ThemedText style={[styles.purchaseTitle, { color: colors.text }]}>{item.package_name}</ThemedText>
      <ThemedText style={[styles.purchaseText, { color: colors.text }]}>Mã giao dịch: {item.purchase_id}</ThemedText>
      <ThemedText style={[styles.purchaseText, { color: colors.text }]}>Người dùng: {item.username}</ThemedText>
      <ThemedText style={[styles.purchaseText, { color: colors.text }]}>Giá: {item.price.toLocaleString()} VND</ThemedText>
      <ThemedText style={[styles.purchaseText, { color: colors.text }]}>Trạng thái: {item.status}</ThemedText>
      <ThemedText style={[styles.purchaseText, styles.boldText, { color: colors.text }]}>
        Thời gian: {new Date(item.purchase_date).toLocaleString()}
      </ThemedText>
    </ThemedView>
  );

  // Render footer for loading more
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <ThemedView style={styles.footer}>
        <ActivityIndicator size="small" color={colors.icon} />
      </ThemedView>
    );
  };

  // Main UI
  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.icon} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.errorText, { color: colors.text }]}>Lỗi: {error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>
        Lịch sử giao dịch
      </ThemedText>
      {purchases.length === 0 ? (
        <ThemedText style={[styles.noDataText, { color: colors.text }]}>Không có giao dịch nào.</ThemedText>
      ) : (
        <FlatList
          data={purchases}
          renderItem={renderPurchaseItem}
          keyExtractor={item => item.purchase_id}
          contentContainerStyle={styles.listContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { marginBottom: 16 },
  listContainer: { paddingBottom: 16 },
  purchaseItem: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  purchaseTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  purchaseText: { fontSize: 16, marginBottom: 6 },
  boldText: { fontWeight: 'bold' },
  noDataText: { fontSize: 16, marginTop: 16, textAlign: 'center' },
  errorText: { fontSize: 16, textAlign: 'center' },
  footer: { paddingVertical: 20, alignItems: 'center' },
});

export default HistoryScreen;