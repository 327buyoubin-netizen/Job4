import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdPopupProps {
  delay?: number;
}

export function AdPopup({ delay = 15000 }: AdPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid="ad-popup-overlay"
        >
          <motion.div
            className="relative w-[90%] max-w-md bg-gray-200 rounded-lg p-8 shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            data-testid="ad-popup-content"
          >
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => setIsVisible(false)}
              data-testid="button-close-ad"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="text-center space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 tracking-widest">
                  온라인으로 언제 어디서든
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-blue-800 leading-tight">
                  SK 하이닉스
                  <br />
                  자소서 3일 완성
                </h2>
              </div>

              <div className="space-y-2 text-gray-700">
                <p className="text-base">
                  수익모델 겸 재미로 만든 광고입니다
                </p>
                <p className="text-sm">
                  한양대 빠이팅 즐거운 겨울방학 보내세요~
                </p>
              </div>

              <button
                className="w-full py-4 bg-blue-700 text-white font-medium rounded-md hover:bg-blue-800 transition-colors"
                onClick={() => setIsVisible(false)}
                data-testid="button-ad-cta"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
