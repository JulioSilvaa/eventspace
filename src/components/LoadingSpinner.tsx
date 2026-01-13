/**
 * Spinner component for loading states
 */
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-4">
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-purple-600`}
        ></div>
        <p className="text-gray-600 text-sm">Carregando...</p>
      </div>
    </div>
  );
};
