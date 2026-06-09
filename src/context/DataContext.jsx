import React, { createContext, useState, useEffect, useContext } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    // Hàm bổ trợ đọc dữ liệu an toàn từ LocalStorage tránh mất mát dữ liệu
    const getStoredData = (key, initialData) => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : initialData;
    };

    // 1. Quản lý danh sách Khách hàng (CRM)
    const [customers, setCustomers] = useState(() => getStoredData('nl_customers', [
        { id: 1, date: '7/5/2026', name: 'Trần Thị Minh Anh', phone: '0977284534', course: 'HSK 2', type: 'Lớp Nhóm', level: 'Mới bắt đầu', potential: 'Cao', status: 'Đã ĐK' }
    ]));

    // 2. Quản lý danh sách Lớp học
    const [classes, setClasses] = useState(() => getStoredData('nl_classes', [
        { id: 'HSK1-357-6', name: 'HSK1-357-6', teacher: 'Đoàn Đăng Khoa', progress: 18, totalSessions: 19, schedule: '20:00 - 21:30' }
    ]));

    // 3. Quản lý danh sách Giáo viên
    const [teachers, setTeachers] = useState(() => getStoredData('nl_teachers', [
        { id: 1, name: 'Đoàn Đăng Khoa', email: 'khoadoan@nghiemlinh.edu.vn', phone: '0988123456', status: 'Đang dạy', experience: 'Thạc sĩ Ngôn ngữ - 5 năm kinh nghiệm', salary: 350000 }
    ]));

    // 4. Quản lý trạng thái điểm danh lớp học (Giữ cố định không bị reset khi chuyển màn hình)
    const [attendance, setAttendance] = useState(() => getStoredData('nl_attendance', [
        { id: 'STU-01', name: 'Cao Ngọc Diệp', status: 'present', flag: false },
        { id: 'STU-02', name: 'Đỗ Hà Linh', status: 'present', flag: false },
        { id: 'STU-03', name: 'Nguyễn Minh Hải', status: 'absent', flag: true }
    ]));

    // Tự động đồng bộ hóa lưu vào LocalStorage mỗi khi dữ liệu có biến động
    useEffect(() => { localStorage.setItem('nl_customers', JSON.stringify(customers)); }, [customers]);
    useEffect(() => { localStorage.setItem('nl_classes', JSON.stringify(classes)); }, [classes]);
    useEffect(() => { localStorage.setItem('nl_teachers', JSON.stringify(teachers)); }, [teachers]);
    useEffect(() => { localStorage.setItem('nl_attendance', JSON.stringify(attendance)); }, [attendance]);

    const addCustomer = (newCustomer) => setCustomers(prev => [newCustomer, ...prev]);
    const addClass = (newClass) => setClasses(prev => [newClass, ...prev]);
    const addTeacher = (newTeacher) => setTeachers(prev => [...prev, newTeacher]);
    const updateAttendance = (newAttendance) => setAttendance(newAttendance);

    return (
        <DataContext.Provider value={{
            customers, addCustomer,
            classes, addClass,
            teachers, addTeacher,
            attendance, updateAttendance
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);