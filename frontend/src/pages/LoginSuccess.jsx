import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={styles.container}>
      <div className="unique-success-container">
        <svg width="280" height="280" viewBox="0 0 300 300" style={{ filter: 'drop-shadow(0 10px 20px rgba(46, 125, 50, 0.2))' }}>
          {/* Background Ring */}
          <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(46, 125, 50, 0.1)" strokeWidth="2" strokeDasharray="10 5" />
          
          {/* Glowing Sun */}
          <g className="sun-group">
            <circle cx="230" cy="70" r="25" fill="url(#sunGradient)" />
            <defs>
              <radialGradient id="sunGradient">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>
          </g>

          {/* Growing Roots */}
          <path d="M150,250 Q140,270 130,280 M150,250 Q160,270 170,285" fill="none" stroke="#92400e" strokeWidth="3" strokeLinecap="round" className="roots">
            <animate attributeName="stroke-dasharray" from="0,100" to="100,0" dur="1.5s" fill="freeze" />
          </path>

          {/* Main Stem */}
          <path d="M150,250 C150,250 150,180 150,120" fill="none" stroke="#166534" strokeWidth="8" strokeLinecap="round" className="main-stem" />

          {/* Animated Leaves */}
          <g className="leaves">
            {/* Leaf 1 */}
            <path d="M150,200 Q120,170 110,200 Q120,230 150,200" fill="#22c55e" className="leaf leaf-1" />
            {/* Leaf 2 */}
            <path d="M150,160 Q180,130 190,160 Q180,190 150,160" fill="#4ade80" className="leaf leaf-2" />
            {/* Top Bud/Flower */}
            <circle cx="150" cy="120" r="0" fill="#facc15" className="flower-bud">
              <animate attributeName="r" from="0" to="10" dur="0.8s" begin="1.8s" fill="freeze" />
            </circle>
          </g>

          {/* Floating Particles */}
          <g className="particles">
            {[...Array(8)].map((_, i) => (
              <circle key={i} r="2" fill="#4ade80" className={`particle particle-${i}`} />
            ))}
          </g>
        </svg>
      </div>

      <h2 style={styles.title} className="glow-text">AgriGita Success 🌾</h2>
      <p style={styles.subtitle}>Sowing the seeds of digital innovation</p>

      <style>{`
        .main-stem {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: growStem 1.2s ease-out forwards;
        }
        @keyframes growStem {
          to { stroke-dashoffset: 0; }
        }
        .leaf {
          transform: scale(0);
          transform-origin: 150px var(--leaf-y);
          animation: popLeaf 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .leaf-1 { --leaf-y: 200px; animation-delay: 0.8s; }
        .leaf-2 { --leaf-y: 160px; animation-delay: 1.2s; }
        
        @keyframes popLeaf {
          to { transform: scale(1); }
        }

        .flower-bud {
          filter: drop-shadow(0 0 5px #facc15);
        }

        @keyframes float {
          0% { transform: translate(0, 0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
        }

        .particle {
          animation: float 2s infinite ease-out;
        }
        ${[...Array(8)].map((_, i) => `
          .particle-${i} {
            cx: ${130 + Math.random() * 40};
            cy: ${150 + Math.random() * 50};
            --dx: ${(Math.random() - 0.5) * 100}px;
            --dy: ${-50 - Math.random() * 100}px;
            animation-delay: ${Math.random() * 2}s;
          }
        `).join('')}

        .glow-text {
          text-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
          animation: textFocus 1s ease-out;
        }
        @keyframes textFocus {
          from { letter-spacing: 10px; filter: blur(5px); opacity: 0; }
          to { letter-spacing: normal; filter: blur(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to top, #f0fdf4, #ffffff)",
    fontFamily: "'Inter', sans-serif"
  },
  title: {
    marginTop: "20px",
    color: "#166534",
    fontSize: "1.8rem",
    fontWeight: 800
  },
  subtitle: {
    color: "#666",
    fontSize: "1rem",
    marginTop: "8px"
  }
};

export default LoginSuccess;
