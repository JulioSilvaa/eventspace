import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  placeholderSrc?: string;
  onClick?: () => void;
}

/**
 * OptimizedImage component with lazy loading and blur effect
 * Automatically loads images only when they enter the viewport
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width = '100%',
  height = 'auto',
  placeholderSrc = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 300\'%3E%3Crect fill=\'%23f3f4f6\' width=\'400\' height=\'300\'/%3E%3C/svg%3E',
  onClick,
}) => {
  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      effect="blur"
      placeholderSrc={placeholderSrc}
      width={width}
      height={height}
      className={className}
      onClick={onClick}
      wrapperClassName={className}
    />
  );
};
