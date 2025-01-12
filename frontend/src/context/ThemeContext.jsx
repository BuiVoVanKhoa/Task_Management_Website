import { createContext, useContext, useState, useEffect } from 'react';

// Tạo context cho việc quản lý theme
const ThemeContext = createContext();

export const useTheme = () => {
    return useContext(ThemeContext);
};

// Provider component để quản lý trạng thái theme
export const ThemeProvider = ({ children }) => {
    // State quản lý chế độ tối, khởi tạo từ localStorage hoặc mặc định là false
    const [darkMode, setDarkMode] = useState(() => {
        // Lấy giá trị từ localStorage hoặc mặc định là false
        const savedTheme = localStorage.getItem('darkMode');
        return savedTheme ? JSON.parse(savedTheme) : false;
    });

    // Effect để cập nhật localStorage và class khi theme thay đổi
    useEffect(() => {
        // Lưu theme vào localStorage khi thay đổi
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        // Cập nhật class cho document.documentElement
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Hàm chuyển đổi giữa chế độ sáng và tối
    const toggleTheme = () => {
        setDarkMode(prev => !prev);
    };

    // Cung cấp giá trị theme và hàm toggle cho các component con
    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
