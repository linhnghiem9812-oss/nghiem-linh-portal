import "../styles/pages/TeacherProfile.css";
import React, { useState } from "react";
import { useData } from "../context/DataContext";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
});

function TeacherProfile() {
  const { addNotification } = useNotification();
  const { teachers, setTeachers } = useData();

  const [formInput, setFormInput] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    fee: "",
    address: "",
    notes: "",
    status: "Đang dạy",
  });

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  // Mặc định ẩn địa chỉ và ghi chú để bảng gọn gàng vừa màn hình
  const [visibleColumns, setVisibleColumns] = useState({
    email: true,
    experience: true,
    fee: true,
    address: false,
    notes: false,
    status: true,
  });

  const optionalColumnsConfig = [
    { key: "email", label: "Email", icon: "fa-envelope" },
    { key: "experience", label: "Kinh nghiệm", icon: "fa-book" },
    { key: "fee", label: "Lương/Buổi", icon: "fa-wallet" },
    { key: "address", label: "Địa chỉ", icon: "fa-location-dot" },
    { key: "notes", label: "Ghi chú", icon: "fa-note-sticky" },
    { key: "status", label: "Trạng thái", icon: "fa-user-check" },
  ];

  const toggleColumn = (key) =>
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleInputChange = (e) =>
    setFormInput({ ...formInput, [e.target.name]: e.target.value });

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    if (!formInput.name || !formInput.phone)
      return addNotification("Vui lòng nhập Họ tên và Số điện thoại!", "error", "teachers");
    try {
      const payload = {
        ...formInput,
        salary: formInput.fee ? parseInt(formInput.fee) : 0,
        username: formInput.phone + "_teacher",
        password: "123",
        role: "teacher",
      };
      const res = await api.post("/auth/register", payload);
      setTeachers((prev) => [res.data, ...prev]);
      addNotification("Hệ thống: Lưu thông tin hồ sơ giáo viên thành công!", "success", "teachers");
      setFormInput({
        name: "", email: "", phone: "", experience: "", fee: "", address: "", notes: "", status: "Đang dạy",
      });
    } catch (err) {
      addNotification("Lỗi tạo giáo viên: " + (err.response?.data?.message || err.message), "error", "teachers");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedTeacher || !selectedTeacher.id)
      return addNotification("Lỗi: Không xác định được ID giáo viên!", "error", "teachers");
    try {
      const payload = {
        ...selectedTeacher,
        salary: selectedTeacher.fee ? parseInt(selectedTeacher.fee) : selectedTeacher.salary || 0,
      };
      const res = await api.put(`/users/${selectedTeacher.id}`, payload);
      setTeachers((prev) => prev.map((t) => (t.id === selectedTeacher.id ? res.data : t)));
      setSelectedTeacher(null);
      setIsEditing(false);
      addNotification("Hệ thống: Cập nhật thông tin thành công!", "success", "teachers");
    } catch (err) {
      addNotification(`Lỗi cập nhật: ${err.response?.data?.message || err.message}`, "error", "teachers");
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!id) return;
    if (window.confirm("Cảnh báo: Bạn có chắc chắn muốn xóa giáo viên này khỏi hệ thống?")) {
      try {
        await api.delete(`/users/${id}`);
        setTeachers((prev) => prev.filter((t) => t.id !== id));
        if (selectedTeacher && selectedTeacher.id === id) setSelectedTeacher(null);
        addNotification("Hệ thống: Đã xóa giáo viên thành công!", "success", "teachers");
      } catch (err) {
        addNotification(`Lỗi xóa dữ liệu: ${err.response?.data?.message || err.message}`, "error", "teachers");
      }
    }
  };

  return (
    <div className="TeacherProfile-style-1">
      {/* FORM TIẾP NHẬN GIÁO VIÊN */}
      <div className="card TeacherProfile-style-2">
        <h3 className="TeacherProfile-style-3">
          <i className="fa-solid fa-user-plus TeacherProfile-style-4"></i> Tiếp nhận giáo viên / Nhập thông tin nhân sự
        </h3>
        <form onSubmit={handleSaveTeacher} className="TeacherProfile-style-5">
          <div>
            <label>Họ và tên (*)</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Ví dụ: Điệp Mạnh"
              value={formInput.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Email cá nhân</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="teacher@nghiemlinh.edu.vn"
              value={formInput.email}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Số điện thoại (*)</label>
            <input
              type="text"
              name="phone"
              className="form-control"
              placeholder="09xxxxxxxx"
              value={formInput.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="TeacherProfile-style-6">
            <label>Học vấn & Kinh nghiệm giảng dạy</label>
            <input
              type="text"
              name="experience"
              className="form-control"
              placeholder="Chứng chỉ HSK, thâm niên dạy..."
              value={formInput.experience}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Mức học phí (VNĐ) / Buổi dạy</label>
            <input
              type="number"
              name="fee"
              className="form-control"
              placeholder="350000"
              value={formInput.fee}
              onChange={handleInputChange}
            />
          </div>
          <div className="TeacherProfile-style-7">
            <label>Địa chỉ</label>
            <input
              type="text"
              name="address"
              className="form-control"
              value={formInput.address}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Trạng thái</label>
            <select
              name="status"
              className="form-control"
              value={formInput.status}
              onChange={handleInputChange}
            >
              <option value="Đang dạy">Đang dạy</option>
              <option value="Tạm nghỉ">Tạm nghỉ</option>
              <option value="Đã nghỉ">Đã nghỉ</option>
            </select>
          </div>
          <div className="TeacherProfile-style-8">
            <label>Ghi chú thêm về nhân sự</label>
            <textarea
              name="notes"
              className="form-control TeacherProfile-style-9"
              rows="2"
              placeholder="Ví dụ: Chỉ dạy được buổi tối, có kỹ năng làm MC..."
              value={formInput.notes}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="TeacherProfile-style-10">
            <button type="submit" className="TeacherProfile-style-11">
              LƯU THÔNG TIN GIÁO VIÊN
            </button>
          </div>
        </form>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="card TeacherProfile-style-12">
        <div className="TeacherProfile-style-13">
          <div className="TeacherProfile-style-14">
            <button
              type="button"
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              style={{
                background: isPanelExpanded ? "#2563eb" : "#ffffff",
                color: isPanelExpanded ? "white" : "#2563eb",
                border: "1px solid #2563eb",
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
              <div className="TeacherProfile-style-15">
                <button
                  onClick={() =>
                    setVisibleColumns(
                      Object.keys(visibleColumns).reduce((acc, key) => ({ ...acc, [key]: true }), {})
                    )
                  }
                  className="TeacherProfile-style-16"
                >
                  Chọn tất cả
                </button>
                <button
                  onClick={() =>
                    setVisibleColumns(
                      Object.keys(visibleColumns).reduce((acc, key) => ({ ...acc, [key]: false }), {})
                    )
                  }
                  className="TeacherProfile-style-17"
                >
                  Bỏ chọn
                </button>
              </div>
            )}
          </div>
          {isPanelExpanded && (
            <div className="TeacherProfile-style-18">
              {optionalColumnsConfig.map((col) => (
                <label
                  key={col.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 12px",
                    backgroundColor: visibleColumns[col.key] ? "#eff6ff" : "#f8fafc",
                    border: visibleColumns[col.key] ? "1px solid #2563eb" : "1px solid #e2e8f0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: visibleColumns[col.key] ? "#2563eb" : "#475569",
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

        <div className="TeacherProfile-style-19">
          <table className="TeacherProfile-style-20">
            <thead className="TeacherProfile-style-21">
              <tr>
                <th className="TeacherProfile-style-22">STT</th>
                <th className="TeacherProfile-style-23">HỌ TÊN</th>
                <th className="TeacherProfile-style-24">SĐT</th>
                {visibleColumns.email && <th className="TeacherProfile-style-25">EMAIL</th>}
                {visibleColumns.experience && <th className="TeacherProfile-style-26">KINH NGHIỆM</th>}
                {visibleColumns.fee && <th className="TeacherProfile-style-27">LƯƠNG</th>}
                {visibleColumns.address && <th className="TeacherProfile-style-28">ĐỊA CHỈ</th>}
                {visibleColumns.notes && <th className="TeacherProfile-style-29">GHI CHÚ</th>}
                {visibleColumns.status && <th className="TeacherProfile-style-30">TRẠNG THÁI</th>}
                <th className="TeacherProfile-style-31">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {teachers && teachers.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Chưa có giáo viên nào trong CSDL.
                  </td>
                </tr>
              )}
              {teachers &&
                teachers.map((t, idx) => (
                  <tr key={t.id || idx} className="TeacherProfile-style-32">
                    <td className="TeacherProfile-style-33">{idx + 1}</td>
                    <td className="TeacherProfile-style-34">
                      <span
                        className="TeacherProfile-style-35"
                        onClick={() => {
                          setSelectedTeacher({ ...t });
                          setIsEditing(false);
                        }}
                      >
                        {t.name || "---"}
                      </span>
                    </td>
                    <td className="TeacherProfile-style-36">{t.phone || "---"}</td>
                    {visibleColumns.email && <td className="TeacherProfile-style-37">{t.email || "---"}</td>}
                    {visibleColumns.experience && <td className="TeacherProfile-style-38">{t.experience || "---"}</td>}
                    {visibleColumns.fee && (
                      <td className="TeacherProfile-style-39">
                        {t.salary || t.fee ? `${parseInt(t.salary || t.fee).toLocaleString("vi-VN")} đ` : "---"}
                      </td>
                    )}
                    {visibleColumns.address && <td className="TeacherProfile-style-40">{t.address || "---"}</td>}
                    {visibleColumns.notes && (
                      <td className="TeacherProfile-style-41" title={t.notes}>{t.notes || "---"}</td>
                    )}
                    {visibleColumns.status && (
                      <td className="TeacherProfile-style-42">
                        <span
                          style={{
                            backgroundColor: t.status === "Đang dạy" ? "#dcfce7" : "#fee2e2",
                            color: t.status === "Đang dạy" ? "#166534" : "#b91c1c",
                            padding: "4px 10px",
                            borderRadius: "50px",
                            fontSize: "0.75rem",
                            fontWeight: "800",
                          }}
                        >
                          {t.status || "Đang dạy"}
                        </span>
                      </td>
                    )}
                    <td className="TeacherProfile-style-43">
                      <div className="TeacherProfile-style-44">
                        <button
                          onClick={() => {
                            setSelectedTeacher({ ...t });
                            setIsEditing(true);
                          }}
                          title="Sửa"
                          className="TeacherProfile-style-45"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(t.id)}
                          title="Xóa"
                          className="TeacherProfile-style-46"
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

      {/* MODAL XEM CHI TIẾT & CHỈNH SỬA */}
      {selectedTeacher && (
        <div className="TeacherProfile-style-47" onClick={() => setSelectedTeacher(null)}>
          <div className="TeacherProfile-style-48" onClick={(e) => e.stopPropagation()}>
            <div className="TeacherProfile-style-49">
              <h3 className="TeacherProfile-style-50">
                <i className="fa-solid fa-user-pen"></i> {isEditing ? "Chỉnh sửa hồ sơ" : "Hồ sơ giáo viên"}
              </h3>
              <button onClick={() => setSelectedTeacher(null)} className="TeacherProfile-style-51">✖</button>
            </div>

            <div className="TeacherProfile-style-52">
              <div>
                <label>Họ và tên</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedTeacher.name || ""}
                    onChange={(e) => setSelectedTeacher({ ...selectedTeacher, name: e.target.value })}
                  />
                ) : (
                  <div className="TeacherProfile-style-54">{selectedTeacher.name || "---"}</div>
                )}
              </div>
              <div>
                <label>Số điện thoại</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedTeacher.phone || ""}
                    onChange={(e) => setSelectedTeacher({ ...selectedTeacher, phone: e.target.value })}
                  />
                ) : (
                  <div className="TeacherProfile-style-56">{selectedTeacher.phone || "---"}</div>
                )}
              </div>
              <div className="TeacherProfile-style-57">
                <label>Email</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedTeacher.email || ""}
                    onChange={(e) => setSelectedTeacher({ ...selectedTeacher, email: e.target.value })}
                  />
                ) : (
                  <div className="TeacherProfile-style-59">{selectedTeacher.email || "---"}</div>
                )}
              </div>
              <div className="TeacherProfile-style-60">
                <label>Kinh nghiệm / Học vấn</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedTeacher.experience || ""}
                    onChange={(e) => setSelectedTeacher({ ...selectedTeacher, experience: e.target.value })}
                  />
                ) : (
                  <div className="TeacherProfile-style-62">{selectedTeacher.experience || "---"}</div>
                )}
              </div>
              <div>
                <label>Mức lương / Buổi</label>
                {isEditing ? (
                  <input
                    type="number"
                    className="form-control"
                    value={selectedTeacher.fee || selectedTeacher.salary || ""}
                    onChange={(e) => setSelectedTeacher({ ...selectedTeacher, fee: e.target.value, salary: e.target.value })}
                  />
                ) : (
                  <div className="TeacherProfile-style-64">
                    {selectedTeacher.salary || selectedTeacher.fee
                      ? `${parseInt(selectedTeacher.salary || selectedTeacher.fee).toLocaleString("vi-VN")} đ`
                      : "---"}
                  </div>
                )}
              </div>
              <div>
                <label>Trạng thái</label>
                {isEditing ? (
                  <select
                    className="form-control"
                    value={selectedTeacher.status || "Đang dạy"}
                    onChange={(e) => setSelectedTeacher({ ...selectedTeacher, status: e.target.value })}
                  >
                    <option value="Đang dạy">Đang dạy</option>
                    <option value="Tạm nghỉ">Tạm nghỉ</option>
                    <option value="Đã nghỉ">Đã nghỉ</option>
                  </select>
                ) : (
                  <div className="TeacherProfile-style-66">{selectedTeacher.status || "---"}</div>
                )}
              </div>
              <div className="TeacherProfile-style-67">
                <label>Địa chỉ thường trú</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedTeacher.address || ""}
                    onChange={(e) => setSelectedTeacher({ ...selectedTeacher, address: e.target.value })}
                  />
                ) : (
                  <div className="TeacherProfile-style-69">{selectedTeacher.address || "---"}</div>
                )}
              </div>
              <div className="TeacherProfile-style-70">
                <label>Ghi chú thêm về nhân sự</label>
                {isEditing ? (
                  <textarea
                    className="form-control TeacherProfile-style-72"
                    rows="2"
                    value={selectedTeacher.notes || ""}
                    onChange={(e) => setSelectedTeacher({ ...selectedTeacher, notes: e.target.value })}
                  />
                ) : (
                  <div className="TeacherProfile-style-73">{selectedTeacher.notes || "---"}</div>
                )}
              </div>
            </div>

            <div className="TeacherProfile-style-74">
              <button className="TeacherProfile-style-75" onClick={() => handleDeleteTeacher(selectedTeacher.id)}>
                <i className="fa-solid fa-trash"></i> Xóa hồ sơ
              </button>
              {!isEditing ? (
                <button className="TeacherProfile-style-76" onClick={() => setIsEditing(true)}>
                  <i className="fa-solid fa-pen"></i> Sửa thông tin
                </button>
              ) : (
                <button className="TeacherProfile-style-77" onClick={handleSaveEdit}>
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

export default TeacherProfile;