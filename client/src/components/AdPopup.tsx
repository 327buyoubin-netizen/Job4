import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdPopupProps {
  delay?: number;
}

export function AdPopup({ delay = 5000 }: AdPopupProps) {
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
            className="relative w-[90%] max-w-md bg-blue-600 rounded-lg p-8 shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            data-testid="ad-popup-content"
          >
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 text-white hover:bg-blue-500"
              onClick={() => setIsVisible(false)}
              data-testid="button-close-ad"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="text-center space-y-5">
              <div className="space-y-1">
                <p className="text-lg text-yellow-300 font-bold">
                  초특가 10분 안에 결제 시
                </p>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-yellow-300 leading-tight">
                SK 하이닉스
                <br />
                자소서 3일 완성
              </h2>

              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl text-white/60 line-through">50,000원</span>
                <span className="text-3xl text-yellow-300 font-bold">32,000원</span>
              </div>

              <div className="bg-white rounded-md p-4 space-y-2">
                <p className="text-xl text-red-500 font-bold">
                  수익모델 겸 재미로 만든 광고입니다
                </p>
                <p className="text-xl text-red-500 font-bold">
                  이틀 간의 교육 수고하셨습니다~
                </p>
                <p className="text-xl text-red-500 font-bold">
                  즐거운 겨울방학 보내세요~
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
