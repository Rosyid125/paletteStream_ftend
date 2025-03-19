import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import router from "./routes/Router";
import Cookies from "js-cookie";

function App() {
  // Ambil cookie yang disimpan untuk menentukan apakah sidebar terbuka atau tidak
  const theme = Cookies.get("sidebar_state") === "true";

  return (
    <ThemeProvider>
      <SidebarProvider defaultOpen={theme}>
        <RouterProvider router={router} />
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
