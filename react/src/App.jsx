import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import "./styles/App.css";

/** import components */
import Setting from './screens/Setting';


/** react routes */
const router = createBrowserRouter([
    {
      path: '/',
      element: <Setting />,
    },
  ]);

  function App() {
    return (
      <>
        <RouterProvider router={router} />
      </>
    );
  }

  export default App;