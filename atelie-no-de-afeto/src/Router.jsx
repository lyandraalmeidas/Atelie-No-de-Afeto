import { creaBrowserRouter } from 'react-router-dom';

import App from './App';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import path from 'node:path';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path  : "/home",
    element: <Home />,
  },
  {
    path: "/produtos",
    element: <Produtos />,
  },
  {
    path: "/carrinho",
    element: <Carrinho />,
  },
  {
    path: "/admin", 
    element: <AdminPage />,
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