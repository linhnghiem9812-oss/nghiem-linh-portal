import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext'; // Lấy dữ liệu dùng chung của toàn hệ thống
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function SalesRating() {
    const { customers } = useData(); // Kéo danh sách khách hàng thực tế từ CRM
    const [salesTeam, setSalesTeam] = useState([]);

    // TÍNH TOÁN TỔNG QUAN CHO KHỐI SALE TOÀN TRUNG TÂM
    const totalClosed = customers ? customers.filter(c => c.status === 'Đã ĐK').length : 0;
    const totalCustomers = customers ? customers.length : 0;
    const conversionRate = totalCustomers > 0 ? ((totalClosed / totalCustomers) * 100).toFixed(1) : 0;

    const totalRevenueAll = customers ? customers
        .filter(c => c.status === 'Đã ĐK')
        .reduce((sum, c) => sum + (parseInt(c.fee) || 0), 0) : 0;

    useEffect(() => {
        api.get('/users/role/sales')
            .then(res => {
                const salesUsers = res.data;

                // TÍNH DOANH THU & CHỈ SỐ CHO TỪNG NHÂN VIÊN SALE
                let formatted = salesUsers.map((user, index) => {
                    const salesName = user.name || user.username;

                    // 1. Lọc ra các khách hàng do Sale này phụ trách (Không phân biệt hoa/thường)
                    const myCustomers = customers ? customers.filter(c =>
                        c.saleInCharge && c.saleInCharge.toLowerCase() === salesName.toLowerCase()
                    ) : [];

                    // 2. Đếm số lượng khách hàng
                    const closed = myCustomers.filter(c => c.status === 'Đã ĐK').length;
                    const consulting = myCustomers.length - closed; // Khách chưa đăng ký

                    // 3. Tính tổng doanh thu (chỉ cộng tiền khách Đã ĐK)
                    const totalRevenue = myCustomers
                        .filter(c => c.status === 'Đã ĐK')
                        .reduce((sum, c) => sum + (parseInt(c.fee) || 0), 0);

                    // 4. Rút gọn số tiền để hiển thị trên biểu đồ cột (VD: 15000000 -> 15.0M)
                    const revenueFormatted = totalRevenue >= 1000000
                        ? (totalRevenue / 1000000).toFixed(1) + 'M'
                        : totalRevenue.toLocaleString('vi-VN') + ' đ';

                    return {
                        id: user.id,
                        name: salesName,
                        role: 'SALES EXECUTIVE',
                        revenue: revenueFormatted,
                        revenueValue: totalRevenue, // Dùng để máy tính so xếp hạng
                        clients: closed,
                        consulting: consulting,
                        color: ['#facc15', '#e2e8f0', '#f97316', '#a855f7', '#10b981'][index % 5] || '#94a3b8',
                        bg: ['#eab308', '#cbd5e1', '#ea580c', '#9333ea', '#16a34a'][index % 5] || '#64748b'
                    };
                });

                // 5. Sắp xếp danh sách Sale theo doanh thu thực tế giảm dần
                formatted.sort((a, b) => b.revenueValue - a.revenueValue);

                // 6. Gán hạng (Rank) sau khi đã sắp xếp
                formatted.forEach((member, idx) => member.rank = idx + 1);

                setSalesTeam(formatted);
            })
            .catch(() => console.log('Chưa có nhân sự Sale trên DB.'));
    }, [customers]); // Lệnh này giúp Bảng Sale tự động cập nhật ngay lập tức khi CRM có thêm khách

    const top3Data = salesTeam.filter(s => s.rank <= 3).sort((a, b) => a.rank - b.rank);
    const podiumOrder = top3Data.length >= 3 ? [
        { ...top3Data[1], height: '130px', animDelayCol: '0.2s', animDelayText: '0.8s' },
        { ...top3Data[0], height: '200px', animDelayCol: '0.4s', animDelayText: '1.0s' },
        { ...top3Data[2], height: '90px', animDelayCol: '0.0s', animDelayText: '0.6s' }
    ] : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <style>
                {`
                    @keyframes riseUp { 0% { height: 0px; } 100% { height: var(--target-height); } }
                    @keyframes fadeInText { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
                    .anim-column { height: 0px; animation: riseUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                    .anim-text { opacity: 0; animation: fadeInText 0.5s ease-out forwards; }
                `}
            </style>

            {/* BẢNG TỔNG QUAN TỰ ĐỘNG CỘNG SỐ LIỆU TỪ CRM */}
            <div className="kpi-row">
                <div className="card kpi-card-simple">
                    <div><div className="kpi-card-label">Tổng doanh thu khối Sale</div><div className="kpi-card-number">{totalRevenueAll.toLocaleString('vi-VN')} VNĐ</div></div>
                    <div className="kpi-card-circle-icon purple"><i className="fa-solid fa-chart-line"></i></div>
                </div>
                <div className="card kpi-card-simple">
                    <div><div className="kpi-card-label">Tỷ lệ chuyển đổi chung</div><div className="kpi-card-number">{conversionRate}%</div></div>
                    <div className="kpi-card-circle-icon success" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}><i className="fa-solid fa-percentage"></i></div>
                </div>
            </div>

            <div style={{ backgroundColor: '#5b21b6', borderRadius: '16px', padding: '32px 32px 0 32px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <h3 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>👑 BẢNG XẾP HẠNG DOANH SỐ</h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '16px', height: '340px', paddingBottom: '0' }}>
                    {podiumOrder.length > 0 ? podiumOrder.map((person, index) => (
                        <div key={person.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: index === 1 ? '150px' : '130px' }}>
                            <div className="anim-text" style={{ animationDelay: person.animDelayText, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: index === 1 ? '70px' : '60px', height: index === 1 ? '70px' : '60px', borderRadius: '50%', backgroundColor: 'white', color: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800', fontSize: index === 1 ? '1.4rem' : '1.1rem', marginBottom: '8px', border: `4px solid ${person.color}`, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                    {person.name.split(' ').pop().substring(0, 2).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '16px', textAlign: 'center', lineHeight: '1.2' }}>{person.name}</span>
                            </div>
                            <div className="anim-column" style={{ '--target-height': person.height, width: '100%', backgroundColor: person.bg, borderRadius: '12px 12px 0 0', animationDelay: person.animDelayCol, position: 'relative', boxShadow: '0 -4px 15px rgba(0,0,0,0.1)' }}>
                                <div className="anim-text" style={{ animationDelay: person.animDelayText, position: 'absolute', bottom: '16px', width: '100%', textAlign: 'center', color: index === 1 ? '#854d0e' : 'white' }}>
                                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', opacity: 0.9, letterSpacing: '0.05em' }}>DOANH THU</span>
                                    <span style={{ display: 'block', fontWeight: '800', fontSize: '1.2rem', marginTop: '2px' }}>{person.revenue}</span>
                                </div>
                            </div>
                        </div>
                    )) : <div style={{ marginBottom: '40px', color: '#cbd5e1' }}>Chưa có đủ 3 nhân sự Sale sinh ra doanh thu để xếp hạng.</div>}
                </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', borderLeft: '4px solid var(--primary)', paddingLeft: '12px', marginBottom: '24px' }}>Đội ngũ Tư Vấn Viên</h3>
                {salesTeam.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Chưa có nhân sự Sale nào trong hệ thống CSDL.</p>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    {salesTeam.map((member) => (
                        <div key={member.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', backgroundColor: 'white', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: `${member.color}20`, color: member.color, display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800', fontSize: '1.1rem' }}>
                                    {member.name.split(' ').pop().charAt(0)}
                                </div>
                                <div>
                                    <strong style={{ display: 'block', fontSize: '1rem' }}>{member.name}</strong>
                                    <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>{member.role}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ flex: 1, backgroundColor: 'var(--bg-app)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>ĐANG TƯ VẤN</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{member.consulting}</span>
                                </div>
                                <div style={{ flex: 1, backgroundColor: `${member.color}15`, color: member.color, padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700' }}>ĐÃ CHỐT</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{member.clients}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hoa hồng tháng này</span>
                                <strong style={{ color: 'var(--primary)' }}>
                                    {member.revenueValue === 0 ? '0 đ' : `${(member.revenueValue * 0.1).toLocaleString('vi-VN')} đ`}
                                </strong>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SalesRating;