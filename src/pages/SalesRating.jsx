import "../styles/pages/SalesRating.css";
import React, { useState, useEffect, useMemo } from "react";
import { useData } from "../context/DataContext";
import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
});
function SalesRating() {
  const { customers } = useData();
  const [rawSalesUsers, setRawSalesUsers] = useState([]);
  useEffect(() => {
    api
      .get("/users/role/sales")
      .then((res) => setRawSalesUsers(res.data))
      .catch(() => console.log("Chưa lấy được danh sách tài khoản Sale."));
  }, []);
  const salesTeam = useMemo(() => {
    if (!customers) return [];

    // --- BỘ LỌC ĐỊNH DANH (ALIAS MAPPING) ---
    // Ép mọi biến thể của "Nghiêm Linh" về chung 1 chuẩn để chống lỗi nhân bản
    const normalize = (str) => {
      if (!str) return "";
      let s = str.toString().trim().replace(/\s+/g, " ").toLowerCase();

      // Nếu phát hiện gõ tắt, tự động quy về tên gốc
      if (
        s === "nghiêm linh" ||
        s === "nghiem linh" ||
        s === "ngoai ngu nghiem linh"
      ) {
        return "ngoại ngữ nghiêm linh";
      }
      return s;
    };
    const crmSalesNames = customers
      .map((c) => c.saleInCharge?.trim())
      .filter(Boolean);
    const dbSalesNames = rawSalesUsers.map((u) => u.name || u.username);
    const allNames = [...dbSalesNames, ...crmSalesNames];
    const nameMap = new Map();
    allNames.forEach((rawName) => {
      if (!rawName) return;
      const normKey = normalize(rawName);

      // Chỉ giữ lại 1 tên duy nhất. Ép tên hiển thị đẹp cho Admin
      if (!nameMap.has(normKey)) {
        if (normKey === "ngoại ngữ nghiêm linh") {
          nameMap.set(normKey, "Ngoại Ngữ Nghiêm Linh");
        } else {
          nameMap.set(normKey, rawName.trim().replace(/\s+/g, " "));
        }
      }
    });
    const uniqueNames = Array.from(nameMap.values());
    let formatted = uniqueNames.map((salesName, index) => {
      const normSaleName = normalize(salesName);

      // Dùng tên đã chuẩn hóa để gom tất cả khách hàng bị ghi sai tên vào đúng 1 người
      const myCustomers = customers.filter(
        (c) => normalize(c.saleInCharge) === normSaleName,
      );
      const closed = myCustomers.filter((c) => c.status === "Đã ĐK").length;
      const consulting = myCustomers.length - closed;
      const totalRevenue = myCustomers
        .filter((c) => c.status === "Đã ĐK")
        .reduce((sum, c) => sum + (parseInt(c.fee) || 0), 0);
      const conversionRate =
        myCustomers.length > 0
          ? Math.round((closed / myCustomers.length) * 100)
          : 0;
      const revenueFormatted =
        totalRevenue >= 1000000
          ? (totalRevenue / 1000000).toFixed(1) + "M"
          : totalRevenue.toLocaleString("vi-VN");
      return {
        id: `sale_${index}`,
        name: salesName,
        role: "Chuyên viên Tư vấn",
        revenue: revenueFormatted,
        revenueValue: totalRevenue,
        clients: closed,
        consulting: consulting,
        totalLeads: myCustomers.length,
        conversionRate: conversionRate,
        commission: totalRevenue * 0.1,
        color:
          ["#facc15", "#38bdf8", "#f97316", "#a855f7", "#10b981"][index % 5] ||
          "#94a3b8",
        bg:
          ["#eab308", "#0284c7", "#ea580c", "#9333ea", "#16a34a"][index % 5] ||
          "#64748b",
      };
    });
    formatted.sort((a, b) => b.revenueValue - a.revenueValue);
    formatted.forEach((member, idx) => (member.rank = idx + 1));
    return formatted;
  }, [rawSalesUsers, customers]);
  const totalClosed = customers
    ? customers.filter((c) => c.status === "Đã ĐK").length
    : 0;
  const totalCustomers = customers ? customers.length : 0;
  const conversionRateCenter =
    totalCustomers > 0 ? ((totalClosed / totalCustomers) * 100).toFixed(1) : 0;
  const totalRevenueAll = customers
    ? customers
        .filter((c) => c.status === "Đã ĐK")
        .reduce((sum, c) => sum + (parseInt(c.fee) || 0), 0)
    : 0;
  const top3 = salesTeam.slice(0, 3);
  let podiumOrder = [];
  if (top3.length === 1)
    podiumOrder = [
      {
        ...top3[0],
        height: "220px",
        delay: "0.2s",
        size: "large",
      },
    ];
  else if (top3.length === 2)
    podiumOrder = [
      {
        ...top3[1],
        height: "150px",
        delay: "0.4s",
        size: "medium",
      },
      {
        ...top3[0],
        height: "220px",
        delay: "0.2s",
        size: "large",
      },
    ];
  else if (top3.length >= 3)
    podiumOrder = [
      {
        ...top3[1],
        height: "160px",
        delay: "0.4s",
        size: "medium",
      },
      {
        ...top3[0],
        height: "220px",
        delay: "0.2s",
        size: "large",
      },
      {
        ...top3[2],
        height: "110px",
        delay: "0.6s",
        size: "small",
      },
    ];
  return (
    <div className="SalesRating-style-1">
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

      <div className="SalesRating-style-2">
        <div className="stat-card">
          <div className="stat-info">
            <span>Tổng doanh thu khối Sale</span>
            <strong>{totalRevenueAll.toLocaleString("vi-VN")} đ</strong>
          </div>
          <div className="stat-icon SalesRating-style-3">
            <i className="fa-solid fa-sack-dollar"></i>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span>Tỷ lệ chuyển đổi chung</span>
            <strong>{conversionRateCenter}%</strong>
          </div>
          <div className="stat-icon SalesRating-style-4">
            <i className="fa-solid fa-chart-pie"></i>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span>Số lượng Sale hoạt động</span>
            <strong>{salesTeam.length} Nhân sự</strong>
          </div>
          <div className="stat-icon SalesRating-style-5">
            <i className="fa-solid fa-users"></i>
          </div>
        </div>
      </div>

      <div className="SalesRating-style-6">
        <h3 className="SalesRating-style-7">
          <i className="fa-solid fa-ranking-star SalesRating-style-8"></i>
          BẢNG XẾP HẠNG DOANH SỐ THÁNG
        </h3>

        <div className="SalesRating-style-9">
          {podiumOrder.length > 0 ? (
            podiumOrder.map((person) => {
              const isFirst = person.rank === 1;
              const avatarSize = isFirst ? "80px" : "65px";
              const colWidth = isFirst ? "160px" : "130px";
              return (
                <div
                  key={person.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: colWidth,
                  }}
                >
                  <div
                    className="anim-avatar"
                    style={{
                      animationDelay: person.delay,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    {isFirst && (
                      <i className="fa-solid fa-crown SalesRating-style-10"></i>
                    )}
                    <div
                      style={{
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: "50%",
                        backgroundColor: "white",
                        color: "#0f172a",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontWeight: "800",
                        fontSize: isFirst ? "1.5rem" : "1.2rem",
                        marginBottom: "12px",
                        border: `4px solid ${person.color}`,
                        boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
                        zIndex: 2,
                      }}
                    >
                      {person.name
                        .split(" ")
                        .pop()
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <span
                      style={{
                        fontWeight: "800",
                        fontSize: isFirst ? "1.1rem" : "0.95rem",
                        marginBottom: "16px",
                        textAlign: "center",
                        color: "#f8fafc",
                      }}
                    >
                      {person.name}
                    </span>
                  </div>
                  <div
                    className="anim-column"
                    style={{
                      "--target-height": person.height,
                      width: "100%",
                      background: `linear-gradient(180deg, ${person.bg} 0%, ${person.color} 100%)`,
                      borderRadius: "16px 16px 0 0",
                      animationDelay: person.delay,
                      position: "relative",
                      boxShadow:
                        "inset 0 4px 6px rgba(255,255,255,0.2), 0 -4px 15px rgba(0,0,0,0.2)",
                    }}
                  >
                    <div
                      className="anim-avatar"
                      style={{
                        animationDelay: `calc(${person.delay} + 0.3s)`,
                        position: "absolute",
                        top: "20px",
                        width: "100%",
                        textAlign: "center",
                        color: "white",
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      }}
                    >
                      <span className="SalesRating-style-11">
                        #{person.rank}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: isFirst ? "1.2rem" : "1rem",
                          fontWeight: "800",
                          marginTop: "8px",
                        }}
                      >
                        {person.revenue}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="SalesRating-style-12">
              Chưa có dữ liệu doanh thu từ khách hàng (Đã ĐK) cho khối Sale.
            </div>
          )}
        </div>
      </div>

      <div className="card SalesRating-style-13">
        <h3 className="SalesRating-style-14">Hiệu Suất Tư Vấn Viên</h3>
        {salesTeam.length === 0 && (
          <p className="SalesRating-style-15">
            Chưa có nhân sự Sale nào trong hệ thống CSDL.
          </p>
        )}
        <div className="SalesRating-style-16">
          {salesTeam.map((member) => (
            <div key={member.id} className="SalesRating-style-17">
              <div className="SalesRating-style-18">
                <div className="SalesRating-style-19">
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "12px",
                      backgroundColor: `${member.color}20`,
                      color: member.color,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: "900",
                      fontSize: "1.2rem",
                    }}
                  >
                    {member.name.split(" ").pop().charAt(0)}
                  </div>
                  <div>
                    <strong className="SalesRating-style-20">
                      {member.name}
                    </strong>
                    <span className="SalesRating-style-21">{member.role}</span>
                  </div>
                </div>
                <div className="SalesRating-style-22">
                  <span className="SalesRating-style-23">TOP</span>
                  <span className="SalesRating-style-24">#{member.rank}</span>
                </div>
              </div>
              <div className="SalesRating-style-25">
                <div className="SalesRating-style-26">
                  <span className="SalesRating-style-27">
                    Tỷ lệ chốt Sale (Win Rate)
                  </span>
                  <span
                    style={{
                      color: member.color,
                    }}
                  >
                    {member.conversionRate}%
                  </span>
                </div>
                <div className="SalesRating-style-28">
                  <div
                    style={{
                      width: `${member.conversionRate}%`,
                      height: "100%",
                      backgroundColor: member.color,
                      borderRadius: "4px",
                      transition: "width 0.5s ease",
                    }}
                  ></div>
                </div>
              </div>
              <div className="SalesRating-style-29">
                <div className="SalesRating-style-30">
                  <span className="SalesRating-style-31">ĐANG TƯ VẤN</span>
                  <span className="SalesRating-style-32">
                    {member.consulting}
                  </span>
                </div>
                <div
                  style={{
                    flex: 1,
                    backgroundColor: `${member.color}10`,
                    border: `1px solid ${member.color}30`,
                    color: member.color,
                    padding: "12px",
                    borderRadius: "10px",
                    textAlign: "center",
                  }}
                >
                  <span className="SalesRating-style-33">ĐÃ CHỐT</span>
                  <span className="SalesRating-style-34">{member.clients}</span>
                </div>
              </div>
              <div className="SalesRating-style-35">
                <span className="SalesRating-style-36">
                  <i className="fa-solid fa-gift SalesRating-style-37"></i>Hoa
                  hồng dự kiến
                </span>
                <strong className="SalesRating-style-38">
                  {member.commission === 0
                    ? "0 đ"
                    : `+${member.commission.toLocaleString("vi-VN")} đ`}
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
