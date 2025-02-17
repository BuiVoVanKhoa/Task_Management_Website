import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App.jsx';
import './index.css';
import { AuthContextProvider } from './context/AuthContext';

// Khởi tạo ứng dụng React và render vào element có id 'root'
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode giúp phát hiện các vấn đề tiềm ẩn trong ứng dụng
  <React.StrictMode>
    {/* Provider cung cấp Redux store cho toàn bộ ứng dụng */}
    <Provider store={store}>
      {/* AuthContextProvider quản lý trạng thái đăng nhập của người dùng */}
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </Provider>
  </React.StrictMode>
);
