import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext.jsx/ThemeContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import router from "./routes/Route/Route";
import Cookies from "js-cookie";

function App() {
  // Ambil cookie yang disimpan untuk menentukan apakah sidebar terbuka atau tidak
  const theme = Cookies.get("sidebar_state") === "true";

  return (
    <div className="App">
      <ThemeProvider>
        <SidebarProvider defaultOpen={theme}>
          <RouterProvider router={router} />
        </SidebarProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
