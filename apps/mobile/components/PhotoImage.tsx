import { Image, type ImageProps } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';
import { resolvePhotoUrl } from '@/lib/photos';

type Props = Omit<ImageProps, 'source'> & {
  path?: string | null;
  placeholderStyle?: ViewStyle;
};

export function PhotoImage({ path, style, placeholderStyle, ...rest }: Props) {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!path);

  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setUri(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    resolvePhotoUrl(path)
      .then((url) => {
        if (!cancelled) {
          setUri(url);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!path || loading) {
    return (
      <View style={[styles.placeholder, style as ViewStyle, placeholderStyle]}>
        {loading ? <ActivityIndicator color={colors.rose} size="small" /> : null}
      </View>
    );
  }

  if (!uri) {
    return <View style={[styles.placeholder, style as ViewStyle, placeholderStyle]} />;
  }

  return <Image source={{ uri }} style={style} {...rest} />;
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.glassStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
