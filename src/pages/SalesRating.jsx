import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function SalesRating() {
    const { customers } = useData();
    const [rawSalesUsers, setRawSalesUsers] = useState([]);

    useEffect(() => {
        api.get('/users')
            .then(res => {
                const eligibleSales = res.data.filter(u => u.role === 'sales' || u.role === 'admin' || u.role === 'manager');
                setRawSalesUsers(eligibleSales);
            })
            .catch(() => console.log('Chưa lấy được danh sách tài khoản Sale.'));
    }, []);

    // --- THUẬT TOÁN CHUẨN HÓA KHẮC PHỤC LỖI TRÙNG LẶP ---
    const salesTeam = useMemo(() => {
        if (!customers) return [];

        // Hàm khử nhiễu: Ép chữ thường và xóa sạch khoảng trắng dư thừa
        const normalize = (str) => {
            return str ? str.toString().trim().replace(/\s+/g, ' ').toLowerCase() : '';
        };

        const dbSalesNames = rawSalesUsers.map(u => u.name || u.username);
        const crmSalesNames = customers.map(c => c.saleInCharge).filter(Boolean);
        
        const nameMap = new Map();
        
        [...dbSalesNames, ...crmSalesNames].forEach(rawName => {
            const normKey = normalize(rawName);
            if(normKey && !nameMap.has(normKey)) {
                // Lưu lại tên gốc đã được dọn dẹp khoảng trắng để hiển thị
                nameMap.set(normKey, rawName.toString().trim().replace(/\s+/g, ' ')); 
            }
        });
        
        const uniqueNames = Array.from(nameMap.values());

        let formatted = uniqueNames.map((saleName, index) => {
            const normSaleName = normalize(saleName);

            // Dùng tên đã chuẩn hóa để lọc khách hàng, đảm bảo chính xác 100%
            const myCustomers = customers.filter(c => 
                normalize(c.saleInCharge) === normSaleName
            );

            const closed = myCustomers.filter(c => c.status === 'Đã ĐK').length;
            const consulting = myCustomers.length - closed;
            const totalRevenue = myCustomers
                .filter(c => c.status === 'Đã ĐK')
                .reduce((sum, c) => sum + (parseInt(c.fee) || 0), 0);

            const conversionRate = myCustomers.length > 0 ? Math.round((closed / myCustomers.length) * 100) : 0;
            
            let revenueFormatted = '0 đ';
            if (totalRevenue >= 1000000000) {
                revenueFormatted = (totalRevenue / 1000000000).toFixed(2) + ' Tỷ';
            } else if (totalRevenue >= 1000000) {
                revenueFormatted = (totalRevenue / 1000000).toFixed(1) + 'M';
            } else {
                revenueFormatted = totalRevenue.toLocaleString('vi-VN');
            }

            return {
                id: `sale_${index}`,
                name: saleName,
                role: 'Chuyên viên Tư vấn',
                revenue: revenueFormatted,
                revenueValue: totalRevenue,
                clients: closed,
                consulting: consulting,
                totalLeads: myCustomers.length,
                conversionRate: conversionRate,
                commission: totalRevenue * 0.1,
                color: ['#facc15', '#38bdf8', '#f97316', '#a855f7', '#10b981'][index % 5] || '#94a3b8',
                bg: ['#eab308', '#0284c7', '#ea580c', '#9333ea', '#16a34a'][index % 5] || '#64748b'
            };
        });

        formatted.sort((a, b) => b.revenueValue - a.revenueValue);
        formatted.forEach((member, idx) => member.rank = idx + 1);
        return formatted;
    }, [rawSalesUsers, customers]);

    const totalClosed = customers ? customers.filter(c => c.status === 'Đã ĐK').length : 0;
    const totalCustomers = customers ? customers.length : 0;
    const conversionRateCenter = totalCustomers > 0 ? ((totalClosed / totalCustomers) * 100).toFixed(1) : 0;
    const totalRevenueAll = customers ? customers
        .filter(c => c.status === 'Đã ĐK')
        .reduce((sum, c) => sum + (parseInt(c.fee) || 0), 0) : 0;

    const top3 = salesTeam.slice(0, 3);
    let podiumOrder = [];
    if (top3.length === 1) podiumOrder = [{ ...top3[0], height: '220px', delay: '0.2s', size: 'large' }];
    else if (top3.length === 2) podiumOrder = [{ ...top3[1], height: '150px', delay: '0.4s', size: 'medium' }, { ...top3[0], height: '220px', delay: '0.2s', size: 'large' }];
    else if (top3.length >= 3) podiumOrder = [{ ...top3[1], height: '160px', delay: '0.4s', size: 'medium' }, { ...top3[0], height: '220px', delay: '0.2s', size: 'large' }, { ...top3[2], height: '110px', delay: '0.6s', size: 'small' }];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.4s ease-out' }}>
            <style>
                {`
                    @keyframes riseUp { 0% { height: 0px; } 100% { height: var(--target-height); } }
                    @keyframes popIn { 0% { opacity: 0; transform: scale(0.8) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
                    .anim-column { height: 0px; animation: riseUp 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                    .anim-avatar { opacity: 0; animation: popIn 0.5s ease-out forwards; }
                    .stat-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                    .stat-info span { display: block; font-size: 0.85rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                    .stat-info strong { display: block; font-size: 1.6rem; color: #0f172a; font-weight: 800; }
                    .stat-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
                `}
            </style>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="stat-card">
                    <div className="stat-info"><span>Tổng doanh thu khối Sale</span><strong>{totalRevenueAll.toLocaleString('vi-VN')} đ</strong></div>
                    <div className="stat-icon" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}><i className="fa-solid fa-sack-dollar"></i></div>
                </div>
                <div className="stat-card">
                    <div className="stat-info"><span>Tỷ lệ chuyển đổi chung</span><strong>{conversionRateCenter}%</strong></div>
                    <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}><i className="fa-solid fa-chart-pie"></i></div>
                </div>
                <div className="stat-card">
                    <div className="stat-info"><span>Số lượng Sale hoạt động</span><strong>{salesTeam.length} Nhân sự</strong></div>
                    <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}><i className="fa-solid fa-users"></i></div>
                </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', borderRadius: '20px', padding: '40px 32px 0 32px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: '800', marginBottom: '10px', color: '#f8fafc', letterSpacing: '0.05em' }}>
                    <i className="fa-solid fa-ranking-star" style={{ color: '#fbbf24', marginRight: '10px' }}></i>
                    BẢNG XẾP HẠNG DOANH SỐ THÁNG
                </h3>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', height: '380px', paddingBottom: '0', marginTop: '20px' }}>
                    {podiumOrder.length > 0 ? podiumOrder.map((person) => {
                        const isFirst = person.rank === 1;
                        const avatarSize = isFirst ? '80px' : '65px';
                        const colWidth = isFirst ? '160px' : '130px';

                        return (
                            <div key={person.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: colWidth }}>
                                <div className="anim-avatar" style={{ animationDelay: person.delay, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                    {isFirst && <i className="fa-solid fa-crown" style={{ color: '#fbbf24', fontSize: '2rem', position: 'absolute', top: '-30px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}></i>}
                                    <div style={{ width: avatarSize, height: avatarSize, borderRadius: '50%', backgroundColor: 'white', color: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800', fontSize: isFirst ? '1.5rem' : '1.2rem', marginBottom: '12px', border: `4px solid ${person.color}`, boxShadow: '0 8px 16px rgba(0,0,0,0.3)', zIndex: 2 }}>
                                        {person.name.split(' ').pop().substring(0, 2).toUpperCase()}
                                    </div>
                                    <span style={{ fontWeight: '800', fontSize: isFirst ? '1.1rem' : '0.95rem', marginBottom: '16px', textAlign: 'center', color: '#f8fafc' }}>{person.name}</span>
                                </div>
                                <div className="anim-column" style={{ '--target-height': person.height, width: '100%', background: `linear-gradient(180deg, ${person.bg} 0%, ${person.color} 100%)`, borderRadius: '16px 16px 0 0', animationDelay: person.delay, position: 'relative', boxShadow: 'inset 0 4px 6px rgba(255,255,255,0.2), 0 -4px 15px rgba(0,0,0,0.2)' }}>
                                    <div className="anim-avatar" style={{ animationDelay: `calc(${person.delay} + 0.3s)`, position: 'absolute', top: '20px', width: '100%', textAlign: 'center', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                        <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: '900' }}>#{person.rank}</span>
                                        <span style={{ display: 'block', fontSize: isFirst ? '1.2rem' : '1rem', fontWeight: '800', marginTop: '8px' }}>{person.revenue}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : <div style={{ paddingBottom: '60px', color: '#94a3b8', fontSize: '1.1rem', fontStyle: 'italic' }}>Chưa có dữ liệu doanh thu từ khách hàng (Đã ĐK) cho khối Sale.</div>}
                </div>
            </div>

            <div className="card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', borderLeft: '5px solid var(--primary)', paddingLeft: '16px', marginBottom: '28px', color: '#0f172a' }}>Hiệu Suất Tư Vấn Viên</h3>
                {salesTeam.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Chưa có nhân sự Sale nào trong hệ thống CSDL.</p>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    {salesTeam.map((member) => (
                        <div key={member.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: `${member.color}20`, color: member.color, display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', fontSize: '1.2rem' }}>{member.name.split(' ').pop().charAt(0)}</div>
                                    <div>
                                        <strong style={{ display: 'block', fontSize: '1.1rem', color: '#0f172a' }}>{member.name}</strong>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>{member.role}</span>
                                    </div>
                                </div>
                                <div style={{ backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8' }}>TOP</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#334155' }}>#{member.rank}</span>
                                </div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>
                                    <span style={{ color: '#475569' }}>Tỷ lệ chốt Sale (Win Rate)</span>
                                    <span style={{ color: member.color }}>{member.conversionRate}%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${member.conversionRate}%`, height: '100%', backgroundColor: member.color, borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', padding: '12px', borderRadius: '10px', textAlign: 'center' }}><span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: '800', marginBottom: '4px' }}>ĐANG TƯ VẤN</span><span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#334155' }}>{member.consulting}</span></div>
                                <div style={{ flex: 1, backgroundColor: `${member.color}10`, border: `1px solid ${member.color}30`, color: member.color, padding: '12px', borderRadius: '10px', textAlign: 'center' }}><span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', marginBottom: '4px' }}>ĐÃ CHỐT</span><span style={{ fontSize: '1.4rem', fontWeight: '900' }}>{member.clients}</span></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #e2e8f0', paddingTop: '16px' }}>
                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}><i className="fa-solid fa-gift" style={{ marginRight: '6px', color: '#10b981' }}></i>Hoa hồng dự kiến</span>
                                <strong style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: '800' }}>{member.commission === 0 ? '0 đ' : `+${member.commission.toLocaleString('vi-VN')} đ`}</strong>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SalesRating;
