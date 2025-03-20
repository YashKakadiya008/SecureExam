const Logo = ({ width = "40", height = "40", className = "", showText = true }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/logo.svg" 
        alt="SecureExam Logo" 
        width={width} 
        height={height}
      />
      {showText && (
        <div className="ml-3">
          <span className="text-xl font-bold text-white">
            Secure<span className="text-white opacity-70">Exam</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo; 