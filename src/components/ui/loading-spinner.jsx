import { motion } from "framer-motion";
import { Coins } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <motion.div className="fixed inset-0 flex justify-center items-center bg-background/80 z-50" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
      <Coins className="w-10 h-10 text-primary" />
    </motion.div>
  );
}
