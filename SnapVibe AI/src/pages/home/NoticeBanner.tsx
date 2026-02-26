import { useEffect, useRef, useState } from "react";

export default function NoticeBanner() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          const scrollDiff = currentScrollY - lastScrollY.current;

          // Only react if scroll difference is significant
          if (Math.abs(scrollDiff) > 10) {
            if (scrollDiff > 0) {
              // Scrolling down
              setVisible(false);
            } else {
              // Scrolling up
              setVisible(true);
            }

            lastScrollY.current = currentScrollY;
          }

          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="sticky top-16 z-40 overflow-hidden">
      <div
        className={`transition-all duration-300 ease-in-out ${
          visible ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="w-full bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2 text-center text-xs sm:text-sm text-amber-900">
          🚧 <strong>✨ We’re Just Getting Started</strong> This platform is in active development.
          <span className="font-medium"> New features are coming soon — thanks for exploring early!</span>
        </div>
      </div>
    </div>
  );
}