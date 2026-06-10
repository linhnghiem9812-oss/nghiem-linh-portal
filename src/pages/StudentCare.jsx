import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function StudentCare() {
    const [students, setStudents] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [newTicket, setNewTicket] = useState({ studentName: '', details: '' });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentStudent, setCurrentStudent] = useState({ name: '', phone: '', email: '', course: 'HSK1', class: '', status: 'Đang học', birthday: '' });

    useEffect(() => {
        api.get('/students').then(res => setStudents(res.data)).catch(() => console.log('Chưa có học viên trên CSDL.'));
        api.get('/tickets').then(res => setTickets(res.data)).catch(() => console.log('Chưa có ticket trên CSDL.'));
    }, []);

    const filteredStudents = students.filter(s => {
        const matchName = s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchName && matchStatus;
    });

    const openModal = (mode, student = null) => {
        setModalMode(mode);
        setCurrentStudent(student ? { ...student } : { name: '', phone: '', email: '', course: 'HSK1', class: '', status: 'Đang học', birthday: '' });
        setShowModal(true);
    };

    const handleSaveStudent = async () => {
        if (modalMode === 'add') {
            try {
                const res = await api.post('/students', currentStudent);
                setStudents([res.data, ...students]);
                alert('Thêm học viên mới thành công!');
            } catch (error) { alert('Lỗi: CSDL không phản hồi.'); }
        } else if (modalMode === 'edit') {
            try {
                const res = await api.put(`/students/${currentStudent.id}`, currentStudent);
                setStudents(students.map(s => s.id === currentStudent.id ? res.data : s));
                alert('Lưu thay đổi thành công!');
            } catch (error) { alert('Lỗi cập nhật CSDL.'); }
        }
        setShowModal(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xác nhận xóa học viên này khỏi danh sách lớp?')) {
            try {
                await api.delete(`/students/${id}`);
                setStudents(students.filter(s => s.id !== id));
            } catch (error) { alert('Lỗi xóa CSDL.'); }
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/tickets', { ...newTicket, status: 'Đang xử lý' });
            setTickets([res.data, ...tickets]);
            setNewTicket({ studentName: '', details: '' });
            alert('Tạo ticket phản ánh thành công!');
        } catch (error) { alert('Lỗi tạo ticket!'); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="kpi-row">
                <div className="card kpi-card-simple"><div><div className="kpi-card-label">Tổng học viên</div><div className="kpi-card-number">{students.length}</div></div><div className="kpi-card-circle-icon purple"><i className="fa-solid fa-graduation-cap"></i></div></div>
                <div className="card kpi-card-simple"><div><div className="kpi-card-label">Đang học</div><div className="kpi-card-number" style={{ color: 'var(--success)' }}>{students.filter(s => s.status === 'Đang học').length}</div></div><div className="kpi-card-circle-icon success" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}><i className="fa-solid fa-user-check"></i></div></div>
                <div className="card kpi-card-simple"><div><div className="kpi-card-label">Bảo lưu / Học lại</div><div className="kpi-card-number" style={{ color: 'var(--warning-text)' }}>{students.filter(s => s.status !== 'Đang học').length}</div></div><div className="kpi-card-circle-icon warning" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning-text)' }}><i className="fa-solid fa-user-clock"></i></div></div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                    <input type="text" className="form-control" placeholder="🔍 Tìm kiếm tên, SĐT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1 }} />
                    <select className="form-control" style={{ width: '200px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">Tất cả trạng thái</option><option value="Đang học">Đang học</option><option value="Bảo lưu">Bảo lưu</option><option value="Học lại">Học lại</option>
                    </select>
                </div>

                <div style={{ padding: '16px 24px', backgroundColor: '#f0fdf4', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>📚 Danh sách học viên hệ thống <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '50px', fontSize: '0.75rem', marginLeft: '8px' }}>{filteredStudents.length} học viên</span></span>
                    <button className="btn" onClick={() => openModal('add')} style={{ padding: '6px 12px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}><i className="fa-solid fa-plus text-primary"></i> Thêm học viên</button>
                </div>

                <table className="modal-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '16px 24px' }}>STT</th><th style={{ padding: '16px 24px' }}>HỌC VIÊN</th>
                            <th style={{ padding: '16px 24px' }}>SĐT</th><th style={{ padding: '16px 24px' }}>KHÓA HỌC</th>
                            <th style={{ padding: '16px 24px' }}>LỚP</th><th style={{ padding: '16px 24px' }}>TRẠNG THÁI</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center' }}>CHI TIẾT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Chưa có học viên nào trong CSDL.</td></tr>}
                        {filteredStudents.map((s, index) => (
                            <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{index + 1}</td>
                                <td style={{ padding: '16px 24px' }}><strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.9rem' }}>{s.name}</strong><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</span></td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{s.phone}</td>
                                <td style={{ padding: '16px 24px', color: 'var(--primary)', fontWeight: '700' }}>{s.course}</td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.class}</td>
                                <td style={{ padding: '16px 24px' }}><span style={{ backgroundColor: s.status === 'Đang học' ? '#dcfce7' : '#fef3c7', color: s.status === 'Đang học' ? '#166534' : '#b45309', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>{s.status}</span></td>
                                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button title="Sửa" onClick={() => openModal('edit', s)} style={{ background: '#fef08a', border: 'none', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', color: '#854d0e' }}><i className="fa-solid fa-pen"></i></button>
                                        <button title="Xóa" onClick={() => handleDelete(s.id)} style={{ background: '#fecaca', border: 'none', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', color: '#991b1b' }}><i className="fa-solid fa-trash"></i></button>
                                        <button title="Xem" onClick={() => openModal('view', s)} style={{ background: '#bfdbfe', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', color: '#1e40af' }}><i className="fa-solid fa-eye"></i></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="my-portal-grid" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}><i className="fa-solid fa-ticket-alt" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Ticket & Phản ánh (Tạo / Xử lý)</h3>
                    <form onSubmit={handleCreateTicket} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                        <input type="text" className="form-control" placeholder="Tên HV..." value={newTicket.studentName} onChange={e => setNewTicket({ ...newTicket, studentName: e.target.value })} required style={{ width: '30%' }} />
                        <input type="text" className="form-control" placeholder="Nội dung phản ánh..." value={newTicket.details} onChange={e => setNewTicket({ ...newTicket, details: e.target.value })} required style={{ flex: 1 }} />
                        <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: '700' }}>Tạo</button>
                    </form>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {tickets.length === 0 && <span style={{ color: '#cbd5e1' }}>Chưa có ticket trên CSDL.</span>}
                        {tickets.map(t => (
                            <div key={t.id} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}><span>{t.studentName}</span><span style={{ color: 'var(--warning-text)' }}>{t.status}</span></div>
                                <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.85rem' }}>{t.details}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ width: '500px', backgroundColor: 'white', padding: '24px', borderRadius: '12px' }}>
                        <h3 style={{ fontWeight: '800', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                            {modalMode === 'add' ? 'Thêm học viên mới' : modalMode === 'edit' ? 'Chỉnh sửa thông tin học viên' : 'Hồ sơ học viên'}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Họ tên</label><input className="form-control" value={currentStudent.name} onChange={e => setCurrentStudent({ ...currentStudent, name: e.target.value })} disabled={modalMode === 'view'} /></div>
                            <div><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Số điện thoại</label><input className="form-control" value={currentStudent.phone} onChange={e => setCurrentStudent({ ...currentStudent, phone: e.target.value })} disabled={modalMode === 'view'} /></div>
                            <div><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Ngày sinh</label><input type="text" className="form-control" placeholder="DD/MM/YYYY" value={currentStudent.birthday} onChange={e => setCurrentStudent({ ...currentStudent, birthday: e.target.value })} disabled={modalMode === 'view'} /></div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Trạng thái</label>
                                <select className="form-control" value={currentStudent.status} onChange={e => setCurrentStudent({ ...currentStudent, status: e.target.value })} disabled={modalMode === 'view'}>
                                    <option value="Đang học">Đang học</option><option value="Bảo lưu">Bảo lưu</option><option value="Học lại">Học lại</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button className="btn" style={{ padding: '8px 16px', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setShowModal(false)}>Đóng</button>
                            {modalMode !== 'view' && <button className="btn" style={{ padding: '8px 16px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '6px', cursor: 'pointer' }} onClick={handleSaveStudent}>Lưu thông tin</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentCare;