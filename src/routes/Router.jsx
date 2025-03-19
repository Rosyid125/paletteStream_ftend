// src/routes/Router.jsx
import { createBrowserRouter } from "react-router-dom";
import AuthRoutes from "./AuthRoutes";
import MainRoutes from "./MainRoutes";

const router = createBrowserRouter([...AuthRoutes, ...MainRoutes]);

export default router;
