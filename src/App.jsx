import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeContext.jsx/ThemeContext";
import router from "./routes/Route/Route";

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
