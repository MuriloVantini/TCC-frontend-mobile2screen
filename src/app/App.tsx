import { RouterProvider } from "react-router";
import { router } from "./routes";
import { UserContextProvider } from "./contexts/UserContextProvider";

export default function App() {
  return (
    <UserContextProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <RouterProvider router={router} />
      </div>
    </UserContextProvider>
  );
}
