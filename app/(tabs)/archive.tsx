import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '../../constants/supabase';

export default function ArchiveScreen() {
  const [devotionals, setDevotionals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryLinks, setCategoryLinks] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | null>(null);
  const [searchText, setSearchText] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadArchive = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);

    try {
      const [
        devotionalsResult,
        categoriesResult,
        linksResult,
      ] = await Promise.all([
        supabase
          .from('devotionals')
          .select('*')
          .eq('published', true)
          .order('publish_date', { ascending: false }),

        supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true }),

        supabase
          .from('devotional_categories')
          .select('devotional_id, category_id'),
      ]);

      if (
        devotionalsResult.error ||
        categoriesResult.error ||
        linksResult.error
      ) {
        console.log(
          'ARCHIVE ERROR:',
          devotionalsResult.error
        );

        console.log(
          'CATEGORY ERROR:',
          categoriesResult.error
        );

        console.log(
          'CATEGORY LINKS ERROR:',
          linksResult.error
        );

        setLoadError(true);
        return;
      }

      setDevotionals(
        devotionalsResult.data || []
      );

      setCategories(
        categoriesResult.data || []
      );

      setCategoryLinks(
        linksResult.data || []
      );
    } catch (error) {
      console.log('LOAD ARCHIVE ERROR:', error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setSearchText('');
      setSelectedCategoryId(null);
      Keyboard.dismiss();

      loadArchive();
    }, [loadArchive])
  );

  const filteredDevotionals = useMemo(() => {
    const normalizedSearch =
      searchText.trim().toLowerCase();

    return devotionals.filter((devotional) => {
      const matchesCategory =
        selectedCategoryId === null ||
        categoryLinks.some(
          (link) =>
            link.devotional_id === devotional.id &&
            link.category_id === selectedCategoryId
        );

      const searchableText = [
        devotional.title,
        devotional.subtitle,
        devotional.scripture_reference,
        devotional.body,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        normalizedSearch === '' ||
        searchableText.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [
    devotionals,
    categoryLinks,
    selectedCategoryId,
    searchText,
  ]);

  if (isLoading) {
    return (
      <View style={styles.stateScreen}>
        <Text style={styles.eyebrow}>
          EXPLORE
        </Text>

        <Text style={styles.playerLabel}>
          FROM THE ARCHIVE
        </Text>

        <Text style={styles.stateHeading}>
          Loading the archive...
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.stateScreen}>
        <Text style={styles.eyebrow}>
          EXPLORE
        </Text>

        <Text style={styles.playerLabel}>
          FROM THE ARCHIVE
        </Text>

        <Text style={styles.stateHeading}>
          Couldn’t load the archive
        </Text>

        <Text style={styles.stateText}>
          Looks like we’re having trouble
          connecting right now. Give it another
          try in a moment.
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadArchive}
        >
          <Text style={styles.retryButtonText}>
            TRY AGAIN
          </Text>
        </Pressable>
      </View>
    );
  }

  if (devotionals.length === 0) {
    return (
      <View style={styles.stateScreen}>
        <Text style={styles.eyebrow}>
          EXPLORE
        </Text>

        <Text style={styles.playerLabel}>
          FROM THE ARCHIVE
        </Text>

        <Text style={styles.stateHeading}>
          Nothing in the archive just yet
        </Text>

        <Text style={styles.stateText}>
          Devotionals will begin appearing here
          as they’re published.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Text style={styles.eyebrow}>
        EXPLORE
      </Text>

      <Text style={styles.playerLabel}>
        FROM THE ARCHIVE
      </Text>

      <TextInput
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search devotionals..."
        placeholderTextColor="#8C8377"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="done"
        onSubmitEditing={Keyboard.dismiss}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          style={[
            styles.categoryChip,
            selectedCategoryId === null &&
              styles.categoryChipActive,
          ]}
          onPress={() => {
            Keyboard.dismiss();
            setSelectedCategoryId(null);
          }}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedCategoryId === null &&
                styles.categoryChipTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>

        {categories.map((category) => {
          const isActive =
            selectedCategoryId === category.id;

          return (
            <Pressable
              key={category.id}
              style={[
                styles.categoryChip,
                isActive &&
                  styles.categoryChipActive,
              ]}
              onPress={() => {
                Keyboard.dismiss();
                setSelectedCategoryId(
                  category.id
                );
              }}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isActive &&
                    styles.categoryChipTextActive,
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.list}>
        {filteredDevotionals.length === 0 ? (
          <Text style={styles.emptyText}>
            No devotionals match what you're looking for.
          </Text>
        ) : (
          filteredDevotionals.map(
            (devotional) => (
              <Link
                key={devotional.id}
                href={{
                  pathname: '/devotional/[id]',
                  params: {
                    id: String(devotional.id),
                  },
                }}
                asChild
              >
                <Pressable
                  style={styles.card}
                  onPress={() => {
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={styles.date}>
                    {devotional.publish_date
                      ? new Date(
                          devotional.publish_date +
                            'T12:00:00'
                        )
                          .toLocaleDateString(
                            'en-US',
                            {
                              month: 'long',
                              day: 'numeric',
                            }
                          )
                          .toUpperCase()
                      : ''}
                  </Text>

                  <Text style={styles.title}>
                    {devotional.title}
                  </Text>

                  {devotional.subtitle ? (
                    <Text style={styles.subtitle}>
                      {devotional.subtitle}
                    </Text>
                  ) : null}

                  <Text style={styles.scripture}>
                    {devotional.scripture_reference}
                  </Text>
                </Pressable>
              </Link>
            )
          )
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5EDE0',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 120,
  },

  stateScreen: {
    flex: 1,
    backgroundColor: '#F5EDE0',
    paddingHorizontal: 24,
    paddingTop: 70,
  },

  stateHeading: {
    marginTop: 18,
    fontSize: 28,
    fontWeight: '600',
    color: '#292111',
  },

  stateText: {
    marginTop: 14,
    fontSize: 18,
    lineHeight: 28,
    color: '#6E6A63',
    maxWidth: 340,
  },

  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 28,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#CDBDA5',
    backgroundColor: '#FBF4E7',
  },

  retryButtonText: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#5A4435',
  },

  eyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#9A7254',
    marginBottom: 8,
  },

  playerLabel: {
    fontSize: 21,
    fontWeight: '600',
    letterSpacing: 2.2,
    color: '#292111',
    marginBottom: 20,
  },

  searchInput: {
    backgroundColor: '#FBF4E7',
    borderWidth: 1,
    borderColor: '#CDBDA5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
    color: '#35322D',
    marginBottom: 14,
  },

  categoryRow: {
    gap: 8,
    paddingBottom: 18,
  },

  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CDBDA5',
    backgroundColor: '#FBF4E7',
  },

  categoryChipActive: {
    backgroundColor: '#5A4435',
    borderColor: '#5A4435',
  },

  categoryChipText: {
    fontSize: 13,
    color: '#5A4435',
  },

  categoryChipTextActive: {
    color: '#F8F3E9',
    fontWeight: '700',
  },

  list: {
    marginTop: 2,
  },

  card: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor:
      'rgba(53, 50, 45, 0.15)',
  },

  date: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#9A7254',
    marginBottom: 6,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#35322D',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#5F5A52',
    marginBottom: 6,
  },

  scripture: {
    fontSize: 15,
    color: '#6E6A63',
    fontFamily: 'Georgia',
  },

  emptyText: {
    marginTop: 20,
    fontSize: 16,
    lineHeight: 24,
    color: '#6E6A63',
  },
});