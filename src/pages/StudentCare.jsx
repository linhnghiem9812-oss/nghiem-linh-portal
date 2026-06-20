import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function StudentCare() {
    const [students, setStudents] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [classes, setClasses] = useState([]); 
    
    const [newTicket, setNewTicket] = useState({ studentName: '', details: '', priority: 'Tạo mới' });
    const [editingTicket, setEditingTicket] = useState(null);

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
            const sortedTickets = res.data.sort((a,b) => b.id - a.id);
            setTickets(sortedTickets);
        }).catch(() => console.log('Chưa có ticket trên CSDL.'));
        api.get('/classes').then(res => setClasses(res.data)).catch(() => console.log('Chưa có dữ liệu lớp.'));
    }, []);

    const filteredStudents = students.filter(s => {
        const matchName = s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchName && matchStatus;
    });

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
            setNewTicket({ studentName: '', details: '', priority: 'Tạo mới' });
            alert('Hệ thống: Tạo phản ánh thành công!');
        } catch (error) { alert('Lỗi tạo phản ánh!'); }
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
        } catch (error) { alert('Lỗi cập nhật trạng thái phản ánh!'); }
    };

    const handleReopenTicket = async (ticket) => {
        try {
            const payload = {
                ...ticket,
                status: 'Đang xử lý',
                priority: 'Xem xét lại', 
                resolvedAt: null
            };
            const res = await api.put(`/tickets/${ticket.id}`, payload);
            setTickets(tickets.map(t => t.id === ticket.id ? res.data : t));
        } catch (error) { alert('Lỗi khi mở lại phản ánh!'); }
    };

    const handleDeleteTicket = async (id) => {
        if(window.confirm('Hành động này sẽ xóa vĩnh viễn dữ liệu phản ánh. Xác nhận xóa?')) {
            try {
                await api.delete(`/tickets/${id}`);
                setTickets(tickets.filter(t => t.id !== id));
            } catch (error) { alert('Lỗi khi xóa phản ánh!'); }
        }
    };

    const handleSaveEditTicket = async () => {
        try {
            const res = await api.put(`/tickets/${editingTicket.id}`, editingTicket);
            setTickets(tickets.map(t => t.id === editingTicket.id ? res.data : t));
            setEditingTicket(null);
            alert('Cập nhật thông tin phản ánh thành công!');
        } catch (error) { alert('Lỗi khi cập nhật phản ánh!'); }
    };

    const parseToLocalDatetime = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return '';
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16);
    };

    const handleDatetimeChange = (e) => {
        const local = e.target.value;
        if(local) {
            const iso = new Date(local).toISOString();
            setEditingTicket({ ...editingTicket, createdAt: iso });
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
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

            {/* KHU VỰC PHẢN ÁNH CỦA HỌC VIÊN */}
            <div className="card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: '800', color: '#1e3a8a', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <i className="fa-solid fa-ticket-alt" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
                    Phản ánh & Yêu cầu từ Học viên
                </h3>

                <div style={{ marginBottom: '32px', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>1. Tạo Phản ánh / Yêu cầu mới</h4>
                    <form onSubmit={handleCreateTicket} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <input type="text" className="form-control" placeholder="Tên học viên gửi yêu cầu..." value={newTicket.studentName} onChange={e => setNewTicket({ ...newTicket, studentName: e.target.value })} required style={{ marginBottom: '12px', backgroundColor: 'white' }} />
                            <textarea className="form-control" placeholder="Mô tả chi tiết nội dung phản ánh..." rows="2" value={newTicket.details} onChange={e => setNewTicket({ ...newTicket, details: e.target.value })} required style={{ resize: 'none', backgroundColor: 'white' }}></textarea>
                        </div>
                        <div style={{ width: '180px' }}>
                            <select className="form-control" value={newTicket.priority} onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })} style={{ marginBottom: '12px', backgroundColor: 'white' }}>
                                <option value="Tạo mới">Tạo mới</option>
                                <option value="Xem xét lại">Xem xét lại</option>
                                <option value="Gấp">Cần xử lý Gấp</option>
                            </select>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: '800' }}>
                                <i className="fa-solid fa-paper-plane" style={{ marginRight: '6px' }}></i> Gửi Yêu Cầu
                            </button>
                        </div>
                    </form>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    
                    {/* BẢNG ĐANG XỬ LÝ (MÀU VÀNG/CAM THEME) */}
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '2px solid #fef3c7' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px dashed #fcd34d', paddingBottom: '12px' }}>
                            <h4 style={{ fontSize: '1rem', color: '#b45309', fontWeight: '800', margin: 0 }}>
                                <i className="fa-solid fa-spinner fa-spin-pulse" style={{ marginRight: '8px' }}></i> 2. Đang Xử Lý
                            </h4>
                            <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '2px 10px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800' }}>{pendingTickets.length}</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '550px', overflowY: 'auto', paddingRight: '6px' }}>
                            {pendingTickets.length === 0 && <span style={{ color: '#cbd5e1', fontSize: '0.85rem', textAlign: 'center', marginTop: '20px' }}>Không có yêu cầu nào đang chờ.</span>}
                            {pendingTickets.map(t => (
                                <div key={t.id} style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderLeft: '5px solid #f59e0b', boxShadow: 'var(--shadow-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div>
                                            <span style={{ fontWeight: '800', color: '#92400e', display: 'block', fontSize: '1.05rem', marginBottom: '4px' }}>{t.studentName}</span>
                                            <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '4px', fontWeight: '800', backgroundColor: (t.priority === 'Xem xét lại' || t.priority === 'Gấp') ? '#ef4444' : '#3b82f6', color: 'white' }}>
                                                {t.priority || 'Tạo mới'}
                                            </span>
                                        </div>
                                        <button onClick={() => handleResolveTicket(t)} className="btn" style={{ fontSize: '0.75rem', padding: '6px 12px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', border: 'none', boxShadow: '0 2px 4px rgba(79,70,229,0.3)' }}>
                                            <i className="fa-solid fa-check"></i> Đã xử lý xong
                                        </button>
                                    </div>
                                    <p style={{ color: '#78350f', fontSize: '0.85rem', marginBottom: '16px', lineHeight: '1.5' }}>{t.details}</p>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #fcd34d', paddingTop: '12px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: '600' }}><i className="fa-regular fa-clock"></i> Tạo: {t.createdAt ? new Date(t.createdAt).toLocaleString('vi-VN') : 'Không rõ'}</span>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button onClick={() => setEditingTicket(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e40af', fontSize: '0.8rem', fontWeight: '700' }}><i className="fa-solid fa-pen"></i> Sửa</button>
                                            <button onClick={() => handleDeleteTicket(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.8rem', fontWeight: '700' }}><i className="fa-solid fa-trash"></i> Xóa</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BẢNG ĐÃ XỬ LÝ (MÀU BLUE/PRIMARY THEME) */}
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '2px solid var(--primary-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px dashed var(--primary-light)', paddingBottom: '12px' }}>
                            <h4 style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: '800', margin: 0 }}>
                                <i className="fa-solid fa-check-circle" style={{ marginRight: '8px' }}></i> 3. Đã Xử Lý Xong
                            </h4>
                            <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '2px 10px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '800' }}>{resolvedTickets.length}</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '550px', overflowY: 'auto', paddingRight: '6px' }}>
                            {resolvedTickets.length === 0 && <span style={{ color: '#cbd5e1', fontSize: '0.85rem', textAlign: 'center', marginTop: '20px' }}>Chưa có yêu cầu nào hoàn thành.</span>}
                            {resolvedTickets.map(t => (
                                <div key={t.id} style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: '#f8fafc', opacity: 0.9 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.05rem' }}>{t.studentName}</span>
                                        <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', backgroundColor: '#e2e8f0', color: '#475569' }}>
                                            {t.priority || 'Tạo mới'}
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-main)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: '1.5' }}>{t.details}</p>
                                    
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', backgroundColor: 'white', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                        <span><i className="fa-regular fa-clock" style={{ width: '16px' }}></i> Gửi lúc: {t.createdAt ? new Date(t.createdAt).toLocaleString('vi-VN') : 'Không rõ'}</span>
                                        <span style={{ fontWeight: '700', color: 'var(--primary)' }}><i className="fa-solid fa-check" style={{ width: '16px' }}></i> Xong lúc: {t.resolvedAt ? new Date(t.resolvedAt).toLocaleString('vi-VN') : 'Không rõ'}</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => handleReopenTicket(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d97706', fontSize: '0.8rem', fontWeight: '800' }}><i className="fa-solid fa-rotate-left"></i> Xem xét lại</button>
                                        <button onClick={() => handleDeleteTicket(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.8rem', fontWeight: '800' }}><i className="fa-solid fa-trash"></i> Xóa</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL HỒ SƠ HỌC VIÊN: BỔ SUNG LỚP MỚI KHI ĐỔI LỚP */}
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

                            {/* KHU VỰC THÔNG TIN LỚP HỌC - TỰ ĐỘNG HIGHLIGHT KHI ĐỔI LỚP */}
                            <div style={{ gridColumn: 'span 2', backgroundColor: currentStudent.status === 'Đổi lớp' ? '#fffbeb' : '#f8fafc', padding: '16px', borderRadius: '12px', border: currentStudent.status === 'Đổi lớp' ? '1px dashed #f59e0b' : '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px', transition: 'all 0.3s' }}>
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
                                    <label style={{ fontSize: '0.8rem', fontWeight: '800', color: currentStudent.status === 'Đổi lớp' ? '#d97706' : 'var(--primary)' }}>
                                        {currentStudent.status === 'Đổi lớp' ? 'LỚP MỚI (Chọn để chuyển)' : 'Xếp vào Lớp học'}
                                    </label>
                                    {modalMode !== 'view' ? (
                                        <select className="form-control" value={currentStudent.classId || ''} onChange={handleClassChange} style={{ border: currentStudent.status === 'Đổi lớp' ? '2px solid #f59e0b' : '1px solid var(--primary)', backgroundColor: currentStudent.status === 'Đổi lớp' ? 'white' : 'var(--primary-light)' }}>
                                            <option value="">-- Chọn lớp học --</option>
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

            {/* MODAL SỬA YÊU CẦU / PHẢN ÁNH */}
            {editingTicket && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ width: '500px', backgroundColor: 'white', padding: '24px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                            <h3 style={{ fontWeight: '800', color: 'var(--primary)' }}><i className="fa-solid fa-pen"></i> Chỉnh sửa Phản ánh</h3>
                            <button onClick={() => setEditingTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✖</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Tên Học viên</label>
                                <input type="text" className="form-control" value={editingTicket.studentName || ''} onChange={(e) => setEditingTicket({ ...editingTicket, studentName: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Nội dung phản ánh</label>
                                <textarea className="form-control" rows="4" value={editingTicket.details || ''} onChange={(e) => setEditingTicket({ ...editingTicket, details: e.target.value })} style={{ resize: 'vertical' }}></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Mức độ / Nhãn dán</label>
                                    <select className="form-control" value={editingTicket.priority || 'Tạo mới'} onChange={(e) => setEditingTicket({ ...editingTicket, priority: e.target.value })}>
                                        <option value="Tạo mới">Tạo mới</option>
                                        <option value="Xem xét lại">Xem xét lại</option>
                                        <option value="Gấp">Cần xử lý Gấp</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Chỉnh sửa thời gian tạo</label>
                                    <input type="datetime-local" className="form-control" value={parseToLocalDatetime(editingTicket.createdAt)} onChange={handleDatetimeChange} />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                            <button className="btn" style={{ padding: '12px 30px', backgroundColor: 'var(--success)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '800' }} onClick={handleSaveEditTicket}>
                                <i className="fa-solid fa-floppy-disk" style={{ marginRight: '6px' }}></i> LƯU THAY ĐỔI
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentCare;
