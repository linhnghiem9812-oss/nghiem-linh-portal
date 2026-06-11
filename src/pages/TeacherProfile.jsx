import React, { useState } from 'react';
import { useData } from '../context/DataContext'; // Kết nối đồng bộ vào lõi dữ liệu chung

function TeacherProfile() {
    // Đồng bộ hóa việc đọc và ghi dữ liệu nhân sự thông qua DataContext toàn hệ thống
    const { teachers, addTeacher } = useData();

    const [formInput, setFormInput] = useState({
        name: '', experience: '', email: '', phone: '', address: '', salary: '', status: 'Đang dạy'
    });

    // -- STATE TRỢ GIẢNG (Cục bộ) --
    const [tas, setTas] = useState([]);
    const [taForm, setTaForm] = useState({ name: '', email: '', phone: '', education: '', level: '' });

    const handleSaveTeacher = (e) => {
        e.preventDefault();
        if (!formInput.name || !formInput.email || !formInput.salary) {
            alert('Vui lòng hoàn thiện các trường dữ liệu cốt lõi (Họ tên, Email, Mức lương/Buổi)!');
            return;
        }

        const today = new Date();
        const newTeacher = {
            id: Date.now(),
            date: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
            name: formInput.name,
            experience: formInput.experience || 'Chưa cập nhật học vấn',
            email: formInput.email,
            phone: formInput.phone,
            address: formInput.address,
            salary: parseInt(formInput.salary),
            status: formInput.status
        };

        addTeacher(newTeacher); // Đẩy trực tiếp lên DataContext dùng chung toàn trung tâm
        setFormInput({ name: '', experience: '', email: '', phone: '', address: '', salary: '', status: 'Đang dạy' });
        alert('Hệ thống: Lưu thông tin hồ sơ Giáo viên mới thành công!');
    };

    const handleSaveTA = (e) => {
        e.preventDefault();
        if (!taForm.name || !taForm.phone) return alert('Vui lòng điền Họ tên và SĐT của Trợ giảng!');
        setTas([...tas, { id: Date.now(), ...taForm }]);
        setTaForm({ name: '', email: '', phone: '', education: '', level: '' });
        alert('Lưu thông tin Trợ giảng thành công!');
    };

    // Tính toán nhanh số liệu thống kê cho các hộp KPI trạng thái phía trên từ nguồn DataContext
    const countTotal = teachers.length;
    const countActive = teachers.filter(t => t.status === 'Đang dạy').length;
    const countOnLeave = teachers.filter(t => t.status === 'Tạm nghỉ').length;
    const countTerminated = teachers.filter(t => t.status === 'Đã sa thải').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 4 HỘP HIỂN THỊ TRẠNG THÁI TOÀN CỤC PHÍA TRÊN */}
            <div className="kpi-row">
                <div className="card kpi-card-simple">
                    <div><div className="kpi-card-label">Tổng số giáo viên</div><div className="kpi-card-number">{countTotal} người</div></div>
                    <div className="kpi-card-circle-icon purple"><i className="fa-solid fa-users-gear"></i></div>
                </div>
                <div className="card kpi-card-simple">
                    <div><div className="kpi-card-label">Đang giảng dạy</div><div className="kpi-card-number" style={{ color: 'var(--success)' }}>{countActive} ca</div></div>
                    <div className="kpi-card-circle-icon success" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}><i className="fa-solid fa-user-check"></i></div>
                </div>
                <div className="card kpi-card-simple">
                    <div><div className="kpi-card-label">Tạm nghỉ học/dạy</div><div className="kpi-card-number" style={{ color: 'var(--warning-text)' }}>{countOnLeave} hồ sơ</div></div>
                    <div className="kpi-card-circle-icon warning" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning-text)' }}><i className="fa-solid fa-user-clock"></i></div>
                </div>
                <div className="card kpi-card-simple">
                    <div><div className="kpi-card-label">Đã sa thải</div><div className="kpi-card-number" style={{ color: 'var(--danger-text)' }}>{countTerminated} nhân sự</div></div>
                    <div className="kpi-card-circle-icon danger" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger-text)' }}><i className="fa-solid fa-user-xmark"></i></div>
                </div>
            </div>

            {/* FORM TIẾP NHẬN HỒ SƠ GIÁO VIÊN */}
            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', color: 'var(--primary)' }}>
                    <i className="fa-solid fa-folder-plus"></i> Tiếp nhận giáo viên / Nhập thông tin nhân sự
                </h3>
                <form onSubmit={handleSaveTeacher} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Họ và tên</label>
                        <input type="text" className="form-control" value={formInput.name} onChange={(e) => setFormInput({ ...formInput, name: e.target.value })} placeholder="Ví dụ: Điệp Mạnh" required />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Email cá nhân</label>
                        <input type="email" className="form-control" value={formInput.email} onChange={(e) => setFormInput({ ...formInput, email: e.target.value })} placeholder="teacher@nghiemlinh.edu.vn" required />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Số điện thoại</label>
                        <input type="text" className="form-control" value={formInput.phone} onChange={(e) => setFormInput({ ...formInput, phone: e.target.value })} placeholder="09xxxxxxxx" />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Học vấn & Kinh nghiệm giảng dạy</label>
                        <input type="text" className="form-control" value={formInput.experience} onChange={(e) => setFormInput({ ...formInput, experience: e.target.value })} placeholder="Chứng chỉ HSK, thâm niên dạy..." />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Lương (VNĐ) / Buổi</label>
                        <input type="number" className="form-control" value={formInput.salary} onChange={(e) => setFormInput({ ...formInput, salary: e.target.value })} placeholder="350000" required />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Nơi ở hiện tại (CCCD)</label>
                        <input type="text" className="form-control" value={formInput.address} onChange={(e) => setFormInput({ ...formInput, address: e.target.value })} placeholder="Địa chỉ thường trú..." />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Trạng thái nhân sự</label>
                        <select className="form-control" value={formInput.status} onChange={(e) => setFormInput({ ...formInput, status: e.target.value })}>
                            <option value="Đang dạy">Đang dạy</option>
                            <option value="Tạm nghỉ">Tạm nghỉ</option>
                            <option value="Đã sa thải">Đã sa thải</option>
                        </select>
                    </div>
                    <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', fontWeight: '700', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                            Lưu thông tin giáo viên
                        </button>
                    </div>
                </form>
            </div>

            {/* BẢNG HIỂN THỊ DANH SÁCH GIÁO VIÊN TOÀN HỆ THỐNG */}
            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>
                    <i className="fa-solid fa-table-list"></i> Bảng hiển thị thông tin nhân sự giáo viên chi tiết
                </h3>
                <div className="modal-table-container">
                    <table className="modal-table">
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-app)', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>STT</th>
                                <th style={{ padding: '12px' }}>Tên Họ và Tên</th>
                                <th style={{ padding: '12px' }}>Học vấn và kinh nghiệm</th>
                                <th style={{ padding: '12px' }}>Lương (VNĐ)</th>
                                <th style={{ padding: '12px' }}>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((t, idx) => (
                                <tr key={t.id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px', fontWeight: '700' }}>{idx + 1}</td>
                                    <td style={{ padding: '12px' }}>
                                        <strong style={{ color: 'var(--text-main)', display: 'block' }}>{t.name}</strong>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.email || 'N/A'} {t.phone && `| 📞 ${t.phone}`}</span>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>{t.experience}</td>
                                    <td style={{ padding: '12px', fontWeight: '700', color: 'var(--primary)' }}>
                                        {t.salary ? `${t.salary.toLocaleString('vi-VN')} VNĐ` : '350.000 VNĐ'}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700',
                                            backgroundColor: t.status === 'Đang dạy' ? 'var(--success-light)' : t.status === 'Tạm nghỉ' ? 'var(--warning-light)' : 'var(--danger-light)',
                                            color: t.status === 'Đang dạy' ? 'var(--success)' : t.status === 'Tạm nghỉ' ? 'var(--warning-text)' : 'var(--danger-text)'
                                        }}>
                                            {t.status || 'Đang dạy'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ============================================================== */}
            {/* PHẦN MỚI: THÔNG TIN TRỢ GIẢNG ĐƯỢC CHÈN DƯỚI THÔNG TIN GIÁO VIÊN */}
            {/* ============================================================== */}

            <div className="card" style={{ padding: '24px', borderTop: '4px solid #10b981' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', color: '#10b981' }}>
                    <i className="fa-solid fa-user-graduate"></i> Tiếp nhận thông tin Trợ giảng (TA)
                </h3>
                <form onSubmit={handleSaveTA} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Họ & Tên</label><input type="text" className="form-control" value={taForm.name} onChange={(e) => setTaForm({ ...taForm, name: e.target.value })} required /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Email</label><input type="email" className="form-control" value={taForm.email} onChange={(e) => setTaForm({ ...taForm, email: e.target.value })} /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Số điện thoại (Zalo)</label><input type="text" className="form-control" value={taForm.phone} onChange={(e) => setTaForm({ ...taForm, phone: e.target.value })} required /></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Học vấn</label><input type="text" className="form-control" value={taForm.education} onChange={(e) => setTaForm({ ...taForm, education: e.target.value })} placeholder="VD: Sinh viên ĐH Ngoại ngữ..." /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Trình độ</label><input type="text" className="form-control" value={taForm.level} onChange={(e) => setTaForm({ ...taForm, level: e.target.value })} placeholder="VD: HSK 5, IELTS 7.0..." /></div>
                    <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}><button type="submit" className="btn" style={{ padding: '12px 32px', fontWeight: '700', backgroundColor: '#10b981', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Lưu thông tin Trợ giảng</button></div>
                </form>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>Bảng hiển thị thông tin Trợ giảng</h3>
                <div className="modal-table-container">
                    <table className="modal-table">
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-app)', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>STT</th><th style={{ padding: '12px' }}>Họ & Tên</th>
                                <th style={{ padding: '12px' }}>Liên hệ (SĐT / Email)</th><th style={{ padding: '12px' }}>Học vấn</th><th style={{ padding: '12px' }}>Trình độ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tas.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Chưa có dữ liệu trợ giảng.</td></tr>}
                            {tas.map((t, idx) => (
                                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px', fontWeight: '700' }}>{idx + 1}</td>
                                    <td style={{ padding: '12px', fontWeight: '700', color: 'var(--text-main)' }}>{t.name}</td>
                                    <td style={{ padding: '12px' }}><span style={{ display: 'block', fontSize: '0.85rem' }}>Zalo: {t.phone}</span><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.email}</span></td>
                                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>{t.education}</td>
                                    <td style={{ padding: '12px', fontWeight: '700', color: '#10b981' }}>{t.level}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TeacherProfile;