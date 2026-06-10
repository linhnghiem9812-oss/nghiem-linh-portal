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

    // Tải danh sách học viên động khi người dùng bấm mở báo cáo lớp
    useEffect(() => {
        if (selectedReport) {
            api.get(`/classes/${selectedReport.id}/students`)
                .then(res => setReportStudents(res.data))
                .catch(() => {
                    const mockList = Array.from({ length: selectedReport.studentIds?.length || 5 }).map((_, i) => ({
                        id: i, name: `Học viên ${i + 1}`
                    }));
                    setReportStudents(mockList);
                });
        }
    }, [selectedReport]);

    let displayClasses = classes || [];
    if (currentRole === 'teacher') {
        displayClasses = displayClasses.filter(c =>
            c.teacher && c.teacher.toLowerCase().includes(currentUser.name.toLowerCase())
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Báo cáo Hoạt động Lớp học</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Theo dõi sĩ số, tiến trình giảng dạy và điểm danh chuyên cần của các lớp</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {displayClasses.length === 0 && <p>Không có dữ liệu lớp học.</p>}
                {displayClasses.map(c => (
                    <div key={c.id} style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s' }}
                        onClick={() => setSelectedReport(c)}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e3a8a' }}>{c.name}</h4>
                            <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700' }}>{c.studentIds?.length || 5} HV</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <span><i className="fa-solid fa-user-tie" style={{ width: '20px' }}></i> {c.teacher}</span>
                            <span><i className="fa-solid fa-list-check" style={{ width: '20px' }}></i> Tiến độ: <strong style={{ color: 'var(--text-main)' }}>{c.progress || 0}/{c.totalSessions || 19} buổi</strong></span>
                            <span><i className="fa-solid fa-clock" style={{ width: '20px' }}></i> {c.schedule || c.scheduleTime}</span>
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
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>{selectedReport.name}</h3>
                            <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✖</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', backgroundColor: 'white', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ padding: '16px 24px', borderRight: '1px solid var(--border-color)' }}><span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Giáo viên</span><strong style={{ fontSize: '1rem' }}>{selectedReport.teacher}</strong></div>
                            <div style={{ padding: '16px 24px', borderRight: '1px solid var(--border-color)' }}><span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Sĩ số ban đầu</span><strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{selectedReport.studentIds?.length || 5}</strong></div>
                            <div style={{ padding: '16px 24px', borderRight: '1px solid var(--border-color)' }}><span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Hiện tại</span><strong style={{ fontSize: '1rem', color: 'var(--success)' }}>{selectedReport.studentIds?.length || 5}</strong></div>
                            <div style={{ padding: '16px 24px' }}><span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Số buổi đã dạy</span><strong style={{ fontSize: '1rem', color: '#9333ea' }}>{selectedReport.progress || 0}</strong></div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '24px', flex: 1, minHeight: 0 }}>
                            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div style={{ padding: '16px', backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border-color)', fontWeight: '800' }}>Danh sách Học viên</div>
                                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }}>
                                    {reportStudents.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Lớp chưa có học viên.</p>}
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
                                    {(selectedReport.progress || 0) === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '20px' }}>Chưa có lịch sử dạy.</p>}
                                    {Array.from({ length: selectedReport.progress || 0 }).map((_, idx) => {
                                        const sessionNum = (selectedReport.progress || 0) - idx;
                                        return (
                                            <div key={sessionNum} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', backgroundColor: 'var(--bg-card)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <strong style={{ color: 'var(--primary)' }}>BUỔI {sessionNum}</strong>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--success)' }}>{reportStudents.length}/{reportStudents.length} HV</span>
                                                </div>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Đã tiến hành điểm danh chuyên cần và đồng bộ sổ điểm bài học lên hệ thống quản lý trung tâm.</p>
                                            </div>
                                        )
                                    })}
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