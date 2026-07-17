import "../styles/pages/TeachingAssistantProfile.css";
import React, { useState } from "react";
import { useData } from "../context/DataContext";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
});

function TeachingAssistantProfile() {
  const { addNotification } = useNotification();
  const { tas, setTas } = useData();

  const [formInput, setFormInput] = useState({
    name: "",
    email: "",
    phone: "",
    education: "",
    level: "",
    notes: "",
  });
  const [selectedTA, setSelectedTA] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    email: true,
    education: true,
    level: true,
    notes: false,
  });

  const optionalColumnsConfig = [
    { key: "email", label: "Email", icon: "fa-envelope" },
    { key: "education", label: "Học vấn", icon: "fa-graduation-cap" },
    { key: "level", label: "Trình độ", icon: "fa-award" },
    { key: "notes", label: "Ghi chú", icon: "fa-note-sticky" },
  ];

  const toggleColumn = (key) =>
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSaveTA = async (e) => {
    e.preventDefault();
    if (!formInput.name || !formInput.phone)
      return addNotification("Vui lòng nhập Họ tên và Số điện thoại!", "error", "teachers");
    try {
      const res = await api.post("/auth/register", {
        ...formInput,
        username: formInput.phone + "_ta",
        password: "123",
        role: "ta",
      });
      setTas((prev) => [res.data, ...prev]);
      setFormInput({ name: "", email: "", phone: "", education: "", level: "", notes: "" });
      addNotification("Hệ thống: Lưu thông tin hồ sơ Trợ giảng thành công!", "success", "teachers");
    } catch (error) {
      addNotification(`Lỗi: Không thể tạo Trợ giảng. ${error.response?.data?.message || error.message}`, "error", "teachers");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedTA || !selectedTA.id)
      return addNotification("Lỗi: Không xác định được ID trợ giảng!", "error", "teachers");
    try {
      const res = await api.put(`/users/${selectedTA.id}`, selectedTA);
      setTas((prev) => prev.map((t) => (t.id === selectedTA.id ? res.data : t)));
      setSelectedTA(null);
      setIsEditing(false);
      addNotification("Cập nhật thông tin trợ giảng thành công!", "success", "teachers");
    } catch (err) {
      addNotification(`Lỗi cập nhật: ${err.response?.data?.message || err.message}`, "error", "teachers");
    }
  };

  const handleDeleteTA = async (id) => {
    if (!id) return;
    if (window.confirm("Cảnh báo: Bạn có chắc chắn muốn xóa trợ giảng này khỏi hệ thống?")) {
      try {
        await api.delete(`/users/${id}`);
        setTas((prev) => prev.filter((t) => t.id !== id));
        if (selectedTA && selectedTA.id === id) setSelectedTA(null);
        addNotification("Đã xóa trợ giảng thành công!", "success", "teachers");
      } catch (err) {
        addNotification(`Lỗi xóa dữ liệu: ${err.response?.data?.message || err.message}`, "error", "teachers");
      }
    }
  };

  return (
    <div className="TeachingAssistantProfile-style-1">
      {/* FORM TIẾP NHẬN TRỢ GIẢNG */}
      <div className="card TeachingAssistantProfile-style-2">
        <h3 className="TeachingAssistantProfile-style-3">
          <i className="fa-solid fa-user-graduate TeachingAssistantProfile-style-4"></i> Thông tin Trợ giảng
        </h3>
        <form onSubmit={handleSaveTA} className="TeachingAssistantProfile-style-5">
          <div>
            <label>Họ & Tên (*)</label>
            <input
              type="text"
              className="form-control"
              value={formInput.name}
              onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Email cá nhân</label>
            <input
              type="email"
              className="form-control"
              value={formInput.email}
              onChange={(e) => setFormInput({ ...formInput, email: e.target.value })}
            />
          </div>
          <div>
            <label>Số điện thoại (*)</label>
            <input
              type="text"
              className="form-control"
              value={formInput.phone}
              onChange={(e) => setFormInput({ ...formInput, phone: e.target.value })}
              required
            />
          </div>
          <div className="TeachingAssistantProfile-style-9">
            <label>Học vấn</label>
            <input
              type="text"
              className="form-control"
              value={formInput.education}
              onChange={(e) => setFormInput({ ...formInput, education: e.target.value })}
              placeholder="VD: Sinh viên ĐH Ngoại ngữ..."
            />
          </div>
          <div>
            <label>Trình độ</label>
            <input
              type="text"
              className="form-control"
              value={formInput.level}
              onChange={(e) => setFormInput({ ...formInput, level: e.target.value })}
              placeholder="VD: HSK 5, IELTS 7.0..."
            />
          </div>
          <div className="TeachingAssistantProfile-style-12">
            <label>Ghi chú thêm về nhân sự</label>
            <textarea
              className="form-control TeachingAssistantProfile-style-14"
              rows="2"
              value={formInput.notes}
              onChange={(e) => setFormInput({ ...formInput, notes: e.target.value })}
              placeholder="Thông tin cần lưu ý..."
            ></textarea>
          </div>

          <div className="TeachingAssistantProfile-style-15">
            <button type="submit" className="TeachingAssistantProfile-style-16">
              LƯU THÔNG TIN TRỢ GIẢNG
            </button>
          </div>
        </form>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="card TeachingAssistantProfile-style-17">
        <div className="TeachingAssistantProfile-style-18">
          <div className="TeachingAssistantProfile-style-19">
            <button
              type="button"
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              style={{
                background: isPanelExpanded ? "#10b981" : "#ffffff",
                color: isPanelExpanded ? "white" : "#10b981",
                border: "1px solid #10b981",
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <i className={`fa-solid ${isPanelExpanded ? "fa-cog" : "fa-list-ul"}`}></i>
              <span>{isPanelExpanded ? "Đóng bảng chọn" : "Tùy chỉnh cột"}</span>
            </button>
            {isPanelExpanded && (
              <div className="TeachingAssistantProfile-style-20">
                <button
                  onClick={() =>
                    setVisibleColumns(
                      Object.keys(visibleColumns).reduce((acc, key) => ({ ...acc, [key]: true }), {})
                    )
                  }
                  className="TeachingAssistantProfile-style-21"
                >
                  Chọn tất cả
                </button>
                <button
                  onClick={() =>
                    setVisibleColumns(
                      Object.keys(visibleColumns).reduce((acc, key) => ({ ...acc, [key]: false }), {})
                    )
                  }
                  className="TeachingAssistantProfile-style-22"
                >
                  Bỏ chọn
                </button>
              </div>
            )}
          </div>
          {isPanelExpanded && (
            <div className="TeachingAssistantProfile-style-23">
              {optionalColumnsConfig.map((col) => (
                <label
                  key={col.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 12px",
                    backgroundColor: visibleColumns[col.key] ? "#ecfdf5" : "#f8fafc",
                    border: visibleColumns[col.key] ? "1px solid #10b981" : "1px solid #e2e8f0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: visibleColumns[col.key] ? "#059669" : "#475569",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns[col.key]}
                    onChange={() => toggleColumn(col.key)}
                  />
                  <i className={`fa-solid ${col.icon}`}></i> {col.label}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="TeachingAssistantProfile-style-24">
          <table className="TeachingAssistantProfile-style-25">
            <thead className="TeachingAssistantProfile-style-26">
              <tr>
                <th className="TeachingAssistantProfile-style-27">STT</th>
                <th className="TeachingAssistantProfile-style-28">HỌ & TÊN</th>
                <th className="TeachingAssistantProfile-style-29">SĐT</th>
                {visibleColumns.email && <th className="TeachingAssistantProfile-style-30">EMAIL</th>}
                {visibleColumns.education && <th className="TeachingAssistantProfile-style-31">HỌC VẤN</th>}
                {visibleColumns.level && <th className="TeachingAssistantProfile-style-32">TRÌNH ĐỘ</th>}
                {visibleColumns.notes && <th className="TeachingAssistantProfile-style-33">GHI CHÚ</th>}
                <th className="TeachingAssistantProfile-style-34">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {tas && tas.length === 0 && (
                <tr>
                  <td colSpan="8" className="TeachingAssistantProfile-style-35">
                    Chưa có trợ giảng trong hệ thống.
                  </td>
                </tr>
              )}
              {tas &&
                tas.map((t, idx) => (
                  <tr key={t.id || idx} className="TeachingAssistantProfile-style-36">
                    <td className="TeachingAssistantProfile-style-37">{idx + 1}</td>
                    <td className="TeachingAssistantProfile-style-38">
                      <span
                        className="TeachingAssistantProfile-style-39"
                        onClick={() => {
                          setSelectedTA({ ...t });
                          setIsEditing(false);
                        }}
                      >
                        {t.name || "---"}
                      </span>
                    </td>
                    <td className="TeachingAssistantProfile-style-40">{t.phone || "---"}</td>
                    {visibleColumns.email && <td className="TeachingAssistantProfile-style-41">{t.email || "---"}</td>}
                    {visibleColumns.education && <td className="TeachingAssistantProfile-style-42">{t.education || "---"}</td>}
                    {visibleColumns.level && (
                      <td className="TeachingAssistantProfile-style-43">
                        <span className="TeachingAssistantProfile-style-44">{t.level || "---"}</span>
                      </td>
                    )}
                    {visibleColumns.notes && (
                      <td className="TeachingAssistantProfile-style-45" title={t.notes}>{t.notes || "---"}</td>
                    )}
                    <td className="TeachingAssistantProfile-style-46">
                      <div className="TeachingAssistantProfile-style-47">
                        <button
                          onClick={() => {
                            setSelectedTA({ ...t });
                            setIsEditing(true);
                          }}
                          title="Sửa"
                          className="TeachingAssistantProfile-style-48"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteTA(t.id)}
                          title="Xóa"
                          className="TeachingAssistantProfile-style-49"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CHI TIẾT & CHỈNH SỬA */}
      {selectedTA && (
        <div className="TeachingAssistantProfile-style-50" onClick={() => setSelectedTA(null)}>
          <div className="TeachingAssistantProfile-style-51" onClick={(e) => e.stopPropagation()}>
            <div className="TeachingAssistantProfile-style-52">
              <h3 className="TeachingAssistantProfile-style-53">
                <i className="fa-solid fa-user-pen"></i> {isEditing ? "Chỉnh sửa hồ sơ" : "Hồ sơ trợ giảng"}
              </h3>
              <button onClick={() => setSelectedTA(null)} className="TeachingAssistantProfile-style-54">✖</button>
            </div>

            <div className="TeachingAssistantProfile-style-55">
              <div>
                <label>Họ và tên</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedTA.name || ""}
                    onChange={(e) => setSelectedTA({ ...selectedTA, name: e.target.value })}
                  />
                ) : (
                  <div className="TeachingAssistantProfile-style-57">{selectedTA.name || "---"}</div>
                )}
              </div>
              <div>
                <label>Số điện thoại</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedTA.phone || ""}
                    onChange={(e) => setSelectedTA({ ...selectedTA, phone: e.target.value })}
                  />
                ) : (
                  <div className="TeachingAssistantProfile-style-59">{selectedTA.phone || "---"}</div>
                )}
              </div>
              <div className="TeachingAssistantProfile-style-60">
                <label>Email</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedTA.email || ""}
                    onChange={(e) => setSelectedTA({ ...selectedTA, email: e.target.value })}
                  />
                ) : (
                  <div className="TeachingAssistantProfile-style-62">{selectedTA.email || "---"}</div>
                )}
              </div>
              <div className="TeachingAssistantProfile-style-63">
                <label>Học vấn</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedTA.education || ""}
                    onChange={(e) => setSelectedTA({ ...selectedTA, education: e.target.value })}
                  />
                ) : (
                  <div className="TeachingAssistantProfile-style-65">{selectedTA.education || "---"}</div>
                )}
              </div>
              <div className="TeachingAssistantProfile-style-66">
                <label>Trình độ</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedTA.level || ""}
                    onChange={(e) => setSelectedTA({ ...selectedTA, level: e.target.value })}
                  />
                ) : (
                  <div className="TeachingAssistantProfile-style-68">{selectedTA.level || "---"}</div>
                )}
              </div>
              <div className="TeachingAssistantProfile-style-69">
                <label>Ghi chú thêm về nhân sự</label>
                {isEditing ? (
                  <textarea
                    className="form-control TeachingAssistantProfile-style-71"
                    rows="2"
                    value={selectedTA.notes || ""}
                    onChange={(e) => setSelectedTA({ ...selectedTA, notes: e.target.value })}
                  />
                ) : (
                  <div className="TeachingAssistantProfile-style-72">{selectedTA.notes || "---"}</div>
                )}
              </div>
            </div>

            <div className="TeachingAssistantProfile-style-73">
              <button className="TeachingAssistantProfile-style-74" onClick={() => handleDeleteTA(selectedTA.id)}>
                <i className="fa-solid fa-trash"></i> Xóa hồ sơ
              </button>
              {!isEditing ? (
                <button className="TeachingAssistantProfile-style-75" onClick={() => setIsEditing(true)}>
                  <i className="fa-solid fa-pen"></i> Sửa thông tin
                </button>
              ) : (
                <button className="TeachingAssistantProfile-style-76" onClick={handleSaveEdit}>
                  <i className="fa-solid fa-floppy-disk"></i> Lưu thay đổi
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeachingAssistantProfile;
