import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import router from "./routes/Router";
import Cookies from "js-cookie";
import { Toaster } from "@/components/ui/sonner";

function App() {
  // Ambil cookie yang disimpan untuk menentukan apakah sidebar terbuka atau tidak
  const theme = Cookies.get("sidebar_state") === "true";

  return (
    <ThemeProvider>
      <SidebarProvider defaultOpen={theme}>
        <Toaster />
        <RouterProvider router={router} />
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
