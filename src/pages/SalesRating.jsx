import React, { useState } from 'react';

function SalesRating() {
    // Dữ liệu mock 5 nhân viên sale y hệt tài liệu Hình 2.2
    const [salesTeam, setSalesTeam] = useState([
        { id: 1, name: 'Đoàn Đăng Khoa', role: 'SALES EXECUTIVE', revenue: '26.2M', clients: 14, rank: 1, color: '#facc15', bg: '#eab308' },
        { id: 2, name: 'Nguyễn Đức Trung', role: 'SALES EXECUTIVE', revenue: '6.3M', clients: 3, rank: 2, color: '#e2e8f0', bg: '#cbd5e1' },
        { id: 3, name: 'Lê Thiên Giao Hạ', role: 'SALES EXECUTIVE', revenue: '2.9M', clients: 1, rank: 3, color: '#f97316', bg: '#ea580c' },
        { id: 4, name: 'Đinh Thị Thủy Tiên', role: 'SALES EXECUTIVE', revenue: '0', clients: 0, rank: 4, color: '#a855f7', bg: '#9333ea' },
        { id: 5, name: 'Trần Thị Diễm Quỳnh', role: 'SALES EXECUTIVE', revenue: '0', clients: 0, rank: 5, color: '#10b981', bg: '#16a34a' },
    ]);

    // Lọc ra Top 3 và sắp xếp theo thứ tự hiển thị trên bục: Hạng 2 (Trái) - Hạng 1 (Giữa) - Hạng 3 (Phải)
    const top3Data = salesTeam.filter(s => s.rank <= 3).sort((a, b) => a.rank - b.rank);
    const podiumOrder = [
        { ...top3Data[1], height: '130px', animDelayCol: '0.2s', animDelayText: '0.8s' }, // Hạng 2
        { ...top3Data[0], height: '200px', animDelayCol: '0.4s', animDelayText: '1.0s' }, // Hạng 1
        { ...top3Data[2], height: '90px', animDelayCol: '0.0s', animDelayText: '0.6s' }  // Hạng 3
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* NHÚNG CSS ANIMATION TRỰC TIẾP */}
            <style>
                {`
                    @keyframes riseUp {
                        0% { height: 0px; }
                        100% { height: var(--target-height); }
                    }
                    @keyframes fadeInText {
                        0% { opacity: 0; transform: translateY(10px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                    .anim-column {
                        height: 0px;
                        animation: riseUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    .anim-text {
                        opacity: 0;
                        animation: fadeInText 0.5s ease-out forwards;
                    }
                `}
            </style>

            {/* KPI TỔNG HỢP KHỐI KINH DOANH */}
            <div className="kpi-row">
                <div className="card kpi-card-simple">
                    <div><div className="kpi-card-label">Tổng doanh thu khối Sale</div><div className="kpi-card-number">35.400.000 VNĐ</div></div>
                    <div className="kpi-card-circle-icon purple"><i className="fa-solid fa-chart-line"></i></div>
                </div>
                <div className="card kpi-card-simple">
                    <div><div className="kpi-card-label">Tỷ lệ chuyển đổi chung</div><div className="kpi-card-number">21.8%</div></div>
                    <div className="kpi-card-circle-icon success" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}><i className="fa-solid fa-percentage"></i></div>
                </div>
            </div>

            {/* PHẦN 1: BỤC VINH DANH (Đã sửa lỗi justifyContent căn giữa) */}
            <div style={{ backgroundColor: '#5b21b6', borderRadius: '16px', padding: '32px 32px 0 32px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <h3 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>👑 BẢNG XẾP HẠNG DOANH SỐ</h3>

                {/* ĐÃ SỬA: Đổi từ justifycontent thành justifyContent để căn giữa bục vinh danh */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '16px', height: '340px', paddingBottom: '0' }}>

                    {podiumOrder.map((person, index) => (
                        <div key={person.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: index === 1 ? '150px' : '130px' }}>

                            {/* Avatar và Tên */}
                            <div className="anim-text" style={{ animationDelay: person.animDelayText, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {/* ĐÃ SỬA: Đổi justifycontent thành justifyContent bên trong avatar */}
                                <div style={{
                                    width: index === 1 ? '70px' : '60px',
                                    height: index === 1 ? '70px' : '60px',
                                    borderRadius: '50%', backgroundColor: 'white', color: 'black',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    fontWeight: '800', fontSize: index === 1 ? '1.4rem' : '1.1rem',
                                    marginBottom: '8px', border: `4px solid ${person.color}`,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }}>
                                    {person.name.split(' ').pop().substring(0, 2).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '16px', textAlign: 'center', lineHeight: '1.2' }}>
                                    {person.name}
                                </span>
                            </div>

                            {/* Cột Bục */}
                            <div className="anim-column" style={{
                                '--target-height': person.height,
                                width: '100%',
                                backgroundColor: person.bg,
                                borderRadius: '12px 12px 0 0',
                                animationDelay: person.animDelayCol,
                                position: 'relative',
                                boxShadow: '0 -4px 15px rgba(0,0,0,0.1)'
                            }}>
                                {/* Thông tin Doanh thu */}
                                <div className="anim-text" style={{
                                    animationDelay: person.animDelayText,
                                    position: 'absolute',
                                    bottom: '16px',
                                    width: '100%',
                                    textAlign: 'center',
                                    color: index === 1 ? '#854d0e' : 'white'
                                }}>
                                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', opacity: 0.9, letterSpacing: '0.05em' }}>DOANH THU</span>
                                    <span style={{ display: 'block', fontWeight: '800', fontSize: '1.2rem', marginTop: '2px' }}>{person.revenue}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            </div>

            {/* PHẦN 2: LƯỚI DANH SÁCH TƯ VẤN VIÊN */}
            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', borderLeft: '4px solid var(--primary)', paddingLeft: '12px', marginBottom: '24px' }}>Đội ngũ Tư Vấn Viên</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    {salesTeam.map((member) => (
                        <div key={member.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', backgroundColor: 'white', boxShadow: 'var(--shadow-sm)' }}>
                            {/* ĐÃ SỬA: Đổi justifycontent thành justifyContent nếu có ở khu vực header thẻ */}
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
                                    <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>0</span>
                                </div>
                                <div style={{ flex: 1, backgroundColor: `${member.color}15`, color: member.color, padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700' }}>ĐÃ CHỐT</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{member.clients}</span>
                                </div>
                            </div>

                            {/* ĐÃ SỬA: Đổi từ justifycontent thành justifyContent ở chân thẻ */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hoa hồng tháng này</span>
                                <strong style={{ color: 'var(--primary)' }}>{member.revenue === '0' ? 'đ' : '145.000 đ'}</strong>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SalesRating;