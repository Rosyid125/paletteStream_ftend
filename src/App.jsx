import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./theme/theme-context";
import router from "./route/Route";

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </div>
  );
}

export default App;
