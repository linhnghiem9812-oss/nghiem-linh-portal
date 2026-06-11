import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function CRM() {
    const { addCustomer } = useData();
    const [localCustomers, setLocalCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Lấy ngày hôm nay dưới định dạng hiển thị đẹp (DD/MM/YYYY) làm mặc định cho Ngày nhận
    const today = new Date();
    const defaultDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

    // Đã xóa email, thêm saleInCharge, receiveDate, totalSessions
    const [formData, setFormData] = useState({
        fbName: '', name: '', phone: '', dob: '', language: 'Tiếng Trung',
        customerType: 'Mới', source: 'Facebook', course: '', level: '',
        potential: 'Trung bình', status: 'Mới', fee: '', totalSessions: '', lastContact: '',
        notes: '', nextAction: '', assignClass: '', groupType: 'Lớp Nhóm', country: 'Việt Nam',
        receiveDate: defaultDate, saleInCharge: ''
    });

    useEffect(() => {
        api.get('/customers')
            .then(res => setLocalCustomers(res.data))
            .catch(() => console.log("Không thể nạp dữ liệu khách hàng."));
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Hàm thông minh: Tự động nắn lại định dạng ngày tháng (từ 15/8/98 thành 15/08/1998)
    const formatToStandardDate = (str) => {
        if (!str) return '';
        const parts = str.split(/[-/.]/);
        if (parts.length === 3) {
            let [d, m, y] = parts;
            d = d.padStart(2, '0');
            m = m.padStart(2, '0');
            if (y.length === 2) y = parseInt(y) > 30 ? `19${y}` : `20${y}`;
            return `${d}/${m}/${y}`;
        }
        return str;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.phone) {
            alert('Vui lòng nhập Số điện thoại liên hệ!');
            return;
        }

        const newRecord = {
            fbName: formData.fbName,
            name: formData.name,
            phone: formData.phone,
            dob: formatToStandardDate(formData.dob), // Định dạng lại Ngày sinh
            language: formData.language,
            customerType: formData.customerType,
            source: formData.source,
            course: formData.course,
            type: formData.groupType,
            level: formData.level || 'Chưa xác định',
            potential: formData.potential,
            status: formData.status,
            fee: formData.fee ? parseInt(formData.fee) : 0,
            totalSessions: formData.totalSessions, // Đẩy thêm Số buổi
            lastContact: formData.lastContact,
            notes: formData.notes,
            nextAction: formData.nextAction,
            assignClass: formData.assignClass,
            country: formData.country,
            receiveDate: formatToStandardDate(formData.receiveDate), // Định dạng lại Ngày nhận
            saleInCharge: formData.saleInCharge // Đẩy thêm Tên Sale
        };

        try {
            const res = await api.post('/customers', newRecord);
            setLocalCustomers([res.data, ...localCustomers]);
            if (addCustomer) addCustomer(res.data);
            alert('Thêm khách hàng thành công!');

            // Reset form
            setFormData({ fbName: '', name: '', phone: '', dob: '', language: 'Tiếng Trung', customerType: 'Mới', source: 'Facebook', course: '', level: '', potential: 'Trung bình', status: 'Mới', fee: '', totalSessions: '', lastContact: '', notes: '', nextAction: '', assignClass: '', groupType: 'Lớp Nhóm', country: 'Việt Nam', receiveDate: defaultDate, saleInCharge: '' });
        } catch (err) {
            alert('Lỗi khi đẩy khách hàng lên database. Vui lòng kiểm tra lại!');
        }
    };

    const handleSaveEdit = async () => {
        try {
            const res = await api.put(`/customers/${selectedCustomer.id}`, selectedCustomer);
            setLocalCustomers(prev => prev.map(c => c.id === res.data.id ? res.data : c));
            alert('Lưu thay đổi hồ sơ khách hàng thành công!');
            setIsEditing(false);
        } catch (error) {
            alert('Lỗi cập nhật CSDL.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
            try {
                await api.delete(`/customers/${id}`);
                setLocalCustomers(prev => prev.filter(c => c.id !== id));
                setSelectedCustomer(null);
            } catch (e) {
                alert('Lỗi xóa khách hàng.');
            }
        }
    };

    const filteredCustomers = localCustomers.filter(c =>
        (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.fbName && c.fbName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', position: 'relative' }}>
            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', color: '#1e3a8a' }}>
                    <i className="fa-solid fa-user-plus" style={{ marginRight: '8px' }}></i> Tiếp nhận Khách hàng
                </h3>
                <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>

                    {/* CỘT 1 */}
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>TÊN FB</label><input type="text" name="fbName" className="form-control" value={formData.fbName} onChange={handleInputChange} placeholder="Nhập tên FB..." /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>NGÀY NHẬN</label><input type="text" name="receiveDate" className="form-control" value={formData.receiveDate} onChange={handleInputChange} placeholder="VD: 11/06/2026" /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>NGƯỜI SALE TIẾP NHẬN</label><input type="text" name="saleInCharge" className="form-control" value={formData.saleInCharge} onChange={handleInputChange} placeholder="Tên Sale..." /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>SĐT (Zalo) (*)</label><input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleInputChange} required style={{ borderColor: 'var(--primary)' }} /></div>

                    {/* CỘT 2 */}
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>NGÀY SINH (Tự nhập)</label><input type="text" name="dob" className="form-control" value={formData.dob} onChange={handleInputChange} placeholder="VD: 15/08/1998" /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>HỌ TÊN</label><input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} placeholder="Không bắt buộc" /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>QUỐC GIA</label><input type="text" name="country" className="form-control" value={formData.country} onChange={handleInputChange} placeholder="Ví dụ: Việt Nam" /></div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>LOẠI NGÔN NGỮ</label>
                        <select name="language" className="form-control" value={formData.language} onChange={handleInputChange}>
                            <option value="Tiếng Trung">Tiếng Trung</option><option value="Tiếng Nhật">Tiếng Nhật</option><option value="Tiếng Anh">Tiếng Anh</option>
                        </select>
                    </div>

                    {/* CỘT 3 */}
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>KHÓA HỌC</label><input type="text" name="course" className="form-control" value={formData.course} onChange={handleInputChange} placeholder="Tự nhập tên khóa học..." /></div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>LOẠI KHÁCH</label>
                        <select name="customerType" className="form-control" value={formData.customerType} onChange={handleInputChange}><option value="Mới">Mới</option><option value="Quay lại">Quay lại</option></select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>NGUỒN</label>
                        <select name="source" className="form-control" value={formData.source} onChange={handleInputChange}><option value="Facebook">Facebook</option><option value="TikTok">TikTok</option><option value="Google">Google</option></select>
                    </div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>TRÌNH ĐỘ</label><input type="text" name="level" className="form-control" value={formData.level} onChange={handleInputChange} /></div>

                    {/* CỘT 4 */}
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>TIỀM NĂNG</label>
                        <select name="potential" className="form-control" value={formData.potential} onChange={handleInputChange}><option value="Cao">Cao</option><option value="Trung bình">Trung bình</option><option value="Thấp">Thấp</option></select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>TRẠNG THÁI (*)</label>
                        <select name="status" className="form-control" value={formData.status} onChange={handleInputChange}><option value="Mới">🆕 Mới</option><option value="Đang tư vấn">Đang tư vấn</option><option value="Đã ĐK">Đã ĐK</option></select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1 }}><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>HỌC PHÍ</label><input type="number" name="fee" className="form-control" value={formData.fee} onChange={handleInputChange} /></div>
                        <div style={{ width: '80px' }}><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>SỐ BUỔI</label><input type="number" name="totalSessions" className="form-control" value={formData.totalSessions} onChange={handleInputChange} /></div>
                    </div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>LIÊN HỆ CUỐI</label><input type="date" name="lastContact" className="form-control" value={formData.lastContact} onChange={handleInputChange} /></div>

                    {/* CÁC HÀNG CUỐI (SPAN) */}
                    <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>GHI CHÚ</label><input type="text" name="notes" className="form-control" value={formData.notes} onChange={handleInputChange} /></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>VIỆC TIẾP THEO</label><input type="text" name="nextAction" className="form-control" value={formData.nextAction} onChange={handleInputChange} /></div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>XẾP VÀO LỚP</label>
                            <input list="assignClassList" name="assignClass" className="form-control" value={formData.assignClass} onChange={handleInputChange} placeholder="Tự nhập hoặc chọn..." />
                            <datalist id="assignClassList"><option value="Chưa xếp" /><option value="Lớp Khai giảng T6" /></datalist>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>LOẠI LỚP</label>
                            <input list="groupTypeList" name="groupType" className="form-control" value={formData.groupType} onChange={handleInputChange} placeholder="Tự nhập hoặc chọn..." />
                            <datalist id="groupTypeList"><option value="Lớp Nhóm" /><option value="Lớp VIP 1-1" /></datalist>
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'end', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 48px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: '700' }}>LƯU THÔNG TIN</button>
                    </div>
                </form>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}><i className="fa-solid fa-list" style={{ marginRight: '8px' }}></i> Danh sách Khách hàng</h3>
                    <input type="text" className="form-control" placeholder="🔍 Lọc theo tên FB, SĐT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '300px' }} />
                </div>

                <div className="modal-table-container">
                    <table className="modal-table">
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-app)', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>STT</th><th style={{ padding: '12px' }}>NGÀY NHẬN</th>
                                <th style={{ padding: '12px' }}>KHÁCH HÀNG</th><th style={{ padding: '12px' }}>SALE NHẬN</th><th style={{ padding: '12px' }}>KHÓA HỌC</th>
                                <th style={{ padding: '12px' }}>TIỀM NĂNG</th><th style={{ padding: '12px' }}>TRẠNG THÁI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((c, index) => (
                                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '14px 12px', fontWeight: '700' }}>{index + 1}</td>
                                    <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{c.receiveDate || c.date || 'Chưa nhập'}</td>
                                    <td style={{ padding: '14px 12px', cursor: 'pointer' }} onClick={() => { setSelectedCustomer({ ...c }); setIsEditing(false); }}>
                                        <strong style={{ display: 'block', color: 'var(--primary)', textDecoration: 'underline' }}>{c.name || c.fbName || 'Khách chưa có tên'}</strong>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📞 {c.phone}</span>
                                    </td>
                                    <td style={{ padding: '14px 12px' }}>{c.saleInCharge || 'Chưa có'}</td>
                                    <td style={{ padding: '14px 12px' }}>{c.course}</td>
                                    <td style={{ padding: '14px 12px' }}><span style={{ color: c.potential === 'Cao' ? 'var(--success)' : 'var(--warning-text)', fontWeight: '700' }}>{c.potential}</span></td>
                                    <td style={{ padding: '14px 12px' }}><span className="badge-studying">{c.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedCustomer && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ width: '600px', backgroundColor: 'white', padding: '24px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                            <h3 style={{ fontWeight: '800' }}><i className="fa-solid fa-user-pen"></i> {isEditing ? "Chỉnh sửa hồ sơ" : "Hồ sơ khách hàng"}</h3>
                            <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✖</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Họ tên</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.name || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedCustomer.name || 'Không rõ'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Tên Facebook</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.fbName || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, fbName: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedCustomer.fbName || 'Không có'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Số điện thoại</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.phone || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedCustomer.phone}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Người Sale tiếp nhận</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.saleInCharge || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, saleInCharge: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedCustomer.saleInCharge || 'Không có'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ngày nhận (Tự nhập)</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.receiveDate || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, receiveDate: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedCustomer.receiveDate || 'Không có'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ngày sinh (Tự nhập)</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.dob || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, dob: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedCustomer.dob || 'Không có'}</div>}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ghi chú / Nhu cầu</label>
                                {isEditing ? <textarea className="form-control" value={selectedCustomer.notes || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, notes: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedCustomer.notes || 'Không có ghi chú'}</div>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                            <button className="btn" style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', borderRadius: '6px', cursor: 'pointer' }} onClick={() => handleDelete(selectedCustomer.id)}><i className="fa-solid fa-trash"></i> Xóa hồ sơ</button>
                            {!isEditing ? (
                                <button className="btn" style={{ padding: '8px 16px', backgroundColor: 'var(--warning)', color: 'white', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setIsEditing(true)}><i className="fa-solid fa-pen"></i> Sửa thông tin</button>
                            ) : (
                                <button className="btn" style={{ padding: '8px 16px', backgroundColor: 'var(--success)', color: 'white', borderRadius: '6px', cursor: 'pointer' }} onClick={handleSaveEdit}><i className="fa-solid fa-floppy-disk"></i> Lưu thay đổi</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CRM;