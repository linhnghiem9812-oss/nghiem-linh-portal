import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function MyClassActive() {
    const { currentRole } = useAuth();
    const [selectedSession, setSelectedSession] = useState(1);

    // Quản lý mảng điểm danh chuyên cần thừa kế từ app.js gốc
    const [studentsAttendance, setStudentsAttendance] = useState([
        { id: 'STU-01', name: 'Cao Ngọc Diệp', status: 'present', flag: false, note: '' },
        { id: 'STU-02', name: 'Đỗ Hà Linh', status: 'present', flag: false, note: '' },
        { id: 'STU-03', name: 'Nguyễn Minh Hải', status: 'absent', flag: true, note: 'Nghỉ không phép' }
    ]);

    const handleAttendanceChange = (id, newStatus) => {
        setStudentsAttendance(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    };

    const handleToggleFlag = (id) => {
        setStudentsAttendance(prev => prev.map(s => s.id === id ? { ...s, flag: !s.flag } : s));
    };

    const markAllPresent = () => {
        setStudentsAttendance(prev => prev.map(s => ({ ...s, status: 'present' })));
        alert('Hệ thống: Đã ghi nhận cả lớp có mặt đông đủ!');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* THÔNG TIN LỚP ĐANG CHỌN TƯƠNG TÁC */}
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <span className="badge-studying" style={{ marginBottom: '8px', display: 'inline-block' }}>LỚP CHÍNH THỨC</span>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e3a8a' }}>HSK1-357-6 (Lớp Nhóm Tiêu chuẩn)</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>📅 Giờ học: 20:00 - 21:30 | Giáo viên phụ trách: Đoàn Đăng Khoa</p>
                    </div>
                    <div style={{ textAlign: 'right', padding: '12px 20px', backgroundColor: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        {/* THAY THẾ CHỮ LƯƠNG BẰNG HỌC PHÍ/BUỔI ĐỐI VỚI VAI TRÒ GIÁO VIÊN/ADMIN */}
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Học phí / Buổi dạy</span>
                        <strong style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: '800' }}>350.000 VNĐ</strong>
                    </div>
                </div>

                {/* NÚT TÀI NGUYÊN PADLET TRÍCH XUẤT TỪ FILE CŨ */}
                <div className="resource-box" style={{ marginTop: '16px' }} onClick={() => window.open('https://padlet.com', '_blank')}>
                    <span><i className="fa-solid fa-bookmark"></i> Hộp lưu trữ tài nguyên & Giáo trình bổ trợ lớp học (Padlet Link)</span>
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </div>
            </div>

            {/* LƯỚI 19 BUỔI HỌC LỘ TRÌNH ĐƯỢC MÔ ĐUN HÓA ĐỘNG */}
            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>Lộ trình & Nhật ký tiến độ giảng dạy</h3>
                <div className="session-grid-container">
                    {Array.from({ length: 19 }, (_, i) => i + 1).map((sessionNum) => {
                        // Bảo lưu hardcode logic nghiệp vụ từ app.js cũ: Buổi số 4 là buổi nghỉ hủy ca
                        const isCancelled = sessionNum === 4;
                        const isSubmitted = sessionNum < 4;
                        const isSelected = selectedSession === sessionNum;

                        let cardClass = "session-btn-card";
                        if (isCancelled) cardClass += " session-cancelled";
                        else if (isSubmitted) cardClass += " session-submitted-ga";
                        if (isSelected && !isCancelled) cardClass += " session-active-selected";

                        return (
                            <div key={sessionNum} className={cardClass} onClick={() => !isCancelled && setSelectedSession(sessionNum)}>
                                <strong>Buổi {sessionNum}</strong>
                                <span>{isCancelled ? "HỦY CA" : `BÀI ${sessionNum}`}</span>
                                {isSubmitted && !isCancelled && <span className="session-submitted-ga-badge">Đã dạy</span>}
                                {isCancelled && <span className="session-cancelled-badge">Nghỉ lễ</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* DIỆN TÍCH ĐIỂM DANH CHUYÊN CẦN CHO BUỔI ĐANG CHỌN */}
            <div className="card" style={{ padding: '24px' }}>
                <div className="attendance-header-row">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>
                        <i className="fa-solid fa-user-check" style={{ color: 'var(--primary)', marginRight: '6px' }}></i>
                        Sổ điểm danh chuyên cần: Buổi {selectedSession}
                    </h3>
                    <button className="btn-all-present" onClick={markAllPresent}>TẤT CẢ CÓ MẶT</button>
                </div>

                <div className="attendance-students-grid">
                    {studentsAttendance.map((student) => (
                        <div className="attendance-student-card" key={student.id}>
                            <div className="student-card-left">
                                <div className="student-avatar-letter">{student.name.charAt(0)}</div>
                                <div className="student-card-info">
                                    <h5>{student.name}</h5>
                                    <div className="student-attendance-radio-group">
                                        <label className="attendance-radio-label">
                                            <input type="radio" name={`att-${student.id}`} checked={student.status === 'present'} onChange={() => handleAttendanceChange(student.id, 'present')} /> Có mặt
                                        </label>
                                        <label className="attendance-radio-label">
                                            <input type="radio" name={`att-${student.id}`} checked={student.status === 'absent'} onChange={() => handleAttendanceChange(student.id, 'absent')} /> Vắng
                                        </label>
                                    </div>
                                </div>
                            </div>
                            {/* CỜ THEO DÕI NGUY HIỂM / CHÚ Ý ĐẶC BIỆT TỪ FILE GỐC */}
                            <i className={`fa-solid fa-flag attendance-flag-icon ${student.flag ? 'flagged' : ''}`} onClick={() => handleToggleFlag(student.id)} title="Đánh dấu học viên cần chú ý đặc biệt"></i>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button className="btn btn-primary" onClick={() => alert(`Hệ thống: Khóa sổ điểm danh và đồng bộ dữ liệu Buổi ${selectedSession} lên hệ thống quản lý thành công!`)} style={{ padding: '12px 32px', fontWeight: '700', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                        LƯU SỔ ĐIỂM DANH BUỔI {selectedSession}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MyClassActive;