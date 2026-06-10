import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function CourseSyllabus() {
    const { addCourse } = useData();
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newCourseData, setNewCourseData] = useState({ name: '', duration: '', price: '' });

    // Đồng bộ trực tiếp danh sách chương trình đào tạo từ PostgreSQL
    useEffect(() => {
        api.get('/courses')
            .then(res => setCourses(res.data))
            .catch(() => {
                // Dự phòng bản ghi mẫu chuẩn của trung tâm nếu bảng trống
                setCourses([{ id: 'DEFAULT-1', name: 'HSK 1 Tiêu chuẩn', duration: 19, price: 3500000 }]);
            });
    }, []);

    const handleAddCourseSubmit = async (e) => {
        e.preventDefault();
        if (!newCourseData.name || !newCourseData.duration || !newCourseData.price) {
            alert('Vui lòng hoàn tất biểu mẫu thông tin khóa học!');
            return;
        }

        const newObj = {
            name: newCourseData.name,
            duration: parseInt(newCourseData.duration),
            price: parseInt(newCourseData.price)
        };

        try {
            const res = await api.post('/courses', newObj);
            setCourses(prev => [...prev, res.data]);
            if (addCourse) addCourse(res.data);
            alert(`Hệ thống: Bổ sung chương trình đào tạo thành công: ${newCourseData.name}`);
            setNewCourseData({ name: '', duration: '', price: '' });
            setShowModal(false);
        } catch (err) {
            alert('Có lỗi xảy ra khi lưu khóa học vào CSDL.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Chương trình học & Syllabus đào tạo</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Khung giáo án giảng dạy tiêu chuẩn tại Ngoại ngữ Nghiêm Linh</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ padding: '10px 20px', fontWeight: '700', borderRadius: '8px', background: 'var(--primary)', color: 'white', cursor: 'pointer' }}>
                    <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Thêm Khóa Học
                </button>
            </div>

            <div className="curriculum-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginTop: '12px' }}>
                {courses.map(course => (
                    <div className="card" key={course.id}>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '10px' }}>{course.name}</h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span><i className="fa-solid fa-calendar" style={{ marginRight: '8px' }}></i> Thời lượng: <strong>{course.duration} buổi</strong></span>
                            <span><i className="fa-solid fa-sack-dollar" style={{ marginRight: '8px' }}></i> Học phí: <strong style={{ color: 'var(--primary)' }}>{course.price?.toLocaleString('vi-VN')} VND</strong></span>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content" style={{ background: 'white', borderRadius: '18px', padding: '24px', width: '90%', maxWidth: '500px', margin: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px' }}>
                            <h3 style={{ fontWeight: '800' }}>Thêm Khóa Học Mới</h3>
                            <div style={{ fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowModal(false)}>&times;</div>
                        </div>
                        <form onSubmit={handleAddCourseSubmit}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Tên khóa học chính thức</label>
                                <input type="text" className="form-control" value={newCourseData.name} onChange={(e) => setNewCourseData({ ...newCourseData, name: e.target.value })} placeholder="Ví dụ: HSK 2 Cấp tốc" required />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Tổng số buổi học</label>
                                <input type="number" className="form-control" value={newCourseData.duration} onChange={(e) => setNewCourseData({ ...newCourseData, duration: e.target.value })} placeholder="19" required />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Mức học phí trọn gói (VND)</label>
                                <input type="number" className="form-control" value={newCourseData.price} onChange={(e) => setNewCourseData({ ...newCourseData, price: e.target.value })} placeholder="3500000" required />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>Hủy</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', background: 'var(--primary)', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>Thêm khóa học</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseSyllabus;