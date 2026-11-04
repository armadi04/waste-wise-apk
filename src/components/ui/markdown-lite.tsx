import { useMemo } from 'react';
import { View } from 'react-native';

import { parseMarkdownLite, type InlineSpan } from '@/lib/markdown-lite';
import { useTheme } from '@/theme';

import { AppText } from './text';

function Spans({ spans }: { spans: InlineSpan[] }) {
  const { colors, fontFamily } = useTheme();
  return (
    <>
      {spans.map((span, index) =>
        span.bold ? (
          <AppText key={index} weight="semibold">
            {span.text}
          </AppText>
        ) : span.code ? (
          <AppText
            key={index}
            style={{
              fontFamily: fontFamily.medium,
              backgroundColor: colors.muted,
            }}
          >
            {span.text}
          </AppText>
        ) : (
          span.text
        ),
      )}
    </>
  );
}

export function MarkdownLite({ source }: { source: string }) {
  const { colors, spacing } = useTheme();
  const blocks = useMemo(() => parseMarkdownLite(source), [source]);
  return (
    <View style={{ gap: spacing.sm }}>
      {blocks.map((block, index) => {
        if (block.kind === 'heading') {
          return (
            <AppText
              key={index}
              variant={block.level === 1 ? 'sectionTitle' : 'cardTitle'}
              accessibilityRole="header"
              style={{ marginTop: index ? spacing.sm : 0 }}
            >
              <Spans spans={block.spans} />
            </AppText>
          );
        }
        if (block.kind === 'bullet') {
          return (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                gap: spacing.sm,
                paddingLeft: block.depth * spacing.lg,
              }}
            >
              <AppText color={colors.mutedForeground}>•</AppText>
              <AppText color={colors.mutedForeground} style={{ flex: 1 }}>
                <Spans spans={block.spans} />
              </AppText>
            </View>
          );
        }
        return (
          <AppText key={index} color={colors.mutedForeground}>
            <Spans spans={block.spans} />
          </AppText>
        );
      })}
    </View>
  );
}
