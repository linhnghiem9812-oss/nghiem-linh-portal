import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function StudentCare() {
    const [students, setStudents] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [classes, setClasses] = useState([]);
    const [newTicket, setNewTicket] = useState({ studentName: '', details: '' });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [isPanelExpanded, setIsPanelExpanded] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        email: false, birthday: false, province: false, country: false, course: true, teacher: true, notes: false
    });

    const optionalColumnsConfig = [
        { key: 'email', label: 'Email cá nhân', icon: 'fa-envelope' },
        { key: 'birthday', label: 'Ngày sinh', icon: 'fa-cake-candles' },
        { key: 'province', label: 'Tỉnh/Thành', icon: 'fa-map-location-dot' },
        { key: 'country', label: 'Quốc gia', icon: 'fa-globe' },
        { key: 'course', label: 'Khóa học', icon: 'fa-book' },
        { key: 'teacher', label: 'Giáo viên', icon: 'fa-chalkboard-user' },
        { key: 'notes', label: 'Ghi chú', icon: 'fa-note-sticky' }
    ];

    const toggleColumn = (columnKey) => setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');

    const [currentStudent, setCurrentStudent] = useState({
        name: '', phone: '', email: '', course: '', classId: '', teacher: '', status: 'Đang học', birthday: '', province: '', country: 'Việt Nam', notes: ''
    });

    useEffect(() => {
        api.get('/students').then(res => setStudents(res.data)).catch(() => console.log('Chưa có học viên trên CSDL.'));
        api.get('/tickets').then(res => {
            const sortedTickets = res.data.sort((a, b) => b.id - a.id);
            setTickets(sortedTickets);
        }).catch(() => console.log('Chưa có ticket trên CSDL.'));
        api.get('/classes').then(res => setClasses(res.data)).catch(() => console.log('Chưa có dữ liệu lớp.'));
    }, []);

    const filteredStudents = students.filter(s => {
        const matchName = s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchName && matchStatus;
    });

    // --- GOM NHÓM LỚP THEO THÁNG DÀNH CHO FORM ---
    const sortedClasses = [...classes].sort((a, b) => {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(b.startDate) - new Date(a.startDate);
    });

    const groupedClassesForForm = sortedClasses.reduce((acc, c) => {
        const dateObj = c.startDate ? new Date(c.startDate) : null;
        const groupName = dateObj && !isNaN(dateObj.getTime()) ? `Tháng ${dateObj.getMonth() + 1} / ${dateObj.getFullYear()}` : 'Lớp chưa xác định ngày KG';
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(c);
        return acc;
    }, {});


    const openModal = (mode, student = null) => {
        setModalMode(mode);
        setCurrentStudent(student ? { ...student } : { name: '', phone: '', email: '', course: '', classId: '', teacher: '', status: 'Đang học', birthday: '', province: '', country: 'Việt Nam', notes: '' });
        setShowModal(true);
    };

    const handleClassChange = (e) => {
        const selectedClassCode = e.target.value;
        const selectedClassObj = classes.find(c => c.classCode === selectedClassCode);

        if (selectedClassObj) {
            setCurrentStudent({
                ...currentStudent,
                classId: selectedClassCode,
                course: selectedClassObj.level || 'Chưa rõ',
                teacher: selectedClassObj.teacher || 'Chưa phân công'
            });
        } else {
            setCurrentStudent({ ...currentStudent, classId: selectedClassCode, course: '', teacher: '' });
        }
    };

    const handleSaveStudent = async () => {
        if (modalMode === 'add') {
            try {
                const res = await api.post('/students', currentStudent);
                setStudents([res.data, ...students]);
                alert('Thêm học viên mới thành công!');
                setShowModal(false);
            } catch (error) { alert('Lỗi: CSDL không phản hồi.'); }
        } else if (modalMode === 'edit') {
            try {
                const res = await api.put(`/students/${currentStudent.id}`, currentStudent);
                setStudents(students.map(s => s.id === currentStudent.id ? res.data : s));
                alert('Lưu thay đổi thành công!');
                setModalMode('view');
            } catch (error) { alert('Lỗi cập nhật CSDL.'); }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Cảnh báo: Bạn có chắc chắn muốn xóa hồ sơ học viên này?')) {
            try {
                await api.delete(`/students/${id}`);
                setStudents(students.filter(s => s.id !== id));
                setShowModal(false);
                alert('Đã xóa học viên thành công!');
            } catch (error) { alert('Lỗi xóa CSDL.'); }
        }
    };

    // --- HÀM XỬ LÝ TICKET KÈM THỜI GIAN ---
    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newTicket,
                status: 'Đang xử lý',
                createdAt: new Date().toISOString()
            };
            const res = await api.post('/tickets', payload);
            setTickets([res.data, ...tickets]);
            setNewTicket({ studentName: '', details: '' });
            alert('Tạo ticket phản ánh thành công!');
        } catch (error) { alert('Lỗi tạo ticket!'); }
    };

    const handleResolveTicket = async (ticket) => {
        try {
            const payload = {
                ...ticket,
                status: 'Đã xử lý',
                resolvedAt: new Date().toISOString()
            };
            const res = await api.put(`/tickets/${ticket.id}`, payload);
            setTickets(tickets.map(t => t.id === ticket.id ? res.data : t));
        } catch (error) {
            alert('Lỗi khi cập nhật trạng thái ticket!');
        }
    };

    // --- HÀM RENDER BADGE MÀU TRẠNG THÁI ---
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Đang học': return { bg: '#dcfce7', color: '#166534' };
            case 'Bảo lưu': return { bg: '#fef3c7', color: '#b45309' };
            case 'Học lại': return { bg: '#e0e7ff', color: '#3730a3' };
            case 'Đổi lớp': return { bg: '#f3e8ff', color: '#7e22ce' };
            case 'Nghỉ học': return { bg: '#fee2e2', color: '#b91c1c' };
            default: return { bg: '#f1f5f9', color: '#475569' };
        }
    };

    const pendingTickets = tickets.filter(t => t.status === 'Đang xử lý');
    const resolvedTickets = tickets.filter(t => t.status === 'Đã xử lý');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="kpi-row">
                <div className="card kpi-card-simple"><div><div className="kpi-card-label">Tổng học viên</div><div className="kpi-card-number">{students.length}</div></div><div className="kpi-card-circle-icon purple"><i className="fa-solid fa-graduation-cap"></i></div></div>
                <div className="card kpi-card-simple"><div><div className="kpi-card-label">Đang học</div><div className="kpi-card-number" style={{ color: 'var(--success)' }}>{students.filter(s => s.status === 'Đang học').length}</div></div><div className="kpi-card-circle-icon success" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}><i className="fa-solid fa-user-check"></i></div></div>
                <div className="card kpi-card-simple"><div><div className="kpi-card-label">Có vấn đề (Nghỉ/Bảo lưu)</div><div className="kpi-card-number" style={{ color: 'var(--danger-text)' }}>{students.filter(s => s.status === 'Nghỉ học' || s.status === 'Bảo lưu').length}</div></div><div className="kpi-card-circle-icon danger" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger-text)' }}><i className="fa-solid fa-triangle-exclamation"></i></div></div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <div style={{ position: 'sticky', top: '0', zIndex: '20', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button type="button" onClick={() => setIsPanelExpanded(!isPanelExpanded)} style={{ background: isPanelExpanded ? 'var(--primary)' : '#ffffff', color: isPanelExpanded ? 'white' : 'var(--primary)', border: '1px solid var(--primary)', padding: '6px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className={`fa-solid ${isPanelExpanded ? 'fa-cog' : 'fa-list-ul'}`}></i>
                            <span>{isPanelExpanded ? 'Đóng bảng chọn' : 'Tùy chỉnh cột'}</span>
                        </button>
                        <button className="btn" onClick={() => openModal('add')} style={{ padding: '8px 16px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}>
                            <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Thêm học viên
                        </button>
                    </div>
                    {isPanelExpanded && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                            {optionalColumnsConfig.map(col => (
                                <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: visibleColumns[col.key] ? '#eef2ff' : '#f8fafc', border: visibleColumns[col.key] ? '1px solid var(--primary)' : '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', color: visibleColumns[col.key] ? 'var(--primary)' : '#475569' }}>
                                    <input type="checkbox" checked={visibleColumns[col.key]} onChange={() => toggleColumn(col.key)} />
                                    <i className={`fa-solid ${col.icon}`}></i> {col.label}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}><i className="fa-solid fa-graduation-cap" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> Danh sách Học viên đang quản lý</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <select className="form-control" style={{ width: '160px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">Tất cả trạng thái</option>
                            <option value="Đang học">Đang học</option>
                            <option value="Bảo lưu">Bảo lưu</option>
                            <option value="Học lại">Học lại</option>
                            <option value="Đổi lớp">Đổi lớp</option>
                            <option value="Nghỉ học">Nghỉ học</option>
                        </select>
                        <input type="text" className="form-control" placeholder="🔍 Tìm kiếm tên, SĐT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '250px' }} />
                    </div>
                </div>

                <div className="modal-table-container" style={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <table className="modal-table" style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap', tableLayout: 'auto' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-app)', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '12px' }}>STT</th>
                                <th style={{ padding: '12px' }}>HỌ TÊN</th>
                                <th style={{ padding: '12px' }}>SĐT (ZALO)</th>
                                {visibleColumns.email && <th style={{ padding: '12px' }}>EMAIL</th>}
                                {visibleColumns.birthday && <th style={{ padding: '12px' }}>NGÀY SINH</th>}
                                {visibleColumns.province && <th style={{ padding: '12px' }}>TỈNH/THÀNH</th>}
                                {visibleColumns.country && <th style={{ padding: '12px' }}>QUỐC GIA</th>}
                                <th style={{ padding: '12px' }}>MÃ LỚP</th>
                                {visibleColumns.course && <th style={{ padding: '12px' }}>KHÓA HỌC</th>}
                                {visibleColumns.teacher && <th style={{ padding: '12px' }}>GIÁO VIÊN</th>}
                                {visibleColumns.notes && <th style={{ padding: '12px' }}>GHI CHÚ</th>}
                                <th style={{ padding: '12px' }}>TRẠNG THÁI</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '0.85rem' }}>
                            {filteredStudents.length === 0 && <tr><td colSpan="12" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Chưa có học viên nào trong CSDL.</td></tr>}
                            {filteredStudents.map((s, index) => {
                                const badgeStyle = getStatusBadge(s.status);
                                return (
                                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'white' }}>
                                        <td style={{ padding: '14px 12px', fontWeight: '700' }}>{index + 1}</td>
                                        <td style={{ padding: '14px 12px' }}>
                                            <span style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: '800', cursor: 'pointer' }} onClick={() => openModal('view', s)}>
                                                {s.name || '---'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 12px' }}>{s.phone || '---'}</td>
                                        {visibleColumns.email && <td style={{ padding: '14px 12px' }}>{s.email || '---'}</td>}
                                        {visibleColumns.birthday && <td style={{ padding: '14px 12px' }}>{s.birthday ? new Date(s.birthday).toLocaleDateString('vi-VN') : '---'}</td>}
                                        {visibleColumns.province && <td style={{ padding: '14px 12px' }}>{s.province || '---'}</td>}
                                        {visibleColumns.country && <td style={{ padding: '14px 12px' }}>{s.country || '---'}</td>}
                                        <td style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--primary)' }}>{s.classId || s.class || '---'}</td>
                                        {visibleColumns.course && <td style={{ padding: '14px 12px' }}>{s.course || '---'}</td>}
                                        {visibleColumns.teacher && <td style={{ padding: '14px 12px' }}>{s.teacher || '---'}</td>}
                                        {visibleColumns.notes && <td style={{ padding: '14px 12px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={s.notes}>{s.notes || '---'}</td>}
                                        <td style={{ padding: '14px 12px' }}>
                                            <span className="badge-studying" style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color, fontWeight: '800', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem' }}>{s.status}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="my-portal-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}><i className="fa-solid fa-ticket-alt" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> Tạo Phản ánh Mới</h3>
                    <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input type="text" className="form-control" placeholder="Tên HV..." value={newTicket.studentName} onChange={e => setNewTicket({ ...newTicket, studentName: e.target.value })} required />
                        <textarea className="form-control" placeholder="Nội dung phản ánh hoặc yêu cầu hỗ trợ..." rows="3" value={newTicket.details} onChange={e => setNewTicket({ ...newTicket, details: e.target.value })} required style={{ resize: 'none' }}></textarea>
                        <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: '700' }}>Tạo Ticket</button>
                    </form>

                    <div style={{ marginTop: '24px' }}>
                        <h4 style={{ fontSize: '0.9rem', color: '#b91c1c', marginBottom: '12px', fontWeight: '800', borderBottom: '1px solid #fee2e2', paddingBottom: '8px' }}>YÊU CẦU ĐANG XỬ LÝ ({pendingTickets.length})</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                            {pendingTickets.length === 0 && <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Không có yêu cầu nào đang chờ xử lý.</span>}
                            {pendingTickets.map(t => (
                                <div key={t.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--primary)', backgroundColor: 'var(--primary-light)', borderLeft: '4px solid var(--primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: '800', color: 'var(--primary)' }}>{t.studentName}</span>
                                        <button onClick={() => handleResolveTicket(t)} className="btn" style={{ fontSize: '0.7rem', padding: '4px 8px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Đánh dấu Đã xử lý ✔</button>
                                    </div>
                                    <p style={{ color: 'var(--text-main)', fontSize: '0.85rem', marginBottom: '8px' }}>{t.details}</p>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        Tạo lúc: {t.createdAt ? new Date(t.createdAt).toLocaleString('vi-VN') : 'Không rõ'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px', backgroundColor: '#f8fafc' }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#166534', marginBottom: '16px', fontWeight: '800', borderBottom: '1px solid #dcfce7', paddingBottom: '8px' }}><i className="fa-solid fa-check-circle"></i> ĐÃ XỬ LÝ XONG ({resolvedTickets.length})</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                        {resolvedTickets.length === 0 && <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Chưa có yêu cầu nào hoàn thành.</span>}
                        {resolvedTickets.map(t => (
                            <div key={t.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'white', opacity: 0.8 }}>
                                <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>{t.studentName}</div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>{t.details}</p>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span>Tạo lúc: {t.createdAt ? new Date(t.createdAt).toLocaleString('vi-VN') : 'Không rõ'}</span>
                                    <span><i className="fa-solid fa-check" style={{ color: '#166534' }}></i> Xử lý xong: {t.resolvedAt ? new Date(t.resolvedAt).toLocaleString('vi-VN') : 'Không rõ'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ width: '680px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                            <h3 style={{ fontWeight: '800', color: 'var(--text-main)' }}>
                                <i className="fa-solid fa-user-graduate" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
                                {modalMode === 'add' ? "Tiếp nhận học viên mới" : modalMode === 'edit' ? "Chỉnh sửa hồ sơ học viên" : "Hồ sơ học viên chi tiết"}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✖</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Họ và tên học viên</label>
                                {modalMode !== 'view' ? <input className="form-control" value={currentStudent.name || ''} onChange={e => setCurrentStudent({ ...currentStudent, name: e.target.value })} /> : <div style={{ fontWeight: '800', padding: '8px 0', fontSize: '1.1rem' }}>{currentStudent.name || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Số điện thoại</label>
                                {modalMode !== 'view' ? <input className="form-control" value={currentStudent.phone || ''} onChange={e => setCurrentStudent({ ...currentStudent, phone: e.target.value })} /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{currentStudent.phone || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ngày sinh</label>
                                {modalMode !== 'view' ? <input type="date" className="form-control" value={currentStudent.birthday || ''} onChange={e => setCurrentStudent({ ...currentStudent, birthday: e.target.value })} /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{currentStudent.birthday ? new Date(currentStudent.birthday).toLocaleDateString('vi-VN') : '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Email cá nhân</label>
                                {modalMode !== 'view' ? <input type="email" className="form-control" value={currentStudent.email || ''} onChange={e => setCurrentStudent({ ...currentStudent, email: e.target.value })} /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{currentStudent.email || '---'}</div>}
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Tỉnh / Thành phố</label>
                                {modalMode !== 'view' ? <input className="form-control" value={currentStudent.province || ''} onChange={e => setCurrentStudent({ ...currentStudent, province: e.target.value })} placeholder="VD: Hà Nội..." /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{currentStudent.province || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Quốc gia</label>
                                {modalMode !== 'view' ? <input className="form-control" value={currentStudent.country || ''} onChange={e => setCurrentStudent({ ...currentStudent, country: e.target.value })} /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{currentStudent.country || '---'}</div>}
                            </div>

                            <div style={{ gridColumn: 'span 2', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)' }}>Xếp vào Lớp học</label>
                                    {modalMode !== 'view' ? (
                                        <select className="form-control" value={currentStudent.classId || ''} onChange={handleClassChange} style={{ border: '1px solid var(--primary)', backgroundColor: 'var(--primary-light)' }}>
                                            <option value="">-- Chọn lớp học --</option>
                                            {/* SỬ DỤNG OPTGROUP THEO THÁNG */}
                                            {Object.keys(groupedClassesForForm).map(monthLabel => (
                                                <optgroup key={monthLabel} label={`--- ${monthLabel} ---`} style={{ color: 'var(--primary)' }}>
                                                    {groupedClassesForForm[monthLabel].map(c => (
                                                        <option key={c.id} value={c.classCode} style={{ color: 'var(--text-main)' }}>
                                                            {c.classCode} - Khóa: {c.level}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    ) : <div style={{ fontWeight: '800', padding: '8px 0', color: 'var(--primary)', fontSize: '1.1rem' }}>{currentStudent.classId || 'Chưa xếp lớp'}</div>}
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Trạng thái học tập</label>
                                    {modalMode !== 'view' ? (
                                        <select className="form-control" value={currentStudent.status || 'Đang học'} onChange={e => setCurrentStudent({ ...currentStudent, status: e.target.value })}>
                                            <option value="Đang học">Đang học</option>
                                            <option value="Bảo lưu">Bảo lưu</option>
                                            <option value="Học lại">Học lại</option>
                                            <option value="Đổi lớp">Đổi lớp</option>
                                            <option value="Nghỉ học">Nghỉ học</option>
                                        </select>
                                    ) : <div style={{ fontWeight: '700', padding: '8px 0' }}><span style={{ backgroundColor: getStatusBadge(currentStudent.status).bg, color: getStatusBadge(currentStudent.status).color, padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem' }}>{currentStudent.status || '---'}</span></div>}
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Khóa học / Trình độ</label>
                                    {modalMode !== 'view' ? <input className="form-control" value={currentStudent.course || ''} disabled style={{ backgroundColor: '#e2e8f0', cursor: 'not-allowed' }} placeholder="Tự động hiển thị..." /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{currentStudent.course || '---'}</div>}
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Giáo viên phụ trách</label>
                                    {modalMode !== 'view' ? <input className="form-control" value={currentStudent.teacher || ''} disabled style={{ backgroundColor: '#e2e8f0', cursor: 'not-allowed' }} placeholder="Tự động hiển thị..." /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{currentStudent.teacher || '---'}</div>}
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ghi chú / Yêu cầu thêm</label>
                                {modalMode !== 'view' ? (
                                    <textarea className="form-control" rows="2" value={currentStudent.notes || ''} onChange={e => setCurrentStudent({ ...currentStudent, notes: e.target.value })} style={{ resize: 'vertical' }} placeholder="Nội dung cần lưu ý..." />
                                ) : (
                                    <div style={{ fontWeight: '600', padding: '8px 0', whiteSpace: 'pre-wrap' }}>{currentStudent.notes || 'Không có ghi chú'}</div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                            {modalMode !== 'add' ? (
                                <button className="btn" style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }} onClick={() => handleDelete(currentStudent.id)}><i className="fa-solid fa-trash"></i> Xóa hồ sơ</button>
                            ) : <div></div>}

                            <div style={{ display: 'flex', gap: '12px' }}>
                                {modalMode === 'view' ? (
                                    <button className="btn" style={{ padding: '10px 20px', backgroundColor: 'var(--warning)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }} onClick={() => setModalMode('edit')}><i className="fa-solid fa-pen"></i> Sửa thông tin</button>
                                ) : (
                                    <button className="btn" style={{ padding: '10px 20px', backgroundColor: 'var(--success)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }} onClick={handleSaveStudent}><i className="fa-solid fa-floppy-disk"></i> Lưu hồ sơ</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentCare;
