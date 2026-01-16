import { motion } from "framer-motion";
import introImage from "@assets/stock_images/professional_office__e8ceca1f.jpg";

interface IntroScreenProps {
  onEnter: () => void;
}

export function IntroScreen({ onEnter }: IntroScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
      onClick={onEnter}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="intro-screen"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${introImage})` }}
      />
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative z-10 text-center text-white px-4">
        <motion.p
          className="text-xl md:text-2xl mb-4 font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          당신의 취업 성공을 위한
        </motion.p>
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          JOB FOR YOU
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-white/80 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          채용 일정 관리부터 자소서 작성까지
        </motion.p>
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <p className="text-sm text-white/60 animate-pulse">
            화면을 클릭하여 시작하세요
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
