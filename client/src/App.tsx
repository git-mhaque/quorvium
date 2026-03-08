import { Navigate, Route, Routes } from 'react-router-dom';

import { BoardPage } from './routes/BoardPage';
import { HomePage } from './routes/HomePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/boards/:boardId" element={<BoardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
