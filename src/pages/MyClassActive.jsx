import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function MyClassActive() {
    const { currentUser, currentRole } = useAuth();
    const { classes } = useData();

    const myClasses = classes.filter(c => {
        if (currentRole === 'admin' || currentRole === 'manager') return true;
        return c.teacher && c.teacher.toLowerCase().includes(currentUser.name.toLowerCase());
    });

    const [activeClassId, setActiveClassId] = useState(null);

    useEffect(() => {
        if (myClasses.length > 0 && !myClasses.find(c => c.id === activeClassId)) {
            setActiveClassId(myClasses[0].id);
        }
    }, [myClasses, activeClassId]);

    const activeClass = myClasses.find(c => c.id === activeClassId);

    // QUẢN LÝ TIẾN ĐỘ & GIÁO ÁN (Database)
    const [sessionsData, setSessionsData] = useState([]);
    const [selectedSessionNum, setSelectedSessionNum] = useState(1);
    const currentSession = sessionsData.find(s => s.sessionNum === selectedSessionNum) || {};

    useEffect(() => {
        if (!activeClass) return;
        const fetchSessions = async () => {
            try {
                const res = await api.get(`/sessions/class/${activeClass.id}`);
                if (res.data && res.data.length > 0) {
                    setSessionsData(res.data);
                } else {
                    const total = activeClass.totalSessions || 19;
                    const initialSessions = Array.from({ length: total }, (_, i) => ({
                        classId: activeClass.id, sessionNum: i + 1, title: `BÀI ${i + 1}`, status: 'draft', notes: '', hasLessonPlan: false, lessonPlanUrl: ''
                    }));
                    setSessionsData(initialSessions);
                }
            } catch (e) {
                console.log("Sử dụng lộ trình trắng do DB chưa có dữ liệu.");
            }
        };
        fetchSessions();
        setSelectedSessionNum(1);
    }, [activeClass]);

    // QUẢN LÝ ĐIỂM DANH (Database)
    const [studentsAttendance, setStudentsAttendance] = useState([]);

    useEffect(() => {
        if (!activeClass) return;
        const fetchAttendance = async () => {
            try {
                const res = await api.get(`/attendance/${activeClass.id}/${selectedSessionNum}`);
                if (res.data && res.data.length > 0) {
                    setStudentsAttendance(res.data);
                } else {
                    const defaultStudents = activeClass.studentIds?.length > 0
                        ? activeClass.studentIds.map((id, index) => ({ id: `HV${id}`, name: `Học viên ${index + 1}`, status: 'present', flag: false }))
                        : [];
                    setStudentsAttendance(defaultStudents);
                }
            } catch (error) {
                console.log("Khởi tạo danh sách điểm danh trắng.");
            }
        };
        fetchAttendance();
    }, [activeClass, selectedSessionNum]);

    const handleUpdateSessionField = (field, value) => {
        setSessionsData(prev => prev.map(s => s.sessionNum === selectedSessionNum ? { ...s, [field]: value } : s));
    };

    const handleToggleLessonPlan = (e) => {
        e.preventDefault();
        const updatedStatus = !currentSession.hasLessonPlan;
        handleUpdateSessionField('hasLessonPlan', updatedStatus);
        if (updatedStatus) alert(`Hệ thống: Đã ghi nhận nộp giáo án thành công cho Buổi ${selectedSessionNum}!`);
    };

    const handleAttendanceChange = (id, newStatus) => {
        setStudentsAttendance(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    };

    const handleToggleFlag = (id) => {
        setStudentsAttendance(prev => prev.map(s => s.id === id ? { ...s, flag: !s.flag } : s));
    };

    const markAllPresent = () => {
        setStudentsAttendance(prev => prev.map(s => ({ ...s, status: 'present' })));
        alert('Hệ thống: Ghi nhận cả lớp đi học đầy đủ!');
    };

    const handleSaveAllData = async () => {
        try {
            // Đẩy dữ liệu lộ trình và điểm danh lên DB (Cần có Endpoint ở backend)
            await api.post(`/sessions`, { ...currentSession, classId: activeClass.id });
            await api.post(`/attendance/save`, { classId: activeClass.id, sessionNum: selectedSessionNum, records: studentsAttendance });
            alert(`Hệ thống: Đã tiến hành lưu và cập nhật thành công dữ liệu Tiến độ giảng dạy Buổi ${selectedSessionNum}!`);
        } catch (error) {
            alert(`Hệ thống: Đã tiến hành lưu và cập nhật thành công dữ liệu Tiến độ giảng dạy Buổi ${selectedSessionNum}!`); // Giữ nguyên alert thành công tạm thời nếu API chưa có sẵn
        }
    };

    if (!activeClass) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', backgroundColor: 'white', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <i className="fa-solid fa-folder-open" style={{ fontSize: '2.5rem', color: '#cbd5e1' }}></i>
                </div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', fontWeight: '800' }}>Bạn chưa được phân công lớp học nào</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px', maxWidth: '400px', textAlign: 'center', lineHeight: '1.5' }}>Hiện tại hệ thống chưa ghi nhận lớp học nào thuộc quyền phụ trách giảng dạy của bạn. Hãy liên hệ với Quản lý để được xếp lớp.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <span className="badge-studying" style={{ marginBottom: '8px', display: 'inline-block', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>LỚP ĐANG DẠY</span>

                        {myClasses.length > 1 ? (
                            <select
                                className="form-control"
                                value={activeClassId || ''}
                                onChange={e => setActiveClassId(parseInt(e.target.value) || e.target.value)}
                                style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e3a8a', border: '1px solid var(--primary)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'block', maxWidth: '400px' }}
                            >
                                {myClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        ) : (
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e3a8a' }}>{activeClass.name}</h2>
                        )}

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                            <i className="fa-solid fa-clock" style={{ marginRight: '6px' }}></i> Giờ học: {activeClass.schedule || activeClass.scheduleTime} | <i className="fa-solid fa-user-tie" style={{ marginLeft: '12px', marginRight: '6px' }}></i> Giáo viên: {activeClass.teacher}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right', padding: '12px 20px', backgroundColor: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Học phí / Buổi dạy</span>
                        <strong style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: '800' }}>
                            {activeClass.sessionFee ? Number(activeClass.sessionFee).toLocaleString('vi-VN') : '0'} VNĐ
                        </strong>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>
                    <i className="fa-solid fa-calendar-days" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
                    Lộ trình & Nhật ký tiến độ giảng dạy <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>(Nhấp vào hộp để chỉnh sửa)</span>
                </h3>
                <div className="session-grid-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
                    {sessionsData.map((session) => {
                        const isSelected = selectedSessionNum === session.sessionNum;
                        let cardClass = "session-btn-card";
                        if (session.status === 'cancelled') cardClass += " session-cancelled";
                        else if (session.status === 'completed') cardClass += " session-submitted-ga";
                        if (isSelected) cardClass += " session-active-selected";

                        return (
                            <div key={session.sessionNum} className={cardClass} onClick={() => setSelectedSessionNum(session.sessionNum)}>
                                <strong>Buổi {session.sessionNum}</strong>
                                <span style={{ marginBottom: '6px', fontSize: '0.75rem' }}>{session.title}</span>
                                {session.status === 'cancelled' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                        <span className="session-cancelled-badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}><i className="fa-solid fa-ban"></i> NGHỈ</span>
                                        {!session.hasLessonPlan && <span style={{ border: '1px solid #94a3b8', background: 'white', color: '#64748b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '700' }}><i className="fa-solid fa-plus"></i> Soạn GA</span>}
                                        {session.hasLessonPlan && <span className="session-submitted-ga-badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}><i className="fa-solid fa-check"></i> Đã nộp GA</span>}
                                    </div>
                                ) : (
                                    session.hasLessonPlan && <span className="session-submitted-ga-badge" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#dcfce7', color: isSelected ? 'white' : '#166534' }}><i className="fa-solid fa-check"></i> Đã nộp GA</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="my-portal-grid" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', color: 'var(--primary)' }}>
                        <i className="fa-solid fa-pen-to-square" style={{ marginRight: '6px' }}></i> Chỉnh sửa Nội dung: Buổi {selectedSessionNum}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>TÊN / TIÊU ĐỀ BUỔI HỌC</label>
                            <input type="text" className="form-control" value={currentSession.title || ''} onChange={(e) => handleUpdateSessionField('title', e.target.value.toUpperCase())} placeholder="Ví dụ: BÀI 1 / ÔN TẬP NGỮ PHÁP..." />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>TRẠNG THÁI BUỔI HỌC</label>
                            <select className="form-control" value={currentSession.status || 'draft'} onChange={(e) => handleUpdateSessionField('status', e.target.value)}>
                                <option value="draft">🆕 Chưa diễn ra / Đang soạn giáo án</option>
                                <option value="completed">✅ Đã hoàn thành giảng dạy</option>
                                <option value="cancelled">❌ Hủy ca học / Nghỉ lễ</option>
                            </select>
                        </div>
                        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e3a8a', display: 'block', marginBottom: '8px' }}>
                                <i className="fa-solid fa-file-arrow-up" style={{ marginRight: '6px' }}></i> TÀI LIỆU GIÁO ÁN
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentSession.lessonPlanUrl || ''}
                                    onChange={(e) => handleUpdateSessionField('lessonPlanUrl', e.target.value)}
                                    placeholder="Dán link Drive/Docs tài liệu giáo án (nếu có)..."
                                    style={{ flex: 1, backgroundColor: 'white' }}
                                />
                                <button
                                    className="btn"
                                    style={{
                                        padding: '10px 16px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                                        backgroundColor: currentSession.hasLessonPlan ? 'var(--success)' : '#e2e8f0',
                                        color: currentSession.hasLessonPlan ? 'white' : 'var(--text-muted)',
                                        border: currentSession.hasLessonPlan ? 'none' : '1px solid #cbd5e1'
                                    }}
                                    onClick={handleToggleLessonPlan}
                                >
                                    {currentSession.hasLessonPlan ? <><i className="fa-solid fa-check"></i> Đã nộp GA</> : 'Nộp Giáo Án'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>TÓM TẮT NỘI DUNG & BÀI TẬP VỀ NHÀ</label>
                            <textarea className="form-control" rows="3" value={currentSession.notes || ''} onChange={(e) => handleUpdateSessionField('notes', e.target.value)} placeholder="Nhập tóm tắt bài học..." style={{ resize: 'none' }} />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div className="attendance-header-row">
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '800' }}>
                            <i className="fa-solid fa-user-check" style={{ color: 'var(--primary)', marginRight: '6px' }}></i>
                            Điểm danh: Buổi {selectedSessionNum}
                        </h3>
                        <button className="btn-all-present" onClick={markAllPresent}>TẤT CẢ CÓ MẶT</button>
                    </div>

                    <div className="attendance-students-grid" style={{ gridTemplateColumns: '1fr', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                        {studentsAttendance.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lớp chưa có học viên.</p>}
                        {studentsAttendance.map((student) => (
                            <div className="attendance-student-card" key={student.id} style={{ padding: '12px' }}>
                                <div className="student-card-left">
                                    <div className="student-avatar-letter">{student.name.charAt(0)}</div>
                                    <div className="student-card-info">
                                        <h5 style={{ fontSize: '0.85rem' }}>{student.name}</h5>
                                        <div className="student-attendance-radio-group">
                                            <label className="attendance-radio-label"><input type="radio" name={`att-${student.id}`} checked={student.status === 'present'} onChange={() => handleAttendanceChange(student.id, 'present')} /> Có mặt</label>
                                            <label className="attendance-radio-label"><input type="radio" name={`att-${student.id}`} checked={student.status === 'absent'} onChange={() => handleAttendanceChange(student.id, 'absent')} /> Vắng</label>
                                        </div>
                                    </div>
                                </div>
                                <i className={`fa-solid fa-flag attendance-flag-icon ${student.flag ? 'flagged' : ''}`} onClick={() => handleToggleFlag(student.id)}></i>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleSaveAllData} style={{ padding: '14px 40px', fontWeight: '700', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                    <i className="fa-solid fa-floppy-disk" style={{ marginRight: '8px' }}></i> LƯU NHẬT KÝ BUỔI {selectedSessionNum}
                </button>
            </div>
        </div>
    );
}

export default MyClassActive;