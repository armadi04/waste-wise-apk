import LottieView, { type LottieViewProps } from 'lottie-react-native';

export function AppLottie({
  source,
  size = 180,
  loop = true,
}: {
  source: LottieViewProps['source'];
  size?: number;
  loop?: boolean;
}) {
  return (
    <LottieView
      source={source}
      autoPlay
      loop={loop}
      style={{ width: size, height: size }}
    />
  );
}
