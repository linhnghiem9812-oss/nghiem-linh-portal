import React, { useState } from 'react';

function FinanceLog() {
    // Tái sử dụng mảng dữ liệu Hóa đơn gốc từ app.js
    const [invoices, setInvoices] = useState([
        { id: 'INV-1024', date: '05/05/2026', studentName: 'Trần Thị Minh Anh', course: 'Khóa học HSK 2', amount: 3500000, method: 'Chuyển khoản ngân hàng', status: 'Đã hoàn thành' },
        { id: 'INV-1025', date: '06/05/2026', studentName: 'Hồ Hàn Giang', course: 'Khóa học HSK 2', amount: 3500000, method: 'Tiền mặt tại quầy', status: 'Đã thanh toán' }
    ]);

    const [formInvoice, setFormInvoice] = useState({ studentName: '', course: 'Khóa học HSK 1', amount: '', method: 'Chuyển khoản ngân hàng' });

    const handleAddInvoice = (e) => {
        e.preventDefault();
        if (!formInvoice.studentName || !formInvoice.amount) return;

        const today = new Date();
        const newInv = {
            id: 'INV-' + Date.now().toString().slice(-4),
            date: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
            studentName: formInvoice.studentName,
            course: formInvoice.course,
            amount: parseInt(formInvoice.amount),
            method: formInvoice.method,
            status: 'Đã thanh toán'
        };

        setInvoices([newInv, ...invoices]);
        setFormInvoice({ studentName: '', course: 'Khóa học HSK 1', amount: '', method: 'Chuyển khoản ngân hàng' });
        alert('Hệ thống: Ghi nhận hóa đơn thu học phí thành công!');
    };

    const totalCollected = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* TỔNG QUAN DOANH THU THU THỰC TẾ */}
            <div className="card" style={{ padding: '20px', backgroundColor: 'var(--primary-light)', borderColor: 'var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>Tổng dòng tiền học phí đã thu</span>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>{totalCollected.toLocaleString('vi-VN')} VNĐ</h2>
                    </div>
                    <i className="fa-solid fa-vault" style={{ fontSize: '2.5rem', color: 'var(--primary)', opacity: 0.3 }}></i>
                </div>
            </div>

            <div className="my-portal-grid">
                {/* FORM GHI NHẬN HÓA ĐƠN THU TIỀN */}
                <div className="portal-left-column">
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', color: 'var(--primary)' }}>
                            <i className="fa-solid fa-file-invoice-dollar"></i> Lập hóa đơn thu phí
                        </h3>
                        <form onSubmit={handleAddInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Tên học viên đóng phí</label>
                                <input type="text" className="form-control" placeholder="Nguyễn Văn A" value={formInvoice.studentName} onChange={e => setFormInvoice({ ...formInvoice, studentName: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Chương trình đăng ký</label>
                                <select className="form-control" value={formInvoice.course} onChange={e => setFormInvoice({ ...formInvoice, course: e.target.value })}>
                                    <option value="Khóa học HSK 1">Khóa học HSK 1</option>
                                    <option value="Khóa học HSK 2">Khóa học HSK 2</option>
                                    <option value="Khóa học HSK 3">Khóa học HSK 3</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Số tiền nộp (VNĐ)</label>
                                <input type="number" className="form-control" placeholder="3500000" value={formInvoice.amount} onChange={e => setFormInvoice({ ...formInvoice, amount: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>Hình thức thanh toán</label>
                                <select className="form-control" value={formInvoice.method} onChange={e => setFormInvoice({ ...formInvoice, method: e.target.value })}>
                                    <option value="Chuyển khoản ngân hàng">Chuyển khoản ngân hàng</option>
                                    <option value="Tiền mặt tại quầy">Tiền mặt tại quầy</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontWeight: '700', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', cursor: 'pointer', marginTop: '6px' }}>
                                XUẤT HÓA ĐƠN THU TIỀN
                            </button>
                        </form>
                    </div>
                </div>

                {/* BẢNG NHẬT KÝ HÓA ĐƠN CHI TIẾT */}
                <div className="portal-right-column">
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>Nhật ký giao dịch dòng tiền</h3>
                        <div className="modal-table-container">
                            <table className="modal-table">
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--bg-app)' }}>
                                        <th style={{ padding: '12px' }}>Mã / Ngày</th>
                                        <th style={{ padding: '12px' }}>Học viên / Nội dung</th>
                                        <th style={{ padding: '12px' }}>Số tiền</th>
                                        <th style={{ padding: '12px' }}>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map(inv => (
                                        <tr key={inv.id}>
                                            <td style={{ padding: '14px 12px' }}>
                                                <strong>{inv.id}</strong>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.date}</span>
                                            </td>
                                            <td style={{ padding: '14px 12px' }}>
                                                <strong style={{ color: 'var(--text-main)' }}>{inv.studentName}</strong>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.course} ({inv.method})</span>
                                            </td>
                                            <td style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--primary)' }}>{inv.amount.toLocaleString('vi-VN')} đ</td>
                                            <td style={{ padding: '14px 12px' }}>
                                                <span className="badge-studying">{inv.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FinanceLog;