import { motion } from "framer-motion";

const LoadingDots = () => {
  return (
    <motion.span animate={{ opacity: [0, 1, 0], x: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="inline-block">
      ...
    </motion.span>
  );
};

export default LoadingDots;
