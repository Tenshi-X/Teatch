import type { ImageProps } from 'next/image';
/* eslint-disable @next/next/no-img-element -- The offline preview serves public assets without the image optimizer. */

export default function PreviewImage({
  src,
  alt,
  fill,
  style,
  ...props
}: ImageProps) {
  const {
    priority,
    placeholder,
    blurDataURL,
    loader,
    quality,
    unoptimized,
    onLoadingComplete,
    ...imageProps
  } = props;
  void priority;
  void placeholder;
  void blurDataURL;
  void loader;
  void quality;
  void unoptimized;
  void onLoadingComplete;
  return (
    <img
      {...imageProps}
      src={
        typeof src === 'string'
          ? src
          : 'default' in src
            ? src.default.src
            : src.src
      }
      alt={alt}
      style={{
        ...(fill
          ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
          : {}),
        ...style,
      }}
    />
  );
}
