import React, { useState } from 'react';
import { useData } from '../context/DataContext';

function Classes() {
    const { classes, addClass } = useData();

    const [formClass, setFormClass] = useState({
        name: '',
        teacher: 'Đoàn Đăng Khoa',
        padletUrl: '',
        classType: 'Lớp Nhóm',
        level: 'HSK 1',
        sessionFee: '', // Đã thay thế chữ Lương bằng Học phí/Buổi
        startDate: '',
        totalSessions: 12,
        scheduleTime: ''
    });

    const handleCreateClass = (e) => {
        e.preventDefault();
        if (!formClass.name || !formClass.sessionFee) {
            alert('Vui lòng điền Tên lớp học và cấu hình Học phí/Buổi!');
            return;
        }

        const newClassObj = {
            id: 'hsk-' + Date.now(),
            name: formClass.name,
            teacher: formClass.teacher + ' (admin)',
            progress: 0,
            totalSessions: parseInt(formClass.totalSessions),
            schedule: formClass.scheduleTime || '20:00 - 21:30'
        };

        addClass(newClassObj);
        alert(`Hệ thống: Khởi tạo thành công lớp học ${formClass.name}!`);
        setFormClass({ name: '', teacher: 'Đoàn Đăng Khoa', padletUrl: '', classType: 'Lớp Nhóm', level: 'HSK 1', sessionFee: '', startDate: '', totalSessions: 12, scheduleTime: '' });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* KHU VỰC CẤU HÌNH LỚP HỌC (Hình 5.1) */}
            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>
                    <i className="fa-solid fa-school" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
                    Quản lý Lớp học
                </h3>

                <form onSubmit={handleCreateClass} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>MÃ/TÊN LỚP</label>
                        <input type="text" className="form-control" value={formClass.name} onChange={(e) => setFormClass({ ...formClass, name: e.target.value })} placeholder="VD: HSK1-K35" />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>GIÁO VIÊN PHỤ TRÁCH</label>
                        <select className="form-control" value={formClass.teacher} onChange={(e) => setFormClass({ ...formClass, teacher: e.target.value })}>
                            <option value="Đoàn Đăng Khoa">Đoàn Đăng Khoa (admin)</option>
                            <option value="Nguyễn Đức Trung">Nguyễn Đức Trung (admin)</option>
                        </select>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>TÀI NGUYÊN & GIÁO TRÌNH (LINK PADLET TÀI LIỆU)</label>
                        <input type="text" className="form-control" value={formClass.padletUrl} onChange={(e) => setFormClass({ ...formClass, padletUrl: e.target.value })} placeholder="https://padlet.com/..." />
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ gridColumn: 'span 3', fontWeight: '700', fontSize: '0.85rem' }}>📅 Cấu hình Lịch học</div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>LOẠI HÌNH LỚP (*)</label>
                            <select className="form-control" value={formClass.classType} onChange={(e) => setFormClass({ ...formClass, classType: e.target.value })} style={{ background: 'white' }}>
                                <option value="Lớp Nhóm">Lớp Nhóm</option>
                                <option value="Lớp VIP 1-1">Lớp VIP 1-1</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>CẤP ĐỘ LỚP (*)</label>
                            <select className="form-control" value={formClass.level} onChange={(e) => setFormClass({ ...formClass, level: e.target.value })} style={{ background: 'white' }}>
                                <option value="HSK 1">HSK 1</option>
                                <option value="HSK 2">HSK 2</option>
                                <option value="HSK 3">HSK 3</option>
                            </select>
                        </div>
                        {/* THAY THẾ CHỮ LƯƠNG BẰNG HỌC PHÍ/BUỔI THEO YÊU CẦU NGHIỆM VỤ ĐẶC BIỆT */}
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)' }}>HỌC PHÍ / BUỔI (VNĐ)</label>
                            <input type="number" className="form-control" value={formClass.sessionFee} onChange={(e) => setFormClass({ ...formClass, sessionFee: e.target.value })} placeholder="VD: 200000" style={{ background: 'white', borderColor: 'var(--primary)' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>NGÀY KHAI GIẢNG</label>
                            <input type="date" className="form-control" value={formClass.startDate} onChange={(e) => setFormClass({ ...formClass, startDate: e.target.value })} style={{ background: 'white' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>TỔNG SỐ BUỔI</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="number" className="form-control" value={formClass.totalSessions} onChange={(e) => setFormClass({ ...formClass, totalSessions: e.target.value })} style={{ background: 'white', textAlign: 'center' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>GIỜ HỌC</label>
                            <input type="text" className="form-control" value={formClass.scheduleTime} onChange={(e) => setFormClass({ ...formClass, scheduleTime: e.target.value })} placeholder="VD: 19:30 - 21:00" style={{ background: 'white' }} />
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 36px', fontWeight: '700', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                            TẠO LỚP HỌC MỚI
                        </button>
                    </div>
                </form>
            </div>

            {/* DANH SÁCH LỚP HỌC (Hình 5.2) */}
            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px' }}>Danh sách Lớp học</h3>
                <div className="modal-table-container">
                    <table className="modal-table">
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-app)', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>THÔNG TIN LỚP</th>
                                <th style={{ padding: '12px' }}>GIÁO TRÌNH & LỊCH</th>
                                <th style={{ padding: '12px' }}>SĨ SỐ</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map((c) => (
                                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '16px 12px' }}>
                                        <strong style={{ fontSize: '1.05rem', color: '#1e3a8a', display: 'block' }}>{c.name}</strong>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👤 Giảng viên: {c.teacher}</span>
                                    </td>
                                    <td style={{ padding: '16px 12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <div>⏰ Giờ học: <strong>{c.schedule}</strong></div>
                                        <div>📅 Khai giảng: 10/3/2026</div>
                                    </td>
                                    <td style={{ padding: '16px 12px' }}>
                                        <span className="hsk-student-count-badge">9 HV</span>
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                            <button style={{ background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Sửa"><i className="fa-solid fa-pen"></i></button>
                                            <button style={{ background: 'none', cursor: 'pointer', color: 'var(--danger)' }} title="Xóa"><i className="fa-solid fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Classes;