import { creaBrowserRouter } from 'react-router-dom';

import App from './App';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/cadastro",
    element: <Cadastro />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

export default router;