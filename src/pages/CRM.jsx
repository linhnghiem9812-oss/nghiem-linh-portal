import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function CRM() {
    const { customers, setCustomers } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isPanelExpanded, setIsPanelExpanded] = useState(false);

    // --- ĐÃ SỬA: LẤY CẢ ACCOUNT ADMIN & MANAGER VÀO DANH SÁCH SALE ---
    const [salesUsers, setSalesUsers] = useState([]);

    useEffect(() => {
        api.get('/users') // Đổi từ /users/role/sales thành /users để lấy tất cả
            .then(res => {
                // Chỉ lọc lấy những người là sales, admin, manager
                const eligibleSales = res.data.filter(u => u.role === 'sales' || u.role === 'admin' || u.role === 'manager');
                setSalesUsers(eligibleSales);
            })
            .catch(() => console.log('Chưa lấy được danh sách Sale.'));
    }, []);

    const [visibleColumns, setVisibleColumns] = useState({
        receiveDate: false, saleInCharge: false, dob: false, name: false,
        customerType: false, source: false, fee: false, totalSessions: false,
        lastContact: false, notes: false, nextAction: false,
        assignClass: true
    });

    const optionalColumnsConfig = [
        { key: 'receiveDate', label: 'Ngày nhận', icon: 'fa-regular fa-calendar-plus' },
        { key: 'saleInCharge', label: 'Sale nhận', icon: 'fa-solid fa-user-tie' },
        { key: 'dob', label: 'Ngày sinh', icon: 'fa-cake-candles' },
        { key: 'name', label: 'Họ tên', icon: 'fa-id-card' },
        { key: 'customerType', label: 'Loại khách', icon: 'fa-user-tag' },
        { key: 'source', label: 'Nguồn', icon: 'fa-share-nodes' },
        { key: 'fee', label: 'Học phí', icon: 'fa-wallet' },
        { key: 'totalSessions', label: 'Số buổi', icon: 'fa-clock' },
        { key: 'lastContact', label: 'Liên hệ cuối', icon: 'fa-business-time' },
        { key: 'notes', label: 'Ghi chú', icon: 'fa-note-sticky' },
        { key: 'nextAction', label: 'Việc tiếp theo', icon: 'fa-circle-exclamation' }
    ];

    const toggleColumn = (columnKey) => setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));

    const today = new Date();
    const defaultDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

    const [formData, setFormData] = useState({
        fbName: '', name: '', phone: '', dob: '', language: 'Tiếng Trung',
        customerType: 'Mới', source: 'Facebook', level: '', country: 'Việt Nam',
        potential: 'Trung bình', status: 'Mới', fee: '', totalSessions: '', lastContact: '',
        notes: '', nextAction: '', assignClass: '', classType: 'Lớp Nhóm',
        receiveDate: defaultDate, saleInCharge: ''
    });

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const formatToStandardDate = (str) => {
        if (!str) return '';
        const parts = str.split(/[-/.]/);
        if (parts.length === 3) {
            let [d, m, y] = parts;
            d = d.padStart(2, '0'); m = m.padStart(2, '0');
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
            dob: formatToStandardDate(formData.dob),
            language: formData.language,
            customerType: formData.customerType,
            source: formData.source,
            level: formData.level,
            classType: formData.classType,
            status: formData.status,
            fee: formData.fee ? formData.fee.toString() : '0',
            totalSessions: formData.totalSessions ? formData.totalSessions.toString() : '0',
            lastContact: formData.lastContact,
            notes: formData.notes,
            nextAction: formData.nextAction,
            assignClass: formData.assignClass,
            country: formData.country,
            receiveDate: formatToStandardDate(formData.receiveDate),
            saleInCharge: formData.saleInCharge
        };

        try {
            const res = await api.post('/customers', newRecord);
            setCustomers(prev => [res.data, ...prev]);
            alert('Thêm khách hàng thành công!');
            setFormData({ fbName: '', name: '', phone: '', dob: '', language: 'Tiếng Trung', customerType: 'Mới', source: 'Facebook', level: '', potential: 'Trung bình', status: 'Mới', fee: '', totalSessions: '', lastContact: '', notes: '', nextAction: '', assignClass: '', classType: 'Lớp Nhóm', country: 'Việt Nam', receiveDate: defaultDate, saleInCharge: '' });
        } catch (err) {
            alert('Lỗi khi đẩy khách hàng lên database. Vui lòng kiểm tra lại!');
        }
    };

    const handleSaveEdit = async () => {
        try {
            const res = await api.put(`/customers/${selectedCustomer.id}`, selectedCustomer);
            setCustomers(prev => prev.map(c => c.id === res.data.id ? res.data : c));
            alert('Lưu thay đổi hồ sơ khách hàng thành công!');
            setIsEditing(false);
            setSelectedCustomer(null);
        } catch (error) {
            alert('Lỗi cập nhật CSDL.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
            try {
                await api.delete(`/customers/${id}`);
                setCustomers(prev => prev.filter(c => c.id !== id));
                setSelectedCustomer(null);
                alert('Đã xóa hồ sơ khách hàng thành công!');
            } catch (e) {
                alert('Lỗi xóa khách hàng.');
            }
        }
    };

    const filteredCustomers = customers ? customers.filter(c =>
        (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.fbName && c.fbName.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', position: 'relative' }}>

            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', color: '#1e3a8a' }}>
                    <i className="fa-solid fa-user-plus" style={{ marginRight: '8px' }}></i> Tiếp nhận Khách hàng
                </h3>
                <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>TÊN FB</label><input type="text" name="fbName" className="form-control" value={formData.fbName} onChange={handleInputChange} placeholder="Nhập tên FB..." /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>NGÀY NHẬN</label><input type="text" name="receiveDate" className="form-control" value={formData.receiveDate} onChange={handleInputChange} /></div>

                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>NGƯỜI SALE TIẾP NHẬN</label>
                        <select name="saleInCharge" className="form-control" value={formData.saleInCharge} onChange={handleInputChange}>
                            <option value="">-- Chọn Sale --</option>
                            {salesUsers.map(sale => (
                                <option key={sale.id} value={sale.name || sale.username}>{sale.name || sale.username}</option>
                            ))}
                        </select>
                    </div>

                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>SĐT (Zalo) (*)</label><input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleInputChange} required style={{ borderColor: 'var(--primary)' }} /></div>

                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>NGÀY SINH</label><input type="text" name="dob" className="form-control" value={formData.dob} onChange={handleInputChange} placeholder="VD: 15/08/1998" /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>HỌ TÊN</label><input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} placeholder="Tên học viên..." /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>QUỐC GIA</label><input type="text" name="country" className="form-control" value={formData.country} onChange={handleInputChange} /></div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>LOẠI NGÔN NGỮ</label>
                        <select name="language" className="form-control" value={formData.language} onChange={handleInputChange}>
                            <option value="Tiếng Trung">Tiếng Trung</option><option value="Tiếng Nhật">Tiếng Nhật</option><option value="Tiếng Anh">Tiếng Anh</option>
                        </select>
                    </div>

                    <div><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>KHÓA HỌC / TRÌNH ĐỘ</label><input type="text" name="level" className="form-control" value={formData.level} onChange={handleInputChange} placeholder="Nhập tên khóa học..." /></div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>LOẠI KHÁCH</label>
                        <select name="customerType" className="form-control" value={formData.customerType} onChange={handleInputChange}><option value="Mới">Mới</option><option value="Quay lại">Quay lại</option></select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700' }}>NGUỒN</label>
                        <select name="source" className="form-control" value={formData.source} onChange={handleInputChange}><option value="Facebook">Facebook</option><option value="TikTok">TikTok</option><option value="Google">Google</option></select>
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
                    <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>XẾP VÀO LỚP</label><input type="text" name="assignClass" className="form-control" value={formData.assignClass} onChange={handleInputChange} placeholder="Tên lớp xếp..." /></div>

                    <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>LOẠI LỚP</label><input list="classTypeList" name="classType" className="form-control" value={formData.classType} onChange={handleInputChange} /><datalist id="classTypeList"><option value="Lớp Nhóm" /><option value="Lớp VIP 1-1" /></datalist></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>GHI CHÚ / NHU CẦU</label><input type="text" name="notes" className="form-control" value={formData.notes} onChange={handleInputChange} /></div>

                    <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '0.75rem', fontWeight: '700' }}>VIỆC TIẾP THEO</label><input type="text" name="nextAction" className="form-control" value={formData.nextAction} onChange={handleInputChange} /></div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'end', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 48px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: '700' }}>LƯU THÔNG TIN KHÁCH HÀNG</button>
                    </div>
                </form>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <div style={{ position: 'sticky', top: '0', zIndex: '20', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '15px' }}>
                        <button type="button" onClick={() => setIsPanelExpanded(!isPanelExpanded)} style={{ background: isPanelExpanded ? '#4f46e5' : '#ffffff', color: isPanelExpanded ? 'white' : '#4f46e5', border: '1px solid #4f46e5', padding: '6px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className={`fa-solid ${isPanelExpanded ? 'fa-cog' : 'fa-list-ul'}`}></i>
                            <span>{isPanelExpanded ? 'Đóng bảng chọn' : 'Tùy chỉnh cột'}</span>
                        </button>
                    </div>
                    {isPanelExpanded && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                            {optionalColumnsConfig.map(col => (
                                <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: visibleColumns[col.key] ? '#eef2ff' : '#f8fafc', border: visibleColumns[col.key] ? '1px solid #4f46e5' : '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', color: visibleColumns[col.key] ? '#4f46e5' : '#475569' }}>
                                    <input type="checkbox" checked={visibleColumns[col.key]} onChange={() => toggleColumn(col.key)} />
                                    <i className={`fa-solid ${col.icon}`}></i> {col.label}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}><i className="fa-solid fa-list" style={{ marginRight: '8px' }}></i> Danh sách Khách hàng</h3>
                    <input type="text" className="form-control" placeholder="🔍 Lọc theo tên FB, SĐT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '300px' }} />
                </div>

                <div className="modal-table-container" style={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <table className="modal-table" style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap', tableLayout: 'auto' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-app)', textAlign: 'left', fontSize: '0.75rem' }}>
                                <th style={{ padding: '12px' }}>STT</th>
                                <th style={{ padding: '12px' }}>TÊN FB</th>
                                {visibleColumns.receiveDate && <th style={{ padding: '12px' }}>NGÀY NHẬN</th>}
                                {visibleColumns.saleInCharge && <th style={{ padding: '12px' }}>SALE NHẬN</th>}
                                <th style={{ padding: '12px' }}>SĐT (ZALO)</th>
                                {visibleColumns.dob && <th style={{ padding: '12px' }}>NGÀY SINH</th>}
                                {visibleColumns.name && <th style={{ padding: '12px' }}>HỌ TÊN</th>}
                                <th style={{ padding: '12px' }}>QUỐC GIA</th>
                                <th style={{ padding: '12px' }}>NGÔN NGỮ</th>
                                <th style={{ padding: '12px' }}>KHÓA HỌC</th>
                                <th style={{ padding: '12px' }}>LOẠI LỚP</th>
                                {visibleColumns.customerType && <th style={{ padding: '12px' }}>LOẠI KHÁCH</th>}
                                {visibleColumns.source && <th style={{ padding: '12px' }}>NGUỒN</th>}
                                <th style={{ padding: '12px' }}>TRẠNG THÁI</th>
                                {visibleColumns.fee && <th style={{ padding: '12px' }}>HỌC PHÍ</th>}
                                {visibleColumns.totalSessions && <th style={{ padding: '12px' }}>SỐ BUỔI</th>}
                                {visibleColumns.lastContact && <th style={{ padding: '12px' }}>LIÊN HỆ CUỐI</th>}
                                {visibleColumns.notes && <th style={{ padding: '12px' }}>GHI CHÚ</th>}
                                {visibleColumns.nextAction && <th style={{ padding: '12px' }}>VIỆC TIẾP THEO</th>}
                                {visibleColumns.assignClass && <th style={{ padding: '12px' }}>XẾP LỚP</th>}
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '0.85rem' }}>
                            {filteredCustomers.map((c, index) => (
                                <tr key={c.id || index} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'white' }}>
                                    <td style={{ padding: '14px 12px', fontWeight: '700' }}>{index + 1}</td>
                                    <td style={{ padding: '14px 12px' }}>
                                        <span style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: '700', cursor: 'pointer' }} onClick={() => { setSelectedCustomer({ ...c }); setIsEditing(false); }}>
                                            {c.fbName || '---'}
                                        </span>
                                    </td>
                                    {visibleColumns.receiveDate && <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{c.receiveDate || '---'}</td>}
                                    {visibleColumns.saleInCharge && <td style={{ padding: '14px 12px', fontWeight: '600' }}>{c.saleInCharge || '---'}</td>}
                                    <td style={{ padding: '14px 12px' }}>{c.phone || '---'}</td>
                                    {visibleColumns.dob && <td style={{ padding: '14px 12px' }}>{c.dob || '---'}</td>}
                                    {visibleColumns.name && <td style={{ padding: '14px 12px', fontWeight: '600' }}>{c.name || '---'}</td>}
                                    <td style={{ padding: '14px 12px' }}>{c.country || '---'}</td>
                                    <td style={{ padding: '14px 12px' }}>{c.language || '---'}</td>
                                    <td style={{ padding: '14px 12px', fontWeight: '700', color: '#1e3a8a' }}>{c.level || '---'}</td>
                                    <td style={{ padding: '14px 12px', fontWeight: '700', color: '#10b981' }}>{c.classType || '---'}</td>

                                    {visibleColumns.customerType && <td style={{ padding: '14px 12px' }}>{c.customerType || '---'}</td>}
                                    {visibleColumns.source && <td style={{ padding: '14px 12px' }}>{c.source || '---'}</td>}
                                    <td style={{ padding: '14px 12px' }}>
                                        <span className="badge-studying" style={{ backgroundColor: c.status === 'Đã ĐK' ? '#dcfce7' : c.status === 'Đang tư vấn' ? '#e0e7ff' : '#f1f5f9', color: c.status === 'Đã ĐK' ? '#166534' : c.status === 'Đang tư vấn' ? '#3730a3' : '#475569', fontWeight: '800', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem' }}>{c.status || 'Mới'}</span>
                                    </td>
                                    {visibleColumns.fee && <td style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--primary)' }}>{c.fee ? `${Number(c.fee).toLocaleString('vi-VN')} đ` : '0 đ'}</td>}
                                    {visibleColumns.totalSessions && <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700' }}>{c.totalSessions || '---'}</td>}
                                    {visibleColumns.lastContact && <td style={{ padding: '14px 12px' }}>{c.lastContact || '---'}</td>}
                                    {visibleColumns.notes && <td style={{ padding: '14px 12px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.notes}>{c.notes || '---'}</td>}
                                    {visibleColumns.nextAction && <td style={{ padding: '14px 12px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.nextAction}>{c.nextAction || '---'}</td>}
                                    {visibleColumns.assignClass && <td style={{ padding: '14px 12px' }}>{c.assignClass || '---'}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedCustomer && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ width: '680px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                            <h3 style={{ fontWeight: '800' }}><i className="fa-solid fa-user-pen"></i> {isEditing ? "Chỉnh sửa hồ sơ" : "Hồ sơ khách hàng chi tiết"}</h3>
                            <button onClick={() => { setSelectedCustomer(null); setIsEditing(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✖</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Tên Facebook</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.fbName || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, fbName: e.target.value })} /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{selectedCustomer.fbName || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Số điện thoại (*)</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.phone || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })} required /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{selectedCustomer.phone || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ngày nhận hồ sơ</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.receiveDate || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, receiveDate: e.target.value })} /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{selectedCustomer.receiveDate || '---'}</div>}
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Người Sale phụ trách</label>
                                {isEditing ? (
                                    <select className="form-control" value={selectedCustomer.saleInCharge || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, saleInCharge: e.target.value })}>
                                        <option value="">-- Chọn Sale --</option>
                                        {salesUsers.map(sale => (
                                            <option key={sale.id} value={sale.name || sale.username}>{sale.name || sale.username}</option>
                                        ))}
                                    </select>
                                ) : <div style={{ fontWeight: '600', padding: '8px 0' }}>{selectedCustomer.saleInCharge || '---'}</div>}
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Họ và tên học viên</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.name || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })} /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{selectedCustomer.name || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ngày sinh</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.dob || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, dob: e.target.value })} /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{selectedCustomer.dob || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Quốc gia</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.country || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, country: e.target.value })} /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{selectedCustomer.country || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ngôn ngữ học</label>
                                {isEditing ? (
                                    <select className="form-control" value={selectedCustomer.language || 'Tiếng Trung'} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, language: e.target.value })}>
                                        <option value="Tiếng Trung">Tiếng Trung</option><option value="Tiếng Nhật">Tiếng Nhật</option><option value="Tiếng Anh">Tiếng Anh</option>
                                    </select>
                                ) : <div style={{ fontWeight: '600', padding: '8px 0' }}>{selectedCustomer.language || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Khóa học / Trình độ</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.level || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, level: e.target.value })} /> : <div style={{ fontWeight: '600', padding: '8px 0', color: '#1e3a8a' }}>{selectedCustomer.level || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Loại lớp học</label>
                                {isEditing ? (
                                    <select className="form-control" value={selectedCustomer.classType || 'Lớp Nhóm'} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, classType: e.target.value })}>
                                        <option value="Lớp Nhóm">Lớp Nhóm</option><option value="Lớp VIP 1-1">Lớp VIP 1-1</option>
                                    </select>
                                ) : <div style={{ fontWeight: '600', padding: '8px 0', color: '#10b981' }}>{selectedCustomer.classType || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Loại khách</label>
                                {isEditing ? (
                                    <select className="form-control" value={selectedCustomer.customerType || 'Mới'} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, customerType: e.target.value })}>
                                        <option value="Mới">Mới</option><option value="Quay lại">Quay lại</option>
                                    </select>
                                ) : <div style={{ fontWeight: '600', padding: '8px 0' }}>{selectedCustomer.customerType || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Nguồn đến</label>
                                {isEditing ? (
                                    <select className="form-control" value={selectedCustomer.source || 'Facebook'} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, source: e.target.value })}>
                                        <option value="Facebook">Facebook</option><option value="TikTok">TikTok</option><option value="Google">Google</option>
                                    </select>
                                ) : <div style={{ fontWeight: '600', padding: '8px 0' }}>{selectedCustomer.source || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Tổng học phí (VNĐ)</label>
                                {isEditing ? <input type="number" className="form-control" value={selectedCustomer.fee || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, fee: e.target.value })} /> : <div style={{ fontWeight: '700', padding: '8px 0', color: 'var(--primary)' }}>{selectedCustomer.fee ? Number(selectedCustomer.fee).toLocaleString('vi-VN') + ' đ' : '0 đ'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Tổng số buổi học</label>
                                {isEditing ? <input type="number" className="form-control" value={selectedCustomer.totalSessions || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, totalSessions: e.target.value })} /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{selectedCustomer.totalSessions || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Trạng thái tư vấn</label>
                                {isEditing ? (
                                    <select className="form-control" value={selectedCustomer.status || 'Mới'} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, status: e.target.value })}>
                                        <option value="Mới">🆕 Mới</option><option value="Đang tư vấn">Đang tư vấn</option><option value="Đã ĐK">Đã ĐK</option>
                                    </select>
                                ) : <div style={{ fontWeight: '600', padding: '8px 0' }}>{selectedCustomer.status || '---'}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Xếp vào lớp</label>
                                {isEditing ? <input className="form-control" value={selectedCustomer.assignClass || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, assignClass: e.target.value })} /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{selectedCustomer.assignClass || '---'}</div>}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ngày tương tác cuối cùng</label>
                                {isEditing ? <input type="date" className="form-control" value={selectedCustomer.lastContact || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, lastContact: e.target.value })} /> : <div style={{ fontWeight: '600', padding: '8px 0' }}>{selectedCustomer.lastContact || '---'}</div>}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Ghi chú chi tiết / Nhu cầu học viên</label>
                                {isEditing ? <textarea className="form-control" rows="2" value={selectedCustomer.notes || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, notes: e.target.value })} /> : <div style={{ fontWeight: '600', padding: '8px 0', whiteSpace: 'pre-wrap' }}>{selectedCustomer.notes || 'Không có ghi chú'}</div>}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Hành động tiếp theo (Next Action)</label>
                                {isEditing ? <textarea className="form-control" rows="2" value={selectedCustomer.nextAction || ''} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, nextAction: e.target.value })} /> : <div style={{ fontWeight: '600', padding: '8px 0', whiteSpace: 'pre-wrap' }}>{selectedCustomer.nextAction || '---'}</div>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                            <button className="btn" style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }} onClick={() => handleDelete(selectedCustomer.id)}><i className="fa-solid fa-trash"></i> Xóa hồ sơ</button>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {!isEditing ? (
                                    <button className="btn" style={{ padding: '10px 20px', backgroundColor: 'var(--warning)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }} onClick={() => setIsEditing(true)}><i className="fa-solid fa-pen"></i> Sửa thông tin</button>
                                ) : (
                                    <button className="btn" style={{ padding: '10px 20px', backgroundColor: 'var(--success)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }} onClick={handleSaveEdit}><i className="fa-solid fa-floppy-disk"></i> Lưu thay đổi</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CRM;