const Logo = ({ width = "200", height = "200", className = "" }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#7C3AED"}}/> 
          <stop offset="100%" style={{stopColor:"#4F46E5"}}/> 
        </linearGradient>
        
        {/* 3D effect gradients */}
        <linearGradient id="topGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor:"#7C3AED", stopOpacity: "1"}}/>
          <stop offset="100%" style={{stopColor:"#4F46E5", stopOpacity: "0.8"}}/>
        </linearGradient>
      </defs>

      {/* Largest Hexagon */}
      <path 
        d="M100 35L165 70V130L100 165L35 130V70L100 35Z" 
        fill="white" 
        stroke="url(#logoGradient)" 
        strokeWidth="5"
      />

      {/* Second Hexagon */}
      <path 
        d="M100 50L150 77.5V122.5L100 150L50 122.5V77.5L100 50Z" 
        fill="white" 
        stroke="url(#logoGradient)" 
        strokeWidth="5"
      />

      {/* Third Hexagon */}
      <path 
        d="M100 65L135 85V115L100 135L65 115V85L100 65Z" 
        fill="white" 
        stroke="url(#logoGradient)" 
        strokeWidth="5"
      />

      {/* Center Hexagon */}
      <path 
        d="M100 80L120 92.5V107.5L100 120L80 107.5V92.5L100 80Z" 
        fill="url(#topGradient)" 
        opacity="0.2"
      />

      {/* Left Connection Lines */}
      <line x1="15" y1="85" x2="35" y2="85" stroke="url(#logoGradient)" strokeWidth="4"/>
      <line x1="15" y1="100" x2="35" y2="100" stroke="url(#logoGradient)" strokeWidth="4"/>
      <line x1="15" y1="115" x2="35" y2="115" stroke="url(#logoGradient)" strokeWidth="4"/>

      {/* Right Connection Lines */}
      <line x1="165" y1="85" x2="185" y2="85" stroke="url(#logoGradient)" strokeWidth="4"/>
      <line x1="165" y1="100" x2="185" y2="100" stroke="url(#logoGradient)" strokeWidth="4"/>
      <line x1="165" y1="115" x2="185" y2="115" stroke="url(#logoGradient)" strokeWidth="4"/>

      {/* Connection Points Left */}
      <circle cx="10" cy="85" r="5" fill="url(#logoGradient)"/>
      <circle cx="10" cy="100" r="5" fill="url(#logoGradient)"/>
      <circle cx="10" cy="115" r="5" fill="url(#logoGradient)"/>

      {/* Connection Points Right */}
      <circle cx="190" cy="85" r="5" fill="url(#logoGradient)"/>
      <circle cx="190" cy="100" r="5" fill="url(#logoGradient)"/>
      <circle cx="190" cy="115" r="5" fill="url(#logoGradient)"/>

      {/* Decorative Dots */}
      <circle cx="100" cy="30" r="3" fill="url(#logoGradient)"/>
      <circle cx="100" cy="170" r="3" fill="url(#logoGradient)"/>
      <circle cx="40" cy="60" r="3" fill="url(#logoGradient)"/>
      <circle cx="160" cy="60" r="3" fill="url(#logoGradient)"/>
      <circle cx="40" cy="140" r="3" fill="url(#logoGradient)"/>
      <circle cx="160" cy="140" r="3" fill="url(#logoGradient)"/>
    </svg>
  );
};

export default Logo; 