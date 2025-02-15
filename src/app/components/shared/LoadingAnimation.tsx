export const LoadingAnimation: React.FC = () => {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-[#3b82f6] rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-[#3b82f6] rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-[#3b82f6] rounded-full animate-bounce" />
    </div>
  );
};
