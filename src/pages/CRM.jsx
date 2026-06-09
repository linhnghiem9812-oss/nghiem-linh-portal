import React, { useState } from 'react';
import { useData } from '../context/DataContext';

function CRM() {
    // Khuyến nghị: Bạn cần export thêm `setCustomers` từ DataContext.jsx để tính năng Sửa/Xóa lưu lại vĩnh viễn.
    // Tạm thời ở file này mình sẽ dùng local state cho việc render nếu DataContext chưa có hàm cập nhật.
    const { customers, addCustomer } = useData();
    const [localCustomers, setLocalCustomers] = useState(customers || []);
    const [searchTerm, setSearchTerm] = useState('');

    // State quản lý Modal chi tiết khách hàng
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Ngày nhận động
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', customerType: 'Mới', source: 'Facebook',
        course: 'HSK 1', level: '', potential: 'Trung bình', status: 'Mới',
        fee: '', lastContact: '', notes: '', nextAction: '', assignClass: '-- Chưa xếp', groupType: 'Lớp Nhóm'
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) return alert('Vui lòng nhập Họ tên và SĐT');

        const newRecord = {
            id: Date.now(),
            date: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
            name: formData.name, phone: formData.phone, email: formData.email,
            customerType: formData.customerType, source: formData.source,
            course: formData.course, type: formData.groupType, level: formData.level || 'Mới bắt đầu',
            potential: formData.potential, status: formData.status, fee: formData.fee,
            lastContact: formData.lastContact, notes: formData.notes, nextAction: formData.nextAction,
            assignClass: formData.assignClass
        };

        setLocalCustomers([newRecord, ...localCustomers]);
        if (addCustomer) addCustomer(newRecord); // Sync to context if available

        alert('Thêm khách hàng thành công!');
        setFormData({ name: '', phone: '', email: '', customerType: 'Mới', source: 'Facebook', course: 'HSK 1', level: '', potential: 'Trung bình', status: 'Mới', fee: '', lastContact: '', notes: '', nextAction: '', assignClass: '-- Chưa xếp', groupType: 'Lớp Nhóm' });
    };

    const handleSaveEdit = () => {
        setLocalCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? selectedCustomer : c));
        alert('Lưu thay đổi hồ sơ khách hàng thành công!');
        setIsEditing(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
            setLocalCustomers(prev => prev.filter(c => c.id !== id));
            setSelectedCustomer(null);
        }
    };

    // Tính năng lọc dữ liệu
    const filteredCustomers = localCustomers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', position: 'relative' }}>
            {/* KHU VỰC TIẾP NHẬN KHÁCH HÀNG (Khôi phục toàn bộ trường dữ liệu) */}
            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', color: '#1e3a8a' }}>
                    <i className="fa-solid fa-user-plus" style={{ marginRight: '8px' }}></i> Tiếp nhận Khách hàng
                </h3>
                <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>LEAD ID</label><input type="text" className="form-control" value="Auto" disabled style={{ backgroundColor: '#e2e8f0' }} /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>NGÀY NHẬN</label><input type="date" className="form-control" value={todayFormatted} disabled style={{ backgroundColor: '#e2e8f0' }} /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>HỌ TÊN (*)</label><input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>SĐT (*)</label><input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleInputChange} required /></div>

                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>EMAIL</label><input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} /></div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>LOẠI KHÁCH</label>
                        <select name="customerType" className="form-control" value={formData.customerType} onChange={handleInputChange}>
                            <option value="Mới">Mới</option><option value="Quay lại">Quay lại</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>NGUỒN</label>
                        <select name="source" className="form-control" value={formData.source} onChange={handleInputChange}>
                            <option value="Facebook">Facebook</option><option value="TikTok">TikTok</option><option value="Google">Google</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>KHÓA HỌC</label>
                        <select name="course" className="form-control" value={formData.course} onChange={handleInputChange}>
                            <option value="HSK 1">HSK 1</option><option value="HSK 2">HSK 2</option><option value="HSK 3">HSK 3</option>
                        </select>
                    </div>

                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>TRÌNH ĐỘ</label><input type="text" name="level" className="form-control" value={formData.level} onChange={handleInputChange} /></div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>TIỀM NĂNG</label>
                        <select name="potential" className="form-control" value={formData.potential} onChange={handleInputChange}>
                            <option value="Cao">Cao</option><option value="Trung bình">Trung bình</option><option value="Thấp">Thấp</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>TRẠNG THÁI (*)</label>
                        <select name="status" className="form-control" value={formData.status} onChange={handleInputChange}>
                            <option value="Mới">🆕 Mới</option><option value="Đang tư vấn">Đang tư vấn</option><option value="Đã ĐK">Đã ĐK</option>
                        </select>
                    </div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>HỌC PHÍ (VNĐ)</label><input type="number" name="fee" className="form-control" value={formData.fee} onChange={handleInputChange} /></div>

                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>LIÊN HỆ CUỐI</label><input type="date" name="lastContact" className="form-control" value={formData.lastContact} onChange={handleInputChange} /></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>GHI CHÚ</label><input type="text" name="notes" className="form-control" value={formData.notes} onChange={handleInputChange} /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>VIỆC TIẾP THEO</label><input type="text" name="nextAction" className="form-control" value={formData.nextAction} onChange={handleInputChange} /></div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>XẾP VÀO LỚP</label><select name="assignClass" className="form-control" value={formData.assignClass} onChange={handleInputChange}><option value="-- Chưa xếp">-- Chưa xếp</option><option value="Lớp cố định">Lớp cố định</option></select></div>
                        <div style={{ flex: 1 }}><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>LOẠI LỚP</label><select name="groupType" className="form-control" value={formData.groupType} onChange={handleInputChange}><option value="Lớp Nhóm">Lớp Nhóm</option><option value="Lớp VIP 1-1">Lớp VIP 1-1</option></select></div>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'end', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 48px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: '700' }}>LƯU THÔNG TIN</button>
                    </div>
                </form>
            </div>

            {/* DANH SÁCH KHÁCH HÀNG VÀ BỘ LỌC */}
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}><i className="fa-solid fa-list" style={{ marginRight: '8px' }}></i> Danh sách Khách hàng</h3>
                    <input type="text" className="form-control" placeholder="🔍 Lọc theo tên, SĐT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '300px' }} />
                </div>

                <div className="modal-table-container">
                    <table className="modal-table">
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-app)', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>STT</th><th style={{ padding: '12px' }}>NGÀY NHẬN</th>
                                <th style={{ padding: '12px' }}>KHÁCH HÀNG</th><th style={{ padding: '12px' }}>KHÓA HỌC</th>
                                <th style={{ padding: '12px' }}>LOẠI LỚP</th><th style={{ padding: '12px' }}>TIỀM NĂNG</th>
                                <th style={{ padding: '12px' }}>TRẠNG THÁI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((c, index) => (
                                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '14px 12px', fontWeight: '700' }}>{index + 1}</td>
                                    <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{c.date}</td>
                                    <td style={{ padding: '14px 12px', cursor: 'pointer' }} onClick={() => { setSelectedCustomer({ ...c }); setIsEditing(false); }}>
                                        <strong style={{ display: 'block', color: 'var(--primary)', textDecoration: 'underline' }}>{c.name}</strong>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📞 {c.phone}</span>
                                    </td>
                                    <td style={{ padding: '14px 12px' }}>{c.course}</td>
                                    <td style={{ padding: '14px 12px' }}>{c.type}</td>
                                    <td style={{ padding: '14px 12px' }}><span style={{ color: c.potential === 'Cao' ? 'var(--success)' : 'var(--warning-text)', fontWeight: '700' }}>{c.potential}</span></td>
                                    <td style={{ padding: '14px 12px' }}><span className="badge-studying">{c.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL CHI TIẾT / SỬA / XÓA KHÁCH HÀNG */}
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
                                {isEditing ? <input className="form-control" value={selectedCustomer.name} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedCustomer.name}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Số điện thoại</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.phone} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedCustomer.phone}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Khóa học quan tâm</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.course} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, course: e.target.value })} /> : <div style={{ fontWeight: '600' }}>{selectedCustomer.course}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Trạng thái</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.status} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, status: e.target.value })} /> : <div style={{ fontWeight: '600' }}><span className="badge-studying">{selectedCustomer.status}</span></div>}
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