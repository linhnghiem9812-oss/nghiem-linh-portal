import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function ClassReports() {
    const { classes } = useData();
    const { currentUser, currentRole } = useAuth();
    const [selectedReport, setSelectedReport] = useState(null);
    
    const [reportStudents, setReportStudents] = useState([]);
    const [reportSessions, setReportSessions] = useState([]);

    const [progressMap, setProgressMap] = useState({});
    const [attendanceMap, setAttendanceMap] = useState({});

    // 1. TỰ ĐỘNG ĐỒNG BỘ TIẾN ĐỘ CHO TẤT CẢ CÁC LỚP, BỎ ĐI DỮ LIỆU RÁC
    useEffect(() => {
        if (classes && classes.length > 0) {
            classes.forEach(c => {
                api.get(`/sessions/class/${c.id}`)
                    .then(res => {
                        const rawSessions = res.data || [];
                        const uniqueMap = new Map();
                        rawSessions.forEach(s => { if(s.sessionNum) uniqueMap.set(s.sessionNum, s); });
                        const sessions = Array.from(uniqueMap.values());
                        
                        const completedCount = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled').length;
                        setProgressMap(prev => ({ ...prev, [c.id]: completedCount }));
                    })
                    .catch(() => {});
            });
        }
    }, [classes]);

    // 2. TẢI DỮ LIỆU CHI TIẾT KHI MỞ BÁO CÁO (LỌC TRÙNG LẶP)
    useEffect(() => {
        if (selectedReport) {
            api.get(`/classes/${selectedReport.id}/students`)
                .then(res => setReportStudents(res.data || []))
                .catch(() => setReportStudents([]));
            
            api.get(`/sessions/class/${selectedReport.id}`)
                .then(res => {
                    const rawSessions = res.data || [];
                    
                    // LỌC BỎ CÁC BẢN GHI RÁC TỪ DATABASE
                    const uniqueSessionsMap = new Map();
                    rawSessions.forEach(s => {
                        if (s.sessionNum) {
                            uniqueSessionsMap.set(s.sessionNum, s);
                        }
                    });
                    const sessions = Array.from(uniqueSessionsMap.values());

                    setReportSessions(sessions);

                    sessions.forEach(session => {
                        if (session.status === 'completed' || session.status === 'cancelled') {
                            api.get(`/attendance/${selectedReport.id}/${session.sessionNum}`)
                                .then(attRes => {
                                    const records = attRes.data || [];
                                    const presentCount = records.filter(r => r.status === 'present').length;
                                    setAttendanceMap(prev => ({ ...prev, [session.sessionNum]: presentCount }));
                                })
                                .catch(() => {});
                        }
                    });
                })
                .catch(() => setReportSessions([]));
        }
    }, [selectedReport]);

    let displayClasses = classes || [];
    if (currentRole === 'teacher') {
        displayClasses = displayClasses.filter(c =>
            c.teacher && c.teacher.toLowerCase().includes(currentUser.name.toLowerCase())
        );
    }

    const currentProgress = reportSessions.filter(s => s.status === 'completed' || s.status === 'cancelled').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease-out' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {displayClasses.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu lớp học trên hệ thống.</p>}
                {displayClasses.map(c => (
                    <div key={c.id} style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s' }}
                        onClick={() => setSelectedReport(c)}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e3a8a' }}>{c.classCode || 'Chưa có tên lớp'}</h4>
                            <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700' }}>{c.studentIds?.length || 0} HV</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <span><i className="fa-solid fa-user-tie" style={{ width: '20px' }}></i> GV: <strong style={{ color: 'var(--text-main)' }}>{c.teacher || 'Chưa xếp'}</strong></span>
                            
                            {c.ta && (
                                <span><i className="fa-solid fa-user-graduate" style={{ width: '20px' }}></i> TA: <strong style={{ color: 'var(--text-main)' }}>{c.ta}</strong></span>
                            )}
                            
                            <span><i className="fa-solid fa-clock" style={{ width: '20px' }}></i> Lịch học: <strong style={{ color: 'var(--text-main)' }}>{c.scheduleTime || 'Chưa xếp'}</strong></span>
                            <span><i className="fa-solid fa-list-check" style={{ width: '20px' }}></i> Tiến độ: <strong style={{ color: 'var(--text-main)' }}>{progressMap[c.id] || 0}/{c.totalSessions || 19} buổi</strong></span>
                        </div>

                        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Xem báo cáo chi tiết</span>
                            <i className="fa-solid fa-arrow-right" style={{ color: 'var(--primary)' }}></i>
                        </div>
                    </div>
                ))}
            </div>

            {selectedReport && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '900px', maxHeight: '90vh', backgroundColor: '#f8fafc', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>

                        <div style={{ padding: '20px 24px', backgroundColor: 'white', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>Chi tiết Báo cáo Lớp học</h3>
                            <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✖</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', backgroundColor: 'white', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ padding: '16px 24px', borderRight: '1px solid var(--border-color)' }}>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Giáo viên</span>
                                <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{selectedReport.teacher || 'Chưa xếp'}</strong>
                            </div>
                            <div style={{ padding: '16px 24px', borderRight: '1px solid var(--border-color)' }}>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Trợ giảng</span>
                                <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{selectedReport.ta || 'Không có'}</strong>
                            </div>
                            <div style={{ padding: '16px 24px' }}>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Mã lớp</span>
                                <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{selectedReport.classCode || 'Chưa có tên'}</strong>
                            </div>
                            <div style={{ padding: '16px 24px', borderRight: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)' }}>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Sĩ số</span>
                                <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{reportStudents.length} Học viên</strong>
                            </div>
                            <div style={{ padding: '16px 24px', borderRight: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)' }}>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Lịch học</span>
                                <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{selectedReport.scheduleTime || 'Chưa xếp'}</strong>
                            </div>
                            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Tiến độ</span>
                                <strong style={{ fontSize: '1rem', color: '#9333ea' }}>{currentProgress}/{selectedReport.totalSessions || 19} buổi</strong>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '24px', flex: 1, minHeight: 0 }}>
                            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div style={{ padding: '16px', backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border-color)', fontWeight: '800' }}>Danh sách Học viên</div>
                                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }}>
                                    {reportStudents.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Lớp chưa có học viên đăng ký.</p>}
                                    {reportStudents.map((st, i) => (
                                        <div key={st.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{st.name}</span>
                                            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>Đang học</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div style={{ padding: '16px', backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border-color)', fontWeight: '800' }}>Lịch sử Dạy & Điểm danh</div>
                                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}>
                                    
                                    {reportSessions.filter(s => s.status === 'completed' || s.status === 'cancelled').length === 0 && 
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '20px' }}>Chưa có lịch sử dạy được ghi nhận từ Giáo viên.</p>
                                    }
                                    
                                    {reportSessions
                                        .filter(s => s.status === 'completed' || s.status === 'cancelled')
                                        .sort((a, b) => b.sessionNum - a.sessionNum)
                                        .map((session) => (
                                            <div key={session.sessionNum} style={{ border: `1px solid ${session.status === 'completed' ? '#10b981' : '#ef4444'}`, borderRadius: '8px', padding: '12px', backgroundColor: 'var(--bg-card)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <strong style={{ color: 'var(--primary)' }}>BUỔI {session.sessionNum}</strong>
                                                    
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--success)' }}>
                                                            {attendanceMap[session.sessionNum] !== undefined ? attendanceMap[session.sessionNum] : 0}/{reportStudents.length} HV đi học
                                                        </span>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: session.status === 'completed' ? 'var(--success)' : 'var(--danger-text)', backgroundColor: session.status === 'completed' ? 'var(--success-light)' : 'var(--danger-light)', padding: '2px 8px', borderRadius: '4px' }}>
                                                            {session.status === 'completed' ? 'Đã hoàn thành' : 'Nghỉ'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{session.title} - {session.notes || 'Không có ghi chú'}</p>
                                                
                                                {session.hasLessonPlan && (
                                                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#2563eb', backgroundColor: '#e0e7ff', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <i className="fa-solid fa-file-shield"></i> Đã nộp giáo án
                                                    </span>
                                                )}
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default ClassReports;
