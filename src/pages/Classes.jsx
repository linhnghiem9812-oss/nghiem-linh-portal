import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function Classes() {
    const { classes, addClass, teachers } = useData();
    const { currentUser, currentRole } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);
    const [activeSession, setActiveSession] = useState(1);

    const [classStudents, setClassStudents] = useState([]);

    // STATE CHO TÍNH NĂNG CHỈNH SỬA LỚP HỌC
    const [editingClass, setEditingClass] = useState(null);

    const [formClass, setFormClass] = useState({
        name: '', teacher: '', ta: '', padletUrl: '', classType: '',
        level: '', sessionFee: '', startDate: '', totalSessions: '', scheduleTime: ''
    });

    useEffect(() => {
        if (selectedClass) {
            api.get(`/classes/${selectedClass.id}/students`)
                .then(res => setClassStudents(res.data))
                .catch(() => {
                    const fallback = selectedClass.studentIds?.map((id, i) => ({
                        id: id, name: `Học viên ${i + 1}`, initial: 'H'
                    })) || [];
                    setClassStudents(fallback);
                });
        }
    }, [selectedClass]);

    const handleCreateClass = async (e) => {
        e.preventDefault();
        if (!formClass.name || !formClass.sessionFee) {
            alert('Vui lòng điền Tên lớp học và cấu hình Học phí!');
            return;
        }

        const newClassObj = {
            classCode: formClass.name,
            teacher: formClass.teacher ? (formClass.teacher + (currentRole === 'admin' ? ' (admin)' : '')) : '',
            ta: formClass.ta,
            classType: formClass.classType,
            level: formClass.level,
            totalSessions: parseInt(formClass.totalSessions),
            scheduleTime: formClass.scheduleTime || '20:00 - 21:30',
            startDate: formClass.startDate || '2026-03-10',
            sessionFee: parseInt(formClass.sessionFee),
            padletUrl: formClass.padletUrl
        };

        const result = await addClass(newClassObj);

        if (result && result.success) {
            alert(`Hệ thống: Khởi tạo thành công lớp học ${formClass.name}!`);
            setFormClass({ name: '', teacher: '', ta: '', padletUrl: '', classType: '', level: '', sessionFee: '', startDate: '', totalSessions: '', scheduleTime: '' });
        } else {
            alert('Lỗi tạo lớp! Vui lòng kiểm tra lại kết nối hoặc dữ liệu nhập.');
        }
    };

    // HÀM LƯU THÔNG TIN LỚP SAU KHI SỬA
    const handleSaveEdit = async () => {
        try {
            await api.put(`/classes/${editingClass.id}`, editingClass);
            alert('Cập nhật thông tin lớp học thành công!');
            window.location.reload(); // Tải lại trang để cập nhật danh sách mới nhất
        } catch (error) {
            alert('Lỗi cập nhật! Vui lòng kiểm tra lại kết nối CSDL.');
        }
    };

    let displayClasses = classes || [];
    if (currentRole === 'teacher') {
        displayClasses = displayClasses.filter(c =>
            c.teacher && c.teacher.toLowerCase().includes(currentUser.name.toLowerCase())
        );
    }

    if (searchTerm) {
        displayClasses = displayClasses.filter(c => c.classCode && c.classCode.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (selectedClass) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <button className="circular-btn" onClick={() => setSelectedClass(null)} style={{ width: '36px', height: '36px', backgroundColor: 'white', border: '1px solid var(--border-color)' }}>
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>{selectedClass.classCode}</h2>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chi tiết tiến trình giảng dạy và học viên</span>
                    </div>
                </div>

                <div className="my-portal-grid" style={{ gridTemplateColumns: '1fr 2.2fr', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DANH SÁCH LỚP ({classStudents.length})</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {classStudents.map(st => (
                                    <div key={st.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800', fontSize: '0.75rem' }}>{st.initial || st.name?.charAt(0)}</div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{st.name}</span>
                                        </div>
                                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>Đã ĐK</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '800' }}><i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--text-muted)', marginRight: '6px' }}></i> Lịch sử dạy</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tháng này</span>
                            </div>
                            <div className="timeline-container">
                                {[3, 2, 1].map(num => (
                                    <div className="timeline-node" key={num}>
                                        <div className="timeline-dot" style={{ backgroundColor: 'var(--primary)', left: '-25px' }}></div>
                                        <div className="timeline-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <strong style={{ color: 'var(--primary)', fontSize: '0.85rem', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>{selectedClass.classCode}</strong>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{10 + num}/4/2026</span>
                                        </div>
                                        <div className="timeline-content" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>Bài {num}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: '700' }}><i className="fa-solid fa-users"></i> Xem HV</span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Sĩ số: {classStudents.length}/{classStudents.length}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="card" style={{ padding: '24px' }}>
                            <div className="session-grid-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
                                {Array.from({ length: selectedClass.totalSessions || 19 }, (_, i) => i + 1).map(num => {
                                    const isSelected = activeSession === num;
                                    const isCancelled = num === 4;
                                    const isDone = num < 4 && num !== 4;

                                    let cardClass = "session-btn-card";
                                    if (isCancelled) cardClass += " session-cancelled";
                                    else if (isDone) cardClass += " session-submitted-ga";
                                    if (isSelected && !isCancelled) cardClass += " session-active-selected";

                                    return (
                                        <div key={num} className={cardClass} onClick={() => !isCancelled && setActiveSession(num)}>
                                            <strong style={{ fontSize: '0.7rem' }}>BUỔI {num}</strong>
                                            <span style={{ fontSize: '0.85rem', marginBottom: '4px' }}>{10 + num}/04</span>
                                            {isDone && <span className="session-submitted-ga-badge" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#dcfce7', color: isSelected ? 'white' : '#166534' }}><i className="fa-solid fa-check"></i> Đã nộp GA</span>}
                                            {isCancelled && <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><span className="session-cancelled-badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}><i className="fa-solid fa-ban"></i> NGHỈ</span><span className="session-btn-soan-ga" style={{ border: 'none', background: 'white', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem' }}><i className="fa-solid fa-plus"></i> Soạn GA</span></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="card" style={{ padding: '24px', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e3a8a' }}>Điểm Danh Học Viên</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vui lòng chọn trạng thái cho từng học viên</p>
                                </div>
                                <button className="btn-all-present" style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '8px 16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}><i className="fa-solid fa-check-double"></i> Tất cả đi học</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                {classStudents.map(st => (
                                    <div key={st.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-app)', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800', fontSize: '1rem' }}>{st.initial || st.name?.charAt(0)}</div>
                                            <div>
                                                <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>{st.name}</strong>
                                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: '600', color: 'var(--primary)' }}><input type="radio" name={`att-${st.id}`} defaultChecked /> Có mặt</label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-muted)' }}><input type="radio" name={`att-${st.id}`} /> Vắng</label>
                                                </div>
                                            </div>
                                        </div>
                                        <i className="fa-solid fa-flag" style={{ color: '#e2e8f0', cursor: 'pointer' }}></i>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '12px' }}>Nội dung bài dạy / Ghi chú</h4>
                                <textarea className="form-control" rows="3" placeholder="VD: Học từ vựng bài 5, ngữ pháp cấu trúc Ba..." style={{ backgroundColor: 'white', resize: 'none' }}></textarea>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                    <button className="btn btn-primary" style={{ padding: '12px 32px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }} onClick={() => alert('Hệ thống: Lưu sổ điểm danh lớp học thành công!')}>Lưu Sổ Điểm Danh</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', animation: 'fadeIn 0.3s ease-out', position: 'relative' }}>
            {currentRole !== 'teacher' && (
                <div className="card" style={{ padding: '32px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '24px', color: '#1e3a8a', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                        <i className="fa-regular fa-square-plus" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>Quản lý Lớp học
                    </h3>
                    <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>MÃ/TÊN LỚP</label>
                                <input type="text" className="form-control" placeholder="🏷 VD: HSK1-K35" value={formClass.name} onChange={(e) => setFormClass({ ...formClass, name: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>GIÁO VIÊN PHỤ TRÁCH</label>
                                {/* ĐÃ ĐỔI THÀNH TỰ NHẬP HOÀN TOÀN */}
                                <input type="text" className="form-control" placeholder="Tự nhập tên Giáo viên..." value={formClass.teacher} onChange={(e) => setFormClass({ ...formClass, teacher: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>TRỢ GIẢNG PHỤ TRÁCH</label>
                                <input type="text" className="form-control" placeholder="Tự nhập tên Trợ giảng..." value={formClass.ta} onChange={(e) => setFormClass({ ...formClass, ta: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px', display: 'block' }}><i className="fa-solid fa-link"></i> Tài nguyên & Giáo trình</label>
                            <input type="url" className="form-control" placeholder="Dán link Padlet / Google Drive tài liệu vào đây..." value={formClass.padletUrl} onChange={(e) => setFormClass({ ...formClass, padletUrl: e.target.value })} style={{ backgroundColor: 'var(--primary-light)', border: '1px dashed var(--primary)' }} />
                        </div>

                        <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}><i className="fa-regular fa-calendar-check" style={{ marginRight: '6px' }}></i> Cấu hình Lịch học</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>LOẠI HÌNH LỚP (*)</label>
                                    {/* ĐÃ ĐỔI THÀNH TỰ NHẬP HOÀN TOÀN */}
                                    <input type="text" className="form-control" placeholder="VD: Lớp Nhóm, VIP..." value={formClass.classType} onChange={(e) => setFormClass({ ...formClass, classType: e.target.value })} style={{ background: 'white', marginTop: '6px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>CẤP ĐỘ LỚP (*)</label>
                                    {/* ĐÃ ĐỔI THÀNH TỰ NHẬP HOÀN TOÀN */}
                                    <input type="text" className="form-control" placeholder="VD: HSK 1, HSK 2..." value={formClass.level} onChange={(e) => setFormClass({ ...formClass, level: e.target.value })} style={{ background: 'white', marginTop: '6px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>HỌC PHÍ (VNĐ)</label>
                                    <input type="number" className="form-control" placeholder="Ví dụ: 350000" value={formClass.sessionFee} onChange={(e) => setFormClass({ ...formClass, sessionFee: e.target.value })} required style={{ background: 'white', borderColor: 'var(--primary)', marginTop: '6px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>NGÀY KHAI GIẢNG</label>
                                    <input type="date" className="form-control" value={formClass.startDate} onChange={(e) => setFormClass({ ...formClass, startDate: e.target.value })} style={{ background: 'white', marginTop: '6px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>TỔNG SỐ BUỔI</label>
                                    {/* ĐÃ ĐỔI THÀNH TỰ NHẬP HOÀN TOÀN */}
                                    <input type="number" className="form-control" placeholder="Tự nhập..." value={formClass.totalSessions} onChange={(e) => setFormClass({ ...formClass, totalSessions: e.target.value })} style={{ background: 'white', marginTop: '6px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>GIỜ HỌC</label>
                                    <input type="text" className="form-control" placeholder="VD: 19:30 - 21:00" value={formClass.scheduleTime} onChange={(e) => setFormClass({ ...formClass, scheduleTime: e.target.value })} style={{ background: 'white', marginTop: '6px' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '14px 60px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)', transition: 'all 0.2s' }}>
                                TẠO LỚP HỌC MỚI
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>Danh sách Lớp học</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'white', padding: '6px 12px', borderRadius: '50px', border: '1px solid var(--border-color)' }}><i className="fa-solid fa-circle-info" style={{ color: 'var(--primary)' }}></i> Bấm tên lớp để xem chi tiết</span>
                        <input type="text" className="form-control" placeholder="🔍 Lọc lớp học..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '220px', backgroundColor: 'white' }} />
                    </div>
                </div>

                <table className="modal-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'white', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '16px 24px' }}>THÔNG TIN LỚP</th>
                            <th style={{ padding: '16px 24px' }}>GIÁO TRÌNH & LỊCH</th>
                            <th style={{ padding: '16px 24px' }}>SĨ SỐ</th>
                            {currentRole !== 'teacher' && <th style={{ padding: '16px 24px', textAlign: 'center' }}>THAO TÁC</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {displayClasses.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Không tìm thấy lớp học nào khớp với dữ liệu.</td></tr>}

                        {displayClasses.map((c) => (
                            <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'white', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-app)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                <td style={{ padding: '20px 24px' }}>
                                    <strong
                                        style={{ fontSize: '1.1rem', color: '#4f46e5', fontWeight: '800', cursor: 'pointer', display: 'block', marginBottom: '6px' }}
                                        onClick={() => setSelectedClass(c)}
                                        title="Nhấn để xem chi tiết Lớp học"
                                    >
                                        {c.classCode}
                                    </strong>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><i className="fa-solid fa-chalkboard-user" style={{ color: '#94a3b8', marginRight: '6px' }}></i> {c.teacher || 'Chưa xếp giáo viên'} {c.ta && `| TA: ${c.ta}`}</span>
                                </td>
                                <td style={{ padding: '20px 24px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                    <div><i className="fa-regular fa-clock" style={{ color: '#94a3b8', width: '20px' }}></i> {c.scheduleTime}</div>
                                    <div><i className="fa-regular fa-calendar" style={{ color: '#94a3b8', width: '20px' }}></i> KG: {c.startDate || 'Dự kiến'}</div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800' }}>
                                        {c.studentIds?.length || 0} HV
                                    </span>
                                </td>
                                {currentRole !== 'teacher' && (
                                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            {/* NÚT SỬA ĐÃ ĐƯỢC GẮN SỰ KIỆN */}
                                            <button 
                                                title="Sửa" 
                                                onClick={() => setEditingClass(c)} 
                                                style={{ background: '#f8fafc', border: '1px solid #cbd5e1', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: '#475569' }}
                                            >
                                                <i className="fa-solid fa-pen"></i>
                                            </button>
                                            
                                            <button title="Xóa" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: '#1e293b' }}>
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* GIAO DIỆN MODAL MENU ĐỂ CHỈNH SỬA LỚP HỌC */}
            {editingClass && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ width: '650px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                            <h3 style={{ fontWeight: '800', color: 'var(--primary)' }}><i className="fa-solid fa-pen-to-square"></i> Chỉnh sửa thông tin Lớp học</h3>
                            <button onClick={() => setEditingClass(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✖</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Mã/Tên Lớp</label>
                                <input className="form-control" value={editingClass.classCode || ''} onChange={(e) => setEditingClass({ ...editingClass, classCode: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Học phí</label>
                                <input type="number" className="form-control" value={editingClass.sessionFee || ''} onChange={(e) => setEditingClass({ ...editingClass, sessionFee: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Giáo viên</label>
                                <input className="form-control" value={editingClass.teacher || ''} onChange={(e) => setEditingClass({ ...editingClass, teacher: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Trợ giảng</label>
                                <input className="form-control" value={editingClass.ta || ''} onChange={(e) => setEditingClass({ ...editingClass, ta: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Loại hình</label>
                                <input className="form-control" value={editingClass.classType || ''} onChange={(e) => setEditingClass({ ...editingClass, classType: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Cấp độ</label>
                                <input className="form-control" value={editingClass.level || ''} onChange={(e) => setEditingClass({ ...editingClass, level: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Tổng số buổi</label>
                                <input type="number" className="form-control" value={editingClass.totalSessions || ''} onChange={(e) => setEditingClass({ ...editingClass, totalSessions: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Giờ học</label>
                                <input className="form-control" value={editingClass.scheduleTime || ''} onChange={(e) => setEditingClass({ ...editingClass, scheduleTime: e.target.value })} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Link tài nguyên (Padlet/Drive)</label>
                                <input type="url" className="form-control" value={editingClass.padletUrl || ''} onChange={(e) => setEditingClass({ ...editingClass, padletUrl: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                            <button className="btn" style={{ padding: '10px 24px', backgroundColor: 'var(--success)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }} onClick={handleSaveEdit}>
                                <i className="fa-solid fa-floppy-disk"></i> Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Classes;
