import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api'
});

function Dashboard() {
    const [metrics, setMetrics] = useState({ totalStudents: 18, activeClassesCount: 4, revenue: '245M' });
    const revenueChartRef = useRef(null);
    const leadChartRef = useRef(null);

    useEffect(() => {
        // Đồng bộ các chỉ số KPI thực tế từ CSDL
        api.get('/dashboard/metrics')
            .then(res => setMetrics(res.data))
            .catch(() => console.log("Sử dụng các thông số phân tích cơ sở mặc định."));

        let revenueChartInstance = null;
        if (revenueChartRef.current) {
            const ctx = revenueChartRef.current.getContext('2d');
            revenueChartInstance = new window.Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5'],
                    datasets: [{
                        label: 'Doanh thu trung tâm (Triệu VND)',
                        data: [45, 72, 98, 120, 245],
                        backgroundColor: '#4f46e5',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { font: { family: 'Inter' } } } }
                }
            });
        }

        let leadChartInstance = null;
        if (leadChartRef.current) {
            const ctx = leadChartRef.current.getContext('2d');
            leadChartInstance = new window.Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Facebook Ads', 'Google Search', 'Website Đăng Ký', 'Giới Thiệu'],
                    datasets: [{
                        data: [55, 20, 15, 10],
                        backgroundColor: ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter' } } } }
                }
            });
        }

        return () => {
            if (revenueChartInstance) revenueChartInstance.destroy();
            if (leadChartInstance) leadChartInstance.destroy();
        };
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="kpi-row">
                <div className="card kpi-card-simple">
                    <div>
                        <div className="kpi-card-label">Học viên chính thức</div>
                        <div className="kpi-card-number">{metrics.totalStudents}</div>
                    </div>
                    <div className="kpi-card-circle-icon purple">
                        <i className="fa-solid fa-user-graduate"></i>
                    </div>
                </div>
                <div className="card kpi-card-simple">
                    <div>
                        <div className="kpi-card-label">Lớp học hoạt động</div>
                        <div className="kpi-card-number">{metrics.activeClassesCount}</div>
                    </div>
                    <div className="kpi-card-circle-icon pink">
                        <i className="fa-solid fa-school"></i>
                    </div>
                </div>
                <div className="card kpi-card-simple">
                    <div>
                        <div className="kpi-card-label">Doanh thu tháng này</div>
                        <div className="kpi-card-number">{metrics.revenue}</div>
                    </div>
                    <div className="kpi-card-circle-icon blue">
                        <i className="fa-solid fa-sack-dollar"></i>
                    </div>
                </div>
            </div>

            <div className="my-portal-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
                        <i className="fa-solid fa-chart-line" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
                        Chỉ tiêu tuyển sinh & Doanh số dòng tiền
                    </h3>
                    <div style={{ height: '280px', position: 'relative' }}>
                        <canvas ref={revenueChartRef}></canvas>
                    </div>
                </div>
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
                        <i className="fa-solid fa-pie-chart" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
                        Phân bổ nguồn kênh khách hàng tiềm năng
                    </h3>
                    <div style={{ height: '280px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                        <canvas ref={leadChartRef}></canvas>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;