import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function FinanceLog() {
    const [invoices, setInvoices] = useState([]);

    const todayStr = new Date().toISOString().split('T')[0];
    const [formInvoice, setFormInvoice] = useState({
        date: todayStr, studentName: '', course: 'Khóa học HSK 1', amount: '', amountJpy: '', amountCny: '', method: 'Chuyển khoản ngân hàng', notes: ''
    });

    const [editingInvoice, setEditingInvoice] = useState(null);

    useEffect(() => {
        api.get('/invoices')
            .then(res => {
                const sortedData = res.data.sort((a, b) => b.id - a.id);
                setInvoices(sortedData);
            })
            .catch(() => console.log('Chưa có hóa đơn trong CSDL.'));
    }, []);

    const handleAddInvoice = async (e) => {
        e.preventDefault();

        if (!formInvoice.studentName || (!formInvoice.amount && !formInvoice.amountJpy && !formInvoice.amountCny)) {
            alert('Vui lòng điền tên học viên và ít nhất 1 loại số tiền (VNĐ, JPY hoặc CNY)!');
            return;
        }

        const dateParts = formInvoice.date.split('-');
        const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : formInvoice.date;

        const newInv = {
            date: formattedDate,
            studentName: formInvoice.studentName,
            course: formInvoice.course,
            amount: parseInt(formInvoice.amount) || 0,
            amountJpy: parseInt(formInvoice.amountJpy) || 0,
            amountCny: parseInt(formInvoice.amountCny) || 0,
            method: formInvoice.method,
            notes: formInvoice.notes,
            status: 'Đã thanh toán'
        };

        try {
            const res = await api.post('/invoices', newInv);
            setInvoices([res.data, ...invoices]);
            setFormInvoice({ date: todayStr, studentName: '', course: 'Khóa học HSK 1', amount: '', amountJpy: '', amountCny: '', method: 'Chuyển khoản ngân hàng', notes: '' });
            alert('Hệ thống: Ghi nhận hóa đơn thu học phí thành công!');
        } catch (error) {
            alert('Lỗi lưu hóa đơn vào CSDL!');
        }
    };

    const handleSaveEdit = async () => {
        try {
            const payload = {
                ...editingInvoice,
                amount: parseInt(editingInvoice.amount) || 0,
                amountJpy: parseInt(editingInvoice.amountJpy) || 0,
                amountCny: parseInt(editingInvoice.amountCny) || 0
            };
            const res = await api.put(`/invoices/${editingInvoice.id}`, payload);
            setInvoices(invoices.map(inv => inv.id === editingInvoice.id ? res.data : inv));
            setEditingInvoice(null);
            alert('Cập nhật hóa đơn thành công!');
        } catch (error) {
            alert('Lỗi cập nhật CSDL!');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Cảnh báo: Việc xóa hóa đơn sẽ làm thay đổi báo cáo doanh thu. Xác nhận xóa?')) {
            try {
                await api.delete(`/invoices/${id}`);
                setInvoices(invoices.filter(inv => inv.id !== id));
                alert('Đã xóa hóa đơn!');
            } catch (error) {
                alert('Lỗi khi xóa hóa đơn!');
            }
        }
    };

    const totalCollectedVnd = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalCollectedJpy = invoices.reduce((sum, inv) => sum + (inv.amountJpy || 0), 0);
    const totalCollectedCny = invoices.reduce((sum, inv) => sum + (inv.amountCny || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease-out' }}>

            <div className="card" style={{ padding: '20px', backgroundColor: 'var(--primary-light)', borderColor: 'var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>Tổng dòng tiền học phí đã thu</span>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginTop: '4px', flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>
                                {totalCollectedVnd.toLocaleString('vi-VN')} VNĐ
                            </h2>
                            {totalCollectedJpy > 0 && (
                                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#059669', margin: 0, paddingBottom: '2px' }}>
                                    + {totalCollectedJpy.toLocaleString('vi-VN')} ¥ (JPY)
                                </h2>
                            )}
                            {totalCollectedCny > 0 && (
                                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ea580c', margin: 0, paddingBottom: '2px' }}>
                                    + {totalCollectedCny.toLocaleString('vi-VN')} ¥ (CNY)
                                </h2>
                            )}
                        </div>
                    </div>
                    <i className="fa-solid fa-vault" style={{ fontSize: '2.5rem', color: 'var(--primary)', opacity: 0.3 }}></i>
                </div>
            </div>

            <div className="my-portal-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
                <div className="portal-left-column">
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', color: 'var(--primary)' }}>
                            <i className="fa-solid fa-file-invoice-dollar"></i> Lập hóa đơn thu phí
                        </h3>
                        <form onSubmit={handleAddInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ngày nộp tiền</label>
                                <input type="date" className="form-control" value={formInvoice.date} onChange={e => setFormInvoice({ ...formInvoice, date: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Tên học viên đóng phí</label>
                                <input type="text" className="form-control" placeholder="Ví dụ: Nguyễn Văn A" value={formInvoice.studentName} onChange={e => setFormInvoice({ ...formInvoice, studentName: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Chương trình đăng ký</label>
                                <select className="form-control" value={formInvoice.course} onChange={e => setFormInvoice({ ...formInvoice, course: e.target.value })}>
                                    <option value="Khóa học HSK 1">Khóa học HSK 1</option><option value="Khóa học HSK 2">Khóa học HSK 2</option><option value="Khóa học HSK 3">Khóa học HSK 3</option><option value="Lớp VIP 1-1">Lớp VIP 1-1</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)' }}>Tiền VNĐ</label>
                                    <input type="number" className="form-control" placeholder="0" value={formInvoice.amount} onChange={e => setFormInvoice({ ...formInvoice, amount: e.target.value })} style={{ borderColor: 'var(--primary)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#059669' }}>Tiền JPY (Yên)</label>
                                    <input type="number" className="form-control" placeholder="0" value={formInvoice.amountJpy} onChange={e => setFormInvoice({ ...formInvoice, amountJpy: e.target.value })} style={{ borderColor: '#10b981' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#ea580c' }}>Tiền CNY (Tệ)</label>
                                    <input type="number" className="form-control" placeholder="0" value={formInvoice.amountCny} onChange={e => setFormInvoice({ ...formInvoice, amountCny: e.target.value })} style={{ borderColor: '#ea580c' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Hình thức thanh toán</label>
                                <select className="form-control" value={formInvoice.method} onChange={e => setFormInvoice({ ...formInvoice, method: e.target.value })}>
                                    <option value="Chuyển khoản ngân hàng">Chuyển khoản ngân hàng</option><option value="Tiền mặt tại quầy">Tiền mặt tại quầy</option><option value="Quẹt thẻ POS">Quẹt thẻ POS</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ghi chú thêm</label>
                                <textarea className="form-control" rows="2" placeholder="Ví dụ: Đóng học phí đợt 1..." value={formInvoice.notes} onChange={e => setFormInvoice({ ...formInvoice, notes: e.target.value })} style={{ resize: 'vertical' }}></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontWeight: '700', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', cursor: 'pointer', marginTop: '6px' }}>
                                XUẤT HÓA ĐƠN THU TIỀN
                            </button>
                        </form>
                    </div>
                </div>

                <div className="portal-right-column">
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>Nhật ký giao dịch dòng tiền</h3>
                        <div className="modal-table-container" style={{ overflowX: 'auto' }}>
                            <table className="modal-table" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--bg-app)' }}>
                                        <th style={{ padding: '12px' }}>Mã / Ngày nộp</th>
                                        <th style={{ padding: '12px' }}>Học viên / Nội dung</th>
                                        <th style={{ padding: '12px' }}>Số tiền đã nộp</th>
                                        <th style={{ padding: '12px' }}>Trạng thái</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Chưa có hóa đơn nào được ghi nhận.</td></tr>}
                                    {invoices.map(inv => (
                                        <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '14px 12px' }}>
                                                <strong>INV-{inv.id}</strong><span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.date}</span>
                                            </td>
                                            <td style={{ padding: '14px 12px' }}>
                                                <strong style={{ color: 'var(--text-main)' }}>{inv.studentName}</strong>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.course} ({inv.method})</span>
                                                {inv.notes && <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>Lưu ý: {inv.notes}</span>}
                                            </td>
                                            <td style={{ padding: '14px 12px' }}>
                                                {(inv.amount > 0 || (!inv.amount && !inv.amountJpy && !inv.amountCny)) && (
                                                    <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{(inv.amount || 0).toLocaleString('vi-VN')} đ</div>
                                                )}
                                                {inv.amountJpy > 0 && (
                                                    <div style={{ fontWeight: '700', color: '#059669', fontSize: '0.85rem', marginTop: '2px' }}>{inv.amountJpy.toLocaleString('vi-VN')} ¥ (JPY)</div>
                                                )}
                                                {inv.amountCny > 0 && (
                                                    <div style={{ fontWeight: '700', color: '#ea580c', fontSize: '0.85rem', marginTop: '2px' }}>{inv.amountCny.toLocaleString('vi-VN')} ¥ (CNY)</div>
                                                )}
                                            </td>
                                            <td style={{ padding: '14px 12px' }}><span className="badge-studying" style={{ backgroundColor: '#dcfce7', color: '#166534', fontWeight: '800' }}>{inv.status}</span></td>
                                            <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button title="Sửa" onClick={() => setEditingInvoice(inv)} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: '#475569' }}><i className="fa-solid fa-pen"></i></button>
                                                    <button title="Xóa" onClick={() => handleDelete(inv.id)} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: '#b91c1c' }}><i className="fa-solid fa-trash"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {editingInvoice && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ width: '550px', backgroundColor: 'white', padding: '24px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                            <h3 style={{ fontWeight: '800', color: 'var(--primary)' }}><i className="fa-solid fa-file-invoice-dollar"></i> Sửa Hóa Đơn INV-{editingInvoice.id}</h3>
                            <button onClick={() => setEditingInvoice(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✖</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ngày nộp (DD/MM/YYYY)</label>
                                <input type="text" className="form-control" value={editingInvoice.date || ''} onChange={(e) => setEditingInvoice({ ...editingInvoice, date: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Học viên</label>
                                <input type="text" className="form-control" value={editingInvoice.studentName || ''} onChange={(e) => setEditingInvoice({ ...editingInvoice, studentName: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Khóa học / Nội dung</label>
                                <input type="text" className="form-control" value={editingInvoice.course || ''} onChange={(e) => setEditingInvoice({ ...editingInvoice, course: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Số tiền (VNĐ)</label>
                                    <input type="number" className="form-control" value={editingInvoice.amount || ''} onChange={(e) => setEditingInvoice({ ...editingInvoice, amount: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Số tiền (JPY)</label>
                                    <input type="number" className="form-control" value={editingInvoice.amountJpy || ''} onChange={(e) => setEditingInvoice({ ...editingInvoice, amountJpy: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Số tiền (CNY)</label>
                                    <input type="number" className="form-control" value={editingInvoice.amountCny || ''} onChange={(e) => setEditingInvoice({ ...editingInvoice, amountCny: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Hình thức</label>
                                <select className="form-control" value={editingInvoice.method} onChange={(e) => setEditingInvoice({ ...editingInvoice, method: e.target.value })}>
                                    <option value="Chuyển khoản ngân hàng">Chuyển khoản ngân hàng</option><option value="Tiền mặt tại quầy">Tiền mặt tại quầy</option><option value="Quẹt thẻ POS">Quẹt thẻ POS</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ghi chú thêm</label>
                                <textarea className="form-control" rows="2" value={editingInvoice.notes || ''} onChange={(e) => setEditingInvoice({ ...editingInvoice, notes: e.target.value })} style={{ resize: 'vertical' }}></textarea>
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

export default FinanceLog;