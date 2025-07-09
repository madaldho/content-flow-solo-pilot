import { motion } from "framer-motion";

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FloatingElement({ 
  children, 
  delay = 0, 
  duration = 20, 
  className = "" 
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      initial={{ y: 0 }}
      animate={{ 
        y: [0, -10, 0],
        rotate: [0, 1, -1, 0]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}
