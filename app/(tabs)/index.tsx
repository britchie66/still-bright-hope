import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [hasNoDevotional, setHasNoDevotional] = useState(false);

  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

useEffect(() => {
  setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: 'doNotMix',
  });
}, []);

  const loadHome = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    setHasNoDevotional(false);

    try {
      const savedSize =
        await AsyncStorage.getItem(TEXT_SIZE_KEY);

      if (savedSize) {
        setTextSize(Number(savedSize));
      }

      const today =
        new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .eq('published', true)
        .lte('publish_date', today)
        .order('publish_date', {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.log('SUPABASE ERROR:', error);
        setDevotional(null);
        setLoadError(true);
        return;
      }

      if (!data) {
        setDevotional(null);
        setHasNoDevotional(true);
        return;
      }

      setDevotional(data);

      try {
        const savedJson =
          await AsyncStorage.getItem(SAVED_KEY);

        const savedIds: number[] =
          savedJson ? JSON.parse(savedJson) : [];

        setIsSaved(
          savedIds.includes(Number(data.id))
        );
      } catch (savedError) {
        console.log(
          'CHECK SAVED ERROR:',
          savedError
        );
      }

      console.log('SUPABASE DATA:', data);
    } catch (error) {
      console.log('LOAD HOME ERROR:', error);
      setDevotional(null);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHome();
    }, [loadHome])
  );

  useEffect(() => {
    if (devotional?.audio_url) {
      player.replace(devotional.audio_url);
    } else {
      player.pause();
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

  async function toggleSaved() {
    if (!devotional?.id) return;

    try {
      const savedJson =
        await AsyncStorage.getItem(SAVED_KEY);

      let savedIds: number[] =
        savedJson ? JSON.parse(savedJson) : [];

      const devotionalId = Number(devotional.id);

      if (savedIds.includes(devotionalId)) {
        savedIds = savedIds.filter(
          (savedId) =>
            savedId !== devotionalId
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

      const scriptureLine =
        devotional.scripture_reference
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

  if (isLoading) {
    return (
      <View style={styles.stateScreen}>
        <Image
          source={require('../../assets/images/still-bright-hope-logo.png')}
          style={styles.brandLogo}
          resizeMode="contain"
        />

        <Text style={styles.stateHeading}>
          Loading today’s devotional...
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.stateScreen}>
        <Image
          source={require('../../assets/images/still-bright-hope-logo.png')}
          style={styles.brandLogo}
          resizeMode="contain"
        />

        <Text style={styles.stateHeading}>
          Couldn’t load today’s devotional
        </Text>

        <Text style={styles.stateText}>
          Looks like we’re having trouble connecting
          right now. Give it another try in a moment.
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadHome}
        >
          <Text style={styles.retryButtonText}>
            TRY AGAIN
          </Text>
        </Pressable>
      </View>
    );
  }

  if (hasNoDevotional) {
    return (
      <View style={styles.stateScreen}>
        <Image
          source={require('../../assets/images/still-bright-hope-logo.png')}
          style={styles.brandLogo}
          resizeMode="contain"
        />

        <Text style={styles.stateHeading}>
          Nothing here just yet
        </Text>

        <Text style={styles.stateText}>
          Today’s devotional hasn’t been published yet.
          Check back soon.
        </Text>
      </View>
    );
  }

  const hasAudio = Boolean(devotional?.audio_url);
  const hasPrayer = Boolean(
    devotional?.prayer &&
      devotional.prayer.trim()
  );

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
                devotional.publish_date +
                  'T12:00:00'
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
          {devotional?.title || ''}
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
            <Text style={styles.shareIcon}>
              ↗
            </Text>

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
              onPress={() =>
                changeTextSize(-1)
              }
            >
              <Text style={styles.textSizeSmall}>
                A−
              </Text>
            </Pressable>

            <Pressable
              style={styles.textSizeButton}
              onPress={() =>
                changeTextSize(1)
              }
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

        {hasPrayer ? (
          <>
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
              {devotional.prayer}
            </Text>
          </>
        ) : null}

        {!hasAudio ? (
          <View style={styles.noAudioNotice}>
            <Text style={styles.noAudioText}>
              Audio is not available for this devotional.
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.bottomSpace,
            !hasAudio &&
              styles.bottomSpaceNoPlayer,
          ]}
        />
      </ScrollView>

      {hasAudio ? (
        <View style={styles.player}>
          <View style={styles.playerTopRow}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerLabel}>
                TODAY'S DEVOTIONAL
              </Text>

              <Text
                style={styles.playerTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {devotional?.title || ''}
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
                onPress={async () => {
                  if (status.playing) {
                    player.pause();
                  } else {
                    if (
                      status.didJustFinish ||
                      (status.duration > 0 &&
                        status.currentTime >= status.duration - 0.5)
                    ) {
                      await player.seekTo(0);
                    }
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
            style={styles.progressTouchArea}
            onLayout={(event) => {
              setProgressWidth(event.nativeEvent.layout.width);
            }}
            onPress={(event) => {
              if (status.duration > 0 && progressWidth > 0) {
                const newTime = Math.max(
                  0,
                  Math.min(
                    status.duration,
                    (event.nativeEvent.locationX / progressWidth) * status.duration
                  )
                );
                player.seekTo(newTime);
              }
            }}
          >
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      status.duration > 0
                        ? Math.max(0, Math.min(100, (status.currentTime / status.duration) * 100))
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4EFE6',
  },

  content: {
    paddingTop: 70,
    paddingHorizontal: 28,
  },

  stateScreen: {
    flex: 1,
    backgroundColor: '#F4EFE6',
    paddingHorizontal: 28,
    paddingTop: 70,
    alignItems: 'center',
  },

  stateHeading: {
    marginTop: 24,
    fontSize: 28,
    fontWeight: '600',
    color: '#27251F',
    textAlign: 'center',
  },

  stateText: {
    marginTop: 14,
    fontSize: 18,
    lineHeight: 28,
    color: '#5A554E',
    textAlign: 'center',
    maxWidth: 340,
  },

  retryButton: {
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

  noAudioNotice: {
    marginTop: 36,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor:
      'rgba(154, 114, 84, 0.25)',
  },

  noAudioText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6E6A63',
    fontStyle: 'italic',
  },

  bottomSpace: {
    height: 130,
  },

  bottomSpaceNoPlayer: {
    height: 50,
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

  playerInfo: {
    flex: 1,
    paddingRight: 12,
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

  progressTouchArea: {
    height: 28,
    justifyContent: 'center',
    marginTop: 2,
  },

  progressTrack: {
    height: 4,
    backgroundColor: '#6A655D',
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
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