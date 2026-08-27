import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { supabase } from '../../constants/supabase';

const TEXT_SIZE_KEY = 'devotionalTextSize';
const SAVED_KEY = 'savedDevotionalIds';

export default function HomeScreen() {
  const [devotional, setDevotional] = useState<any>(null);
  const [progressWidth, setProgressWidth] = useState(0);
  const [textSize, setTextSize] = useState(19);
  const [isSaved, setIsSaved] = useState(false);

  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const { id } = useLocalSearchParams();

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    });
  }, []);

  useEffect(() => {
    async function loadTextSize() {
      const savedSize = await AsyncStorage.getItem(TEXT_SIZE_KEY);

      if (savedSize) {
        setTextSize(Number(savedSize));
      }
    }

    loadTextSize();
  }, []);

  useEffect(() => {
    async function loadDevotional() {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setDevotional(data);
      }

      console.log('SUPABASE DATA:', data);
      console.log('SUPABASE ERROR:', error);
    }

    loadDevotional();
  }, [id]);

  useEffect(() => {
    if (devotional?.audio_url) {
      player.replace(devotional.audio_url);
    }
  }, [devotional?.audio_url]);

  async function changeTextSize(amount: number) {
    const newSize = Math.min(
      25,
      Math.max(16, textSize + amount)
    );

    setTextSize(newSize);

    await AsyncStorage.setItem(
      TEXT_SIZE_KEY,
      String(newSize)
    );
  }

  useEffect(() => {
    async function checkSaved() {
      if (!id) return;

      try {
        const savedJson = await AsyncStorage.getItem(SAVED_KEY);
        const savedIds: number[] = savedJson
          ? JSON.parse(savedJson)
          : [];

        setIsSaved(savedIds.includes(Number(id)));
      } catch (error) {
        console.log('CHECK SAVED ERROR:', error);
      }
    }

    checkSaved();
  }, [id]);

  async function toggleSaved() {
    if (!id) return;

    try {
      const savedJson = await AsyncStorage.getItem(SAVED_KEY);
      let savedIds: number[] = savedJson
        ? JSON.parse(savedJson)
        : [];

      const devotionalId = Number(id);

      if (savedIds.includes(devotionalId)) {
        savedIds = savedIds.filter(
          (savedId) => savedId !== devotionalId
        );
        setIsSaved(false);
      } else {
        savedIds.push(devotionalId);
        setIsSaved(true);
      }

      await AsyncStorage.setItem(
        SAVED_KEY,
        JSON.stringify(savedIds)
      );
    } catch (error) {
      console.log('SAVE ERROR:', error);
    }
  }

  async function shareDevotional() {
    if (!devotional?.id) return;

    try {
      const url =
        `https://www.stillbrighthope.com/devotional?id=${devotional.id}`;

      const subtitleLine = devotional.subtitle
        ? `\n${devotional.subtitle}`
        : '';

      const scriptureLine = devotional.scripture_reference
        ? `\n${devotional.scripture_reference}`
        : '';

      await Share.share({
        message:
          `${devotional.title || 'Still Bright Hope'}${subtitleLine}${scriptureLine}\n\nRead & listen:\n${url}`,
      });
    } catch (error) {
      console.log('SHARE ERROR:', error);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('../../assets/images/still-bright-hope-logo.png')}
          style={styles.brandLogo}
          resizeMode="contain"
        />

        <Text style={styles.date}>
          {devotional?.publish_date
            ? new Date(
                devotional.publish_date + 'T12:00:00'
              )
                .toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })
                .toUpperCase()
                .replace(',', ' ·')
            : ''}
        </Text>

        <Text style={styles.title}>
          {devotional?.title || 'Loading...'}
        </Text>

        <View style={styles.actionRow}>
          <Pressable
            style={styles.actionButton}
            onPress={toggleSaved}
          >
            <Text style={styles.actionIcon}>
              {isSaved ? '♥' : '♡'}
            </Text>

            <Text style={styles.actionText}>
              {isSaved ? 'SAVED' : 'SAVE'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={shareDevotional}
          >
            <Text style={styles.shareIcon}>↗</Text>

            <Text style={styles.actionText}>
              SHARE
            </Text>
          </Pressable>
        </View>

        <View style={styles.scriptureCardWrap}>
          <View style={styles.paperBehind} />

          <View style={styles.scriptureCard}>
            <View style={styles.tape} />

            <Image
              source={require('../../assets/images/paper-texture.png')}
              style={styles.paperTexture}
              resizeMode="stretch"
            />

            <Text style={styles.scriptureReference}>
              {devotional?.scripture_reference || ''}
            </Text>

            <Text style={styles.scripture}>
              {devotional?.scripture_text || ''}
            </Text>
          </View>
        </View>

        <View style={styles.readerControls}>
          <Text style={styles.readerLabel}>
            TEXT SIZE
          </Text>

          <View style={styles.textSizeButtons}>
            <Pressable
              style={styles.textSizeButton}
              onPress={() => changeTextSize(-1)}
            >
              <Text style={styles.textSizeSmall}>
                A−
              </Text>
            </Pressable>

            <Pressable
              style={styles.textSizeButton}
              onPress={() => changeTextSize(1)}
            >
              <Text style={styles.textSizeLarge}>
                A+
              </Text>
            </Pressable>
          </View>
        </View>

        <View>
          {(devotional?.body || '')
            .split(/\n+/)
            .filter((paragraph: string) =>
              paragraph.trim()
            )
            .map(
              (
                paragraph: string,
                index: number
              ) => (
                <Text
                  key={index}
                  style={[
                    styles.body,
                    {
                      fontSize: textSize,
                      lineHeight:
                        textSize * 1.58,
                    },
                  ]}
                >
                  {paragraph.trim()}
                </Text>
              )
            )}
        </View>

        <Text style={styles.prayerHeading}>
          PRAYER
        </Text>

        <Text
          style={[
            styles.prayer,
            {
              fontSize: textSize - 1,
              lineHeight: textSize * 1.58,
            },
          ]}
        >
          {devotional?.prayer || ''}
        </Text>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <View style={styles.player}>
        <View style={styles.playerTopRow}>
          <View>
            <Text style={styles.playerLabel}>
              ARCHIVE
            </Text>

            <Text style={styles.playerTitle}>
              {devotional?.title || 'Loading...'}
            </Text>

            <Text style={styles.playerTime}>
              {Math.floor(
                status.currentTime / 60
              )}
              :
              {String(
                Math.floor(
                  status.currentTime % 60
                )
              ).padStart(2, '0')}
              {' / '}
              {Math.floor(
                status.duration / 60
              )}
              :
              {String(
                Math.floor(
                  status.duration % 60
                )
              ).padStart(2, '0')}
            </Text>
          </View>

          <View style={styles.playerControls}>
            <Pressable
              style={styles.rewindButton}
              onPress={() => {
                const newTime = Math.max(
                  0,
                  status.currentTime - 15
                );
                player.seekTo(newTime);
              }}
            >
              <Text style={styles.rewindText}>
                ↶15
              </Text>
            </Pressable>

            <Pressable
              style={styles.playButton}
              onPress={() => {
                if (status.playing) {
                  player.pause();
                } else {
                  player.play();
                }
              }}
            >
              <Text style={styles.playIcon}>
                {status.playing
                  ? '❚❚'
                  : '▶'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.rewindButton}
              onPress={() => {
                const newTime = Math.min(
                  status.duration,
                  status.currentTime + 15
                );
                player.seekTo(newTime);
              }}
            >
              <Text style={styles.rewindText}>
                15↷
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={styles.progressTrack}
          onLayout={(event) => {
            setProgressWidth(
              event.nativeEvent.layout.width
            );
          }}
          onPress={(event) => {
            if (
              status.duration > 0 &&
              progressWidth > 0
            ) {
              const tapX =
                event.nativeEvent.locationX;

              const newTime =
                (tapX / progressWidth) *
                status.duration;

              player.seekTo(newTime);
            }
          }}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  status.duration > 0
                    ? (status.currentTime /
                        status.duration) *
                      100
                    : 0
                }%`,
              },
            ]}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4EFE6',
  },

  content: {
    paddingTop: 20,
    paddingHorizontal: 28,
  },

  date: {
    fontSize: 12,
    letterSpacing: 2,
    color: '#9A7254',
    marginBottom: 10,
  },

  title: {
    fontSize: 42,
    fontWeight: '600',
    color: '#27251F',
    marginBottom: 12,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 32,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#CDBDA5',
    backgroundColor: '#FBF4E7',
  },

  actionIcon: {
    fontSize: 20,
    color: '#9A7254',
  },

  shareIcon: {
    fontSize: 18,
    color: '#9A7254',
  },

  actionText: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#5A4435',
  },

  scriptureCard: {
    backgroundColor: '#FBF4E7',
    padding: 24,
    paddingTop: 30,
    transform: [{ rotate: '-1deg' }],

    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    borderWidth: 1,
    borderColor:
      'rgba(170, 145, 110, 0.10)',
  },

  tape: {
    position: 'absolute',
    top: -14,
    left: '50%',
    marginLeft: -47.5,
    width: 95,
    height: 28,
    backgroundColor:
      'rgba(205, 184, 145, 0.62)',
    transform: [{ rotate: '2deg' }],
    zIndex: 10,
  },

  scriptureReference: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#9A7254',
    marginBottom: 14,
  },

  scripture: {
    fontSize: 19,
    lineHeight: 28,
    color: '#35322D',
    fontFamily: 'Georgia',
  },

  readerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  readerLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#9A7254',
  },

  textSizeButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  textSizeButton: {
    minWidth: 44,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#CDBDA5',
    backgroundColor: '#FBF4E7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  textSizeSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A4435',
  },

  textSizeLarge: {
    fontSize: 17,
    fontWeight: '700',
    color: '#5A4435',
  },

  body: {
    marginBottom: 18,
    color: '#35322D',
    letterSpacing: 0.1,
  },

  prayerHeading: {
    marginTop: 42,
    marginBottom: 14,
    fontSize: 12,
    letterSpacing: 3,
    color: '#9A7254',
  },

  prayer: {
    color: '#393630',
    fontStyle: 'italic',
  },

  bottomSpace: {
    height: 130,
  },

  player: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 82,
    backgroundColor: '#4A463E',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },

  playerLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: '#D8CDBD',
  },

  playerTitle: {
    marginTop: 4,
    fontSize: 17,
    color: '#F4EFE6',
  },

  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E9DDC8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  playIcon: {
    color: '#292C28',
    fontSize: 18,
    marginLeft: 3,
  },

  playerTime: {
    fontSize: 12,
    color: '#E5D98B',
    marginTop: 4,
  },

  progressTrack: {
    height: 4,
    backgroundColor: '#6A655D',
    borderRadius: 2,
    marginTop: 8,
    width: '100%',
  },

  progressFill: {
    height: 4,
    backgroundColor: '#D9C96F',
    borderRadius: 2,
  },

  playerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  rewindButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rewindText: {
    fontSize: 16,
    color: '#F8F3E9',
  },

  brandLogo: {
    width: 250,
    height: 130,
    alignSelf: 'center',
    marginBottom: 10,
  },

  scriptureCardWrap: {
    position: 'relative',
    marginBottom: 38,
  },

  paperBehind: {
    position: 'absolute',
    top: 8,
    left: 6,
    right: -2,
    bottom: -6,
    backgroundColor: '#E8DCC7',
    transform: [{ rotate: '0.8deg' }],
  },

  paperTexture: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.28,
  },
});