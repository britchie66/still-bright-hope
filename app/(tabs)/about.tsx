import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function AboutScreen() {
  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={require('../../assets/images/still-bright-hope-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.eyebrow}>ABOUT</Text>
      <Text style={styles.heading}>Still Bright Hope</Text>

      <Text style={styles.body}>
        Still Bright Hope started with one simple question—what happened that
        we need our detergent pre-measured and wrapped in plastic? Were there
        people out there using too much? Is there a shortage?
      </Text>

      <Text style={styles.body}>
        Okay, there are a lot of questions.
      </Text>

      <Text style={styles.body}>
        The truth is, life can be frustrating, confusing, funny, and just plain
        curious. But at the end of the day, God has it all under control. He is
        sovereign, He is good, and He is for us.
      </Text>

      <Text style={styles.body}>
        Still Bright Hope is a weekday devotional where we laugh at the
        ludicrous, look honestly at life, and turn to Scripture for the truth
        that doesn't change when everything else does.
      </Text>

      <Text style={styles.body}>
        And through it all, we praise the King who rules with love and mercy.
      </Text>

      <View style={styles.divider} />

      <Text style={styles.sectionHeading}>ABOUT BRIAN</Text>

      <Text style={styles.body}>
        I'm Brian Ritchie. I write and produce Still Bright Hope because I love
        Scripture, I love making people laugh, and somewhere along the way I
        discovered those two things don't have to live in separate rooms.
      </Text>

      <Text style={styles.body}>
        Thanks for spending a few minutes of your day with me. I hope something
        here makes you laugh, points you toward Jesus, and reminds you that
        there is still bright hope.
      </Text>

      <Text style={styles.signature}>Brian</Text>

      <View style={styles.divider} />

      <Text style={styles.sectionHeading}>MORE</Text>

      <Pressable
        style={styles.linkRow}
        onPress={() => openLink('https://stillbrighthope.com')}
      >
        <Text style={styles.linkText}>Visit Still Bright Hope</Text>
        <Text style={styles.linkArrow}>›</Text>
      </Pressable>

      <Pressable
        style={styles.linkRow}
        onPress={() =>
          openLink('https://stillbrighthope.com/subscribe')
        }
      >
        <Text style={styles.linkText}>Get Daily Devotionals by Email</Text>
        <Text style={styles.linkArrow}>›</Text>
      </Pressable>

      <Pressable
        style={styles.linkRow}
        onPress={() =>
          openLink('mailto:stillbrighthope@gmail.com')
        }
      >
        <Text style={styles.linkText}>Contact & Support</Text>
        <Text style={styles.linkArrow}>›</Text>
      </Pressable>

      <Pressable
        style={styles.linkRow}
        onPress={() =>
          openLink('https://www.stillbrighthope.com/privacy-policy')
        }
      >
        <Text style={styles.linkText}>Privacy Policy</Text>
        <Text style={styles.linkArrow}>›</Text>
      </Pressable>

      <Text style={styles.footer}>
        © 2026 Still Bright Hope
      </Text>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4EFE6',
  },

  content: {
    paddingHorizontal: 28,
    paddingTop: 50,
    paddingBottom: 40,
  },

  logo: {
    width: 250,
    height: 130,
    alignSelf: 'center',
    marginBottom: 20,
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
    color: '#27251F',
    marginBottom: 28,
  },

  body: {
    fontSize: 19,
    lineHeight: 30,
    color: '#35322D',
    marginBottom: 20,
    letterSpacing: 0.1,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(154, 114, 84, 0.25)',
    marginTop: 16,
    marginBottom: 32,
  },

  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#9A7254',
    marginBottom: 18,
  },

  signature: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '600',
    color: '#5A4435',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },

  linkRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(154, 114, 84, 0.18)',
  },

  linkText: {
    flex: 1,
    fontSize: 17,
    color: '#35322D',
    paddingRight: 12,
  },

  linkArrow: {
    fontSize: 28,
    color: '#9A7254',
    marginTop: -2,
  },

  footer: {
    marginTop: 34,
    fontSize: 13,
    color: '#8A837A',
    textAlign: 'center',
  },

  bottomSpace: {
    height: 40,
  },
});