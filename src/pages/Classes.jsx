import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function Classes() {
    const { addNotification } = useNotification();

    const { classes, addClass, teachers, tas } = useData();
    const { currentUser, currentRole } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);
    const [activeSession, setActiveSession] = useState(1);

    const [allStudents, setAllStudents] = useState([]);
    const [classStudents, setClassStudents] = useState([]);

    const [editingClass, setEditingClass] = useState(null);

    // --- STATE ĐỂ LƯU DỮ LIỆU THẬT CỦA TIẾN ĐỘ VÀ ĐIỂM DANH ---
    const [sessionsData, setSessionsData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);

    const [formClass, setFormClass] = useState({
        name: '', teacher: '', teacherId: '', ta: '', taId: '', padletUrl: '', classType: '',
        level: '', sessionFee: '', startDate: '', totalSessions: '', scheduleTime: ''
    });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [studentsRes, customersRes] = await Promise.all([
                    api.get('/students').catch(() => ({ data: [] })),
                    api.get('/customers').catch(() => ({ data: [] }))
                ]);

                const studentsList = (studentsRes.data || []).filter(Boolean).map(s => ({
                    id: `ST-${s.id}`, name: String(s.name || 'Học viên ẩn danh'), classCode: s.classId || s.class
                }));

                const customersList = (customersRes.data || [])
                    .filter(c => c && c.status === 'Đã ĐK' && c.assignClass)
                    .map(c => ({
                        id: `CUS-${c.id}`, name: String(c.name || c.fbName || 'Khách hàng ẩn danh'), classCode: c.assignClass
                    }));

                setAllStudents([...studentsList, ...customersList]);
            } catch (error) {
                console.log("Lỗi đồng bộ dữ liệu");
            }
        };
        fetchAllData();
    }, []);

    // --- KÉO DỮ LIỆU BUỔI HỌC VÀ ĐIỂM DANH THẬT TỪ CSDL ---
    useEffect(() => {
        if (selectedClass) {
            const studentsInThisClass = allStudents.filter(s => s && s.classCode === selectedClass.classCode);
            setClassStudents(studentsInThisClass);

            // Kéo tiến độ buổi học
            api.get(`/sessions/class/${selectedClass.id}`).then(res => {
                const total = Math.max(1, parseInt(selectedClass.totalSessions) || 19);
                const fullSessions = Array.from({ length: total }, (_, i) => ({
                    classId: selectedClass.id, sessionNum: i + 1, title: `BÀI ${i + 1}`, status: 'draft', notes: '', hasLessonPlan: false
                }));
                (res.data || []).forEach(dbS => {
                    if (dbS && dbS.sessionNum && dbS.sessionNum >= 1 && dbS.sessionNum <= total) {
                        fullSessions[dbS.sessionNum - 1] = { ...fullSessions[dbS.sessionNum - 1], ...dbS };
                    }
                });
                setSessionsData(fullSessions);
            }).catch(() => setSessionsData([]));
        }
    }, [selectedClass, allStudents]);

    useEffect(() => {
        if (selectedClass && activeSession) {
            // Kéo điểm danh của buổi học đang chọn
            api.get(`/attendance/${selectedClass.id}/${activeSession}`).then(res => {
                setAttendanceData(res.data || []);
            }).catch(() => setAttendanceData([]));
        }
    }, [selectedClass, activeSession]);

    // ... (Giữ nguyên các hàm handleCreateClass, handleSaveEdit, handleDeleteClass)
    const handleCreateClass = async (e) => {
        e.preventDefault();
        if (!formClass.name) return addNotification('Vui lòng điền Tên lớp học!', 'error', 'classes');

        const newClassObj = {
            classCode: formClass.name,
            teacherId: formClass.teacherId ? parseInt(formClass.teacherId) : null,
            teacher: formClass.teacher,
            teacherName: formClass.teacher,
            taId: formClass.taId ? parseInt(formClass.taId) : null,
            ta: formClass.ta,
            teachingAssistant: formClass.ta,
            classType: formClass.classType,
            level: formClass.level,
            courseLevel: formClass.level,
            totalSessions: parseInt(formClass.totalSessions) || 0,
            sessionFee: parseInt(formClass.sessionFee) || 0,
            scheduleTime: formClass.scheduleTime || 'Chưa rõ',
            startDate: formClass.startDate ? new Date(formClass.startDate).toISOString().split('T')[0] : null,
            padletUrl: formClass.padletUrl
        };

        const result = await addClass(newClassObj);

        if (result && result.success) {
            addNotification(`Hệ thống: Khởi tạo thành công lớp học ${formClass.name}!`, 'success', 'classes');
            setFormClass({ name: '', teacher: '', teacherId: '', ta: '', taId: '', padletUrl: '', classType: '', level: '', sessionFee: '', startDate: '', totalSessions: '', scheduleTime: '' });
        } else {
            addNotification('Lỗi tạo lớp! CSDL từ chối lưu. Chi tiết lỗi: ' + result.message, 'error', 'classes');
        }
    };

    const handleSaveEdit = async () => {
        try {
            await api.put(`/classes/${editingClass.id}`, editingClass);
            addNotification('Cập nhật thông tin lớp học thành công!', 'success', 'classes');
            window.location.reload();
        } catch (error) {
            addNotification('Lỗi cập nhật! Vui lòng kiểm tra lại kết nối CSDL.', 'error', 'classes');
        }
    };

    const handleDeleteClass = async (id) => {
        if (window.confirm('Cảnh báo: Bạn có chắc chắn muốn xóa lớp học này không? Toàn bộ dữ liệu tiến trình sẽ bị mất!')) {
            try {
                await api.delete(`/classes/${id}`);
                addNotification('Đã xóa lớp học thành công!', 'success', 'classes');
                window.location.reload();
            } catch (error) {
                addNotification('Lỗi khi xóa lớp học!', 'error', 'classes');
            }
        }
    };


    let displayClasses = classes ? [...classes] : [];
    if (currentRole === 'teacher') {
        displayClasses = displayClasses.filter(c =>
            c.teacherId === currentUser.id || (c.teacher && currentUser.name && c.teacher.toLowerCase().includes(currentUser.name.toLowerCase()))
        );
    }
    if (searchTerm) {
        displayClasses = displayClasses.filter(c => c.classCode && c.classCode.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    displayClasses.sort((a, b) => {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(b.startDate) - new Date(a.startDate);
    });

    const groupedClasses = displayClasses.reduce((acc, c) => {
        const dateObj = c.startDate ? new Date(c.startDate) : null;
        const groupName = dateObj && !isNaN(dateObj.getTime()) ? `Tháng ${dateObj.getMonth() + 1} / ${dateObj.getFullYear()}` : 'Lớp chưa xác định ngày KG';

        if (!acc[groupName]) {
            acc[groupName] = [];
        }
        acc[groupName].push(c);
        return acc;
    }, {});


    if (selectedClass) {
        // Lấy bài học hiện tại từ mảng thật
        const currentSession = sessionsData.find(s => s.sessionNum === activeSession) || {};

        // Tạo Lịch sử dạy từ dữ liệu thật
        const completedSessions = sessionsData
            .filter(s => s.status === 'completed' || s.status === 'cancelled')
            .sort((a, b) => b.sessionNum - a.sessionNum)
            .slice(0, 3); // Lấy 3 buổi gần nhất

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <button className="circular-btn" onClick={() => setSelectedClass(null)} style={{ width: '36px', height: '36px', backgroundColor: 'white', border: '1px solid var(--border-color)' }}>
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>{selectedClass.classCode}</h2>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chi tiết tiến trình giảng dạy và học viên (Chế độ xem)</span>
                    </div>
                </div>

                <div className="my-portal-grid" style={{ gridTemplateColumns: '1fr 2.2fr', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DANH SÁCH LỚP ({classStudents.length})</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {classStudents.length === 0 && <p style={{ fontSize: '0.8rem', color: 'gray' }}>Chưa có học viên nào.</p>}
                                {classStudents.map(st => (
                                    <div key={st.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800', fontSize: '0.75rem' }}>
                                                {String(st.name || 'H').charAt(0).toUpperCase()}
                                            </div>
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
                            </div>
                            <div className="timeline-container">
                                {completedSessions.length === 0 && <span style={{ fontSize: '0.8rem', color: 'gray' }}>Chưa có buổi học nào hoàn thành.</span>}
                                {completedSessions.map(sess => (
                                    <div className="timeline-node" key={sess.sessionNum}>
                                        <div className="timeline-dot" style={{ backgroundColor: sess.status === 'cancelled' ? '#ef4444' : 'var(--primary)', left: '-25px' }}></div>
                                        <div className="timeline-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <strong style={{ color: sess.status === 'cancelled' ? '#b91c1c' : 'var(--primary)', fontSize: '0.85rem', backgroundColor: sess.status === 'cancelled' ? '#fee2e2' : 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>Buổi {sess.sessionNum}</strong>
                                        </div>
                                        <div className="timeline-content" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>{sess.title || 'Không có tiêu đề'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="card" style={{ padding: '24px' }}>
                            <div className="session-grid-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
                                {sessionsData.map(sess => {
                                    const num = sess.sessionNum;
                                    const isSelected = activeSession === num;
                                    const isCancelled = sess.status === 'cancelled';
                                    const isDone = sess.status === 'completed';
                                    let cardClass = "session-btn-card";
                                    if (isCancelled) cardClass += " session-cancelled";
                                    else if (isDone) cardClass += " session-submitted-ga";
                                    if (isSelected && !isCancelled) cardClass += " session-active-selected";

                                    return (
                                        <div key={num} className={cardClass} onClick={() => setActiveSession(num)}>
                                            <strong style={{ fontSize: '0.7rem' }}>BUỔI {num}</strong>
                                            <span style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Xem</span>
                                            {isDone && <span className="session-submitted-ga-badge" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#dcfce7', color: isSelected ? 'white' : '#166534' }}><i className="fa-solid fa-check"></i> Đã dạy</span>}
                                            {isCancelled && <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><span className="session-cancelled-badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}><i className="fa-solid fa-ban"></i> NGHỈ</span></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="card" style={{ padding: '24px', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e3a8a' }}>Điểm Danh Học Viên: Buổi {activeSession}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dữ liệu điểm danh được giáo viên lưu lại</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                {classStudents.length === 0 && <p style={{ gridColumn: 'span 2', textAlign: 'center', color: 'gray' }}>Chưa có học viên.</p>}
                                {classStudents.map(st => {
                                    // Tìm trạng thái điểm danh thật của học viên này trong CSDL
                                    const attRecord = attendanceData.find(a => a.studentId === st.id) || {};
                                    const isPresent = attRecord.status === 'present';
                                    const isAbsent = attRecord.status === 'absent';

                                    return (
                                        <div key={st.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-app)', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800', fontSize: '1rem' }}>
                                                    {String(st.name || 'H').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>{st.name}</strong>
                                                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'not-allowed', fontWeight: isPresent ? '600' : 'normal', color: isPresent ? 'var(--primary)' : 'gray' }}>
                                                            <input type="radio" checked={isPresent} readOnly /> Có mặt
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'not-allowed', fontWeight: isAbsent ? '600' : 'normal', color: isAbsent ? '#ef4444' : 'gray' }}>
                                                            <input type="radio" checked={isAbsent} readOnly /> Vắng
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <i className={`fa-solid fa-flag ${attRecord.flag ? 'flagged' : ''}`} style={{ color: attRecord.flag ? '#f59e0b' : '#e2e8f0' }}></i>
                                        </div>
                                    )
                                })}
                            </div>

                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '12px' }}>Nội dung bài dạy / Ghi chú (Chỉ xem)</h4>
                                <textarea className="form-control" rows="3" value={currentSession.notes || ''} readOnly style={{ backgroundColor: '#f1f5f9', resize: 'none', color: '#475569' }} placeholder="Giáo viên chưa nhập ghi chú..."></textarea>
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
                                <select className="form-control" value={formClass.teacherId} onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectedTeacher = teachers.find(t => t.id.toString() === selectedId);
                                    setFormClass({ ...formClass, teacherId: selectedId, teacher: selectedTeacher ? selectedTeacher.name : '' });
                                }}>
                                    <option value="">-- Chọn Giáo viên --</option>
                                    {teachers && teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>TRỢ GIẢNG PHỤ TRÁCH</label>
                                <select className="form-control" value={formClass.taId} onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectedTA = tas.find(t => t.id.toString() === selectedId);
                                    setFormClass({ ...formClass, taId: selectedId, ta: selectedTA ? selectedTA.name : '' });
                                }}>
                                    <option value="">-- Chọn Trợ giảng --</option>
                                    {tas && tas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
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
                                    <input type="text" className="form-control" placeholder="VD: Lớp Nhóm, VIP..." value={formClass.classType} onChange={(e) => setFormClass({ ...formClass, classType: e.target.value })} style={{ background: 'white', marginTop: '6px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>CẤP ĐỘ LỚP (*)</label>
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
                                    <input type="number" className="form-control" placeholder="Nhập..." value={formClass.totalSessions} onChange={(e) => setFormClass({ ...formClass, totalSessions: e.target.value })} style={{ background: 'white', marginTop: '6px' }} />
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
                        {Object.keys(groupedClasses).length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Không tìm thấy lớp học nào khớp với dữ liệu.</td></tr>}

                        {Object.keys(groupedClasses).map(monthLabel => (
                            <React.Fragment key={monthLabel}>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', borderTop: '2px solid #e2e8f0' }}>
                                    <td colSpan="4" style={{ padding: '12px 24px', fontWeight: '800', color: '#1e3a8a', fontSize: '0.9rem' }}>
                                        <i className="fa-regular fa-calendar" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> {monthLabel}
                                    </td>
                                </tr>

                                {groupedClasses[monthLabel].map((c) => {
                                    const count = allStudents.filter(s => s && s.classCode === c.classCode).length;

                                    return (
                                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'white', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-app)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                            <td style={{ padding: '20px 24px' }}>
                                                <strong style={{ fontSize: '1.1rem', color: '#4f46e5', fontWeight: '800', cursor: 'pointer', display: 'block', marginBottom: '6px' }} onClick={() => setSelectedClass(c)} title="Nhấn để xem chi tiết Lớp học">
                                                    {c.classCode}
                                                </strong>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><i className="fa-solid fa-chalkboard-user" style={{ color: '#94a3b8', marginRight: '6px' }}></i> {c.teacher || 'Chưa xếp giáo viên'} {c.ta && `| TA: ${c.ta}`}</span>
                                            </td>
                                            <td style={{ padding: '20px 24px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                                <div><i className="fa-regular fa-clock" style={{ color: '#94a3b8', width: '20px' }}></i> {c.scheduleTime}</div>
                                                <div><i className="fa-regular fa-calendar" style={{ color: '#94a3b8', width: '20px' }}></i> KG: {c.startDate ? new Date(c.startDate).toLocaleDateString('vi-VN') : 'Dự kiến'}</div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800' }}>
                                                    {count} HV
                                                </span>
                                            </td>
                                            {currentRole !== 'teacher' && (
                                                <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button title="Sửa" onClick={() => setEditingClass(c)} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: '#475569' }}><i className="fa-solid fa-pen"></i></button>
                                                        <button title="Xóa" onClick={() => handleDeleteClass(c.id)} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: '#1e293b' }}><i className="fa-solid fa-trash"></i></button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

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
                                <select className="form-control" value={editingClass.teacherId || ''} onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectedTeacher = teachers.find(t => t.id.toString() === selectedId);
                                    setEditingClass({ ...editingClass, teacherId: selectedId, teacher: selectedTeacher ? selectedTeacher.name : '' });
                                }}>
                                    <option value="">-- Chọn Giáo viên --</option>
                                    {teachers && teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Trợ giảng</label>
                                <select className="form-control" value={editingClass.taId || ''} onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectedTA = tas.find(t => t.id.toString() === selectedId);
                                    setEditingClass({ ...editingClass, taId: selectedId, ta: selectedTA ? selectedTA.name : '' });
                                }}>
                                    <option value="">-- Chọn Trợ giảng --</option>
                                    {tas && tas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
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
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ngày khai giảng</label>
                                <input type="date" className="form-control" value={editingClass.startDate || ''} onChange={(e) => setEditingClass({ ...editingClass, startDate: e.target.value })} />
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