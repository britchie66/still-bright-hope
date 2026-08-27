import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
} from 'react-native';
import { supabase } from '../../constants/supabase';

const SAVED_KEY = 'savedDevotionalIds';

export default function SavedScreen() {
  const [devotionals, setDevotionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function loadSavedDevotionals() {
        setLoading(true);

        try {
          const savedJson = await AsyncStorage.getItem(SAVED_KEY);

          const savedIds: number[] = savedJson
            ? JSON.parse(savedJson)
            : [];

          if (savedIds.length === 0) {
            setDevotionals([]);
            setLoading(false);
            return;
          }

          const { data, error } = await supabase
            .from('devotionals')
            .select('*')
            .in('id', savedIds)
            .eq('published', true)
            .order('publish_date', { ascending: false });

          if (error) {
            console.log('SAVED LOAD ERROR:', error);
            setDevotionals([]);
          } else {
            setDevotionals(data || []);
          }
        } catch (error) {
          console.log('SAVED ERROR:', error);
          setDevotionals([]);
        }

        setLoading(false);
      }

      loadSavedDevotionals();
    }, [])
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>YOUR COLLECTION</Text>

      <Text style={styles.heading}>
        Saved Devotionals
      </Text>

      <Text style={styles.intro}>
        Keep the ones you want to come back to.
      </Text>

      {loading ? (
        <Text style={styles.emptyText}>
          Loading...
        </Text>
      ) : devotionals.length === 0 ? (
        <Text style={styles.emptyText}>
          You haven&apos;t saved any devotionals yet.
        </Text>
      ) : (
        devotionals.map((devotional) => (
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
            <Pressable style={styles.card}>
              <Text style={styles.date}>
                {devotional.publish_date
                  ? new Date(
                      devotional.publish_date + 'T12:00:00'
                    )
                      .toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
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
        ))
      )}
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

  eyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#9A7254',
    marginBottom: 8,
  },

  heading: {
    fontSize: 34,
    fontWeight: '700',
    color: '#35322D',
    marginBottom: 10,
  },

  intro: {
    fontSize: 16,
    lineHeight: 23,
    color: '#6E6A63',
    marginBottom: 26,
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