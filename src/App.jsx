import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { useAuth } from './context/AuthContext'; // Gọi Hook phân quyền

// Import tất cả các trang nội dung
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import SalesRating from './pages/SalesRating';
import StudentCare from './pages/StudentCare';
import TeacherProfile from './pages/TeacherProfile';
import Classes from './pages/Classes';
import CourseSyllabus from './pages/CourseSyllabus';
import FinanceLog from './pages/FinanceLog';
import MyClassActive from './pages/MyClassActive';
import './styles/globals.css';

function App() {
    const { currentRole } = useAuth(); // Lấy vai trò đồng bộ từ Context toàn cục
    const [activeTab, setActiveTab] = useState('my-class');
    const [theme, setTheme] = useState('light');

    const toggleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
    };

    return (
        <div className="app-container">
            {/* Sidebar giờ đây sẽ tự động đồng bộ theo AuthContext */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentRole={currentRole} />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '260px' }}>
                <Topbar
                    theme={theme}
                    toggleTheme={toggleTheme}
                    activeTab={activeTab}
                />

                <main className="main-content" style={{ marginTop: '80px', padding: '32px' }}>
                    {activeTab === 'my-class' && <MyClassActive />}
                    {activeTab === 'crm' && currentRole !== 'teacher' && <CRM />}
                    {activeTab === 'sales' && currentRole !== 'teacher' && <SalesRating />}
                    {activeTab === 'care' && currentRole !== 'teacher' && <StudentCare />}
                    {activeTab === 'teachers' && currentRole !== 'teacher' && <TeacherProfile />}
                    {activeTab === 'classes' && currentRole !== 'teacher' && <Classes />}
                    {activeTab === 'curriculum' && currentRole !== 'teacher' && <CourseSyllabus />}
                    {activeTab === 'finance' && currentRole !== 'teacher' && <FinanceLog />}
                </main>
            </div>
        </div>
    );
}

export default App;