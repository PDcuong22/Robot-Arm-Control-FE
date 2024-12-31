import { Toaster } from 'sonner';
import { RouterProvider } from 'react-router-dom';
import { browserRouter } from './routes/browserRouter';
import { App as AntApp } from 'antd';

function App() {
  return (
    <AntApp>
      <div className="fade-in">
        <RouterProvider router={browserRouter} />
        <Toaster />
      </div>
    </AntApp>
  );
}

export default App;
