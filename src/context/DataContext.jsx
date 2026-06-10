import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
    });

    // CÁC STATE LƯU TRỮ DỮ LIỆU TỪ BACKEND
    const [classes, setClasses] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [teachers, setTeachers] = useState([]);

    // TẢI TOÀN BỘ DỮ LIỆU THẬT KHI MỞ TRANG
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Tải song song 3 luồng dữ liệu để tăng tốc độ
                const [clsRes, cusRes, tchRes] = await Promise.all([
                    api.get('/classes'),
                    api.get('/customers'),
                    api.get('/users/teachers') // Lấy danh sách nhân sự có role = 'teacher'
                ]);
                setClasses(clsRes.data);
                setCustomers(cusRes.data);
                setTeachers(tchRes.data);
            } catch (error) {
                console.error("Lỗi kết nối CSDL Backend: ", error);
            }
        };
        fetchAllData();
    }, []);

    // CÁC HÀM TƯƠNG TÁC XUỐNG DATABASE
    const addClass = async (newClass) => {
        try {
            const res = await api.post('/classes', newClass);
            setClasses(prev => [res.data, ...prev]);
            return { success: true };
        } catch (e) { alert('Lỗi tạo lớp!'); return { success: false }; }
    };

    const addCustomer = async (newCustomer) => {
        try {
            const res = await api.post('/customers', newCustomer);
            setCustomers(prev => [res.data, ...prev]);
        } catch (e) { alert('Lỗi tạo khách hàng!'); }
    };

    const addTeacher = async (newTeacher) => {
        try {
            // Thực chất là đăng ký 1 user có role = teacher
            const res = await api.post('/auth/register', { ...newTeacher, role: 'teacher', username: newTeacher.phone, password: '123' });
            setTeachers(prev => [res.data, ...prev]);
        } catch (e) { alert('Lỗi tạo giáo viên!'); }
    };

    return (
        <DataContext.Provider value={{
            classes, addClass,
            customers, addCustomer,
            teachers, addTeacher
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
