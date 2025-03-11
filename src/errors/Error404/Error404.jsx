import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react"; // Mengimpor ikon dari lucide-react
import { motion } from "framer-motion"; // Import motion for animations

const Error404 = () => (
  <motion.div className="flex flex-1 items-center justify-center min-h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
    <motion.div className="w-full max-w-md" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="mr-2" /> 404 Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-gray-700 mb-4">Halaman yang Anda cari tidak ditemukan.</p>
          <Link to="/home">
            <Button variant="primary" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Kembali ke Beranda
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  </motion.div>
);

export default Error404;
