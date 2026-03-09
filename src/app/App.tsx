import { RouterProvider } from "react-router";
import { router } from "./routes";
import { UserContextProvider } from "./contexts/UserContextProvider";

export default function App() {
  return (
    <UserContextProvider>
      <RouterProvider router={router} />
    </UserContextProvider>
  );
}
