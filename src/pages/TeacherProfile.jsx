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

  // ĐÃ BỔ SUNG TRƯỜNG "notes"
  const [formInput, setFormInput] = useState({
    name: "",
    email: "",
    phone: "",
    education: "",
    level: "",
    notes: "",
  });
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  // Đã thêm notes vào cấu hình cột
  const [visibleColumns, setVisibleColumns] = useState({
    email: true,
    education: true,
    level: true,
    notes: false,
  });
  const optionalColumnsConfig = [
    {
      key: "email",
      label: "Email",
      icon: "fa-envelope",
    },
    {
      key: "education",
      label: "Học vấn",
      icon: "fa-graduation-cap",
    },
    {
      key: "level",
      label: "Trình độ",
      icon: "fa-award",
    },
    {
      key: "notes",
      label: "Ghi chú",
      icon: "fa-note-sticky",
    },
  ];
  const toggleColumn = (key) =>
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    if (!formInput.name || !formInput.phone)
      return addNotification(
        "Vui lòng nhập Họ tên và Số điện thoại!",
        "error",
        "teachers",
      );
    try {
      const res = await api.post("/auth/register", {
        ...formInput,
        username: formInput.phone + "_teacher",
        password: "123",
        role: "teacher",
      });
      // SỬ DỤNG DỮ LIỆU CHUẨN TỪ BACKEND TRẢ VỀ (res.data) THAY VÌ HIỂN THỊ ẢO
      setTeachers((prev) => [res.data, ...prev]);
      setFormInput({
        name: "",
        email: "",
        phone: "",
        education: "",
        level: "",
        notes: "",
      });
      addNotification(
        "Hệ thống: Lưu thông tin hồ sơ Giáo viên thành công!",
        "success",
        "teachers",
      );
    } catch (error) {
      addNotification(
        `Lỗi: Không thể tạo Giáo viên. ${error.response?.data?.message || error.message}`,
        "error",
        "teachers",
      );
    }
  };
  const handleSaveEdit = async () => {
    if (!selectedTeacher || !selectedTeacher.id)
      return addNotification(
        "Lỗi: Không xác định được ID giáo viên!",
        "error",
        "teachers",
      );
    try {
      const res = await api.put(`/users/${selectedTeacher.id}`, selectedTeacher);
      // SỬ DỤNG DỮ LIỆU CHUẨN TỪ BACKEND TRẢ VỀ ĐỂ XÓA BỎ HIỆN TƯỢNG BÓNG MA
      setTeachers((prev) =>
        prev.map((t) => (t.id === selectedTeacher.id ? res.data : t)),
      );
      setSelectedTeacher(null);
      setIsEditing(false);
      addNotification(
        "Cập nhật thông tin giáo viên thành công!",
        "success",
        "teachers",
      );
    } catch (err) {
      addNotification(
        `Lỗi cập nhật: ${err.response?.data?.message || err.message}`,
        "error",
        "teachers",
      );
    }
  };
  const handleDeleteTeacher = async (id) => {
    if (!id) return;
    if (
      window.confirm(
        "Cảnh báo: Bạn có chắc chắn muốn xóa giáo viên này khỏi hệ thống?",
      )
    ) {
      try {
        await api.delete(`/users/${id}`);
        setTeachers((prev) => prev.filter((t) => t.id !== id));
        if (selectedTeacher && selectedTeacher.id === id) setSelectedTeacher(null);
        addNotification("Đã xóa giáo viên thành công!", "success", "teachers");
      } catch (err) {
        addNotification(
          `Lỗi xóa dữ liệu: ${err.response?.data?.message || err.message}`,
          "error",
          "teachers",
        );
      }
    }
  };
  return (
    <div className="TeacherProfile-style-1">
      <div className="card TeacherProfile-style-2">
        <h3 className="TeacherProfile-style-3">
          <i className="fa-solid fa-user-graduate TeacherProfile-style-4"></i>{" "}
          Thông tin Giáo viên
        </h3>
        <form
          onSubmit={handleSaveTeacher}
          className="TeacherProfile-style-5"
        >
          <div>
            <label className="TeacherProfile-style-6">
              Họ & Tên (*)
            </label>
            <input
              type="text"
              className="form-control"
              value={formInput.name}
              onChange={(e) =>
                setFormInput({
                  ...formInput,
                  name: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <label className="TeacherProfile-style-7">
              Email cá nhân
            </label>
            <input
              type="email"
              className="form-control"
              value={formInput.email}
              onChange={(e) =>
                setFormInput({
                  ...formInput,
                  email: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="TeacherProfile-style-8">
              Số điện thoại (*)
            </label>
            <input
              type="text"
              className="form-control"
              value={formInput.phone}
              onChange={(e) =>
                setFormInput({
                  ...formInput,
                  phone: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="TeacherProfile-style-9">
            <label className="TeacherProfile-style-10">Học vấn</label>
            <input
              type="text"
              className="form-control"
              value={formInput.education}
              onChange={(e) =>
                setFormInput({
                  ...formInput,
                  education: e.target.value,
                })
              }
              placeholder="VD: Sinh viên ĐH Ngoại ngữ..."
            />
          </div>
          <div>
            <label className="TeacherProfile-style-11">
              Trình độ
            </label>
            <input
              type="text"
              className="form-control"
              value={formInput.level}
              onChange={(e) =>
                setFormInput({
                  ...formInput,
                  level: e.target.value,
                })
              }
              placeholder="VD: HSK 5, IELTS 7.0..."
            />
          </div>

          {/* BỔ SUNG GHI CHÚ */}
          <div className="TeacherProfile-style-12">
            <label className="TeacherProfile-style-13">
              Ghi chú thêm về nhân sự
            </label>
            <textarea
              className="form-control TeacherProfile-style-14"
              rows="2"
              value={formInput.notes}
              onChange={(e) =>
                setFormInput({
                  ...formInput,
                  notes: e.target.value,
                })
              }
              placeholder="Thông tin cần lưu ý..."
            ></textarea>
          </div>

          <div className="TeacherProfile-style-15">
            <button
              type="submit"
              className="btn btn-primary TeacherProfile-style-16"
            >
              LƯU THÔNG TIN TRỢ GIẢNG
            </button>
          </div>
        </form>
      </div>

      <div className="card TeacherProfile-style-17">
        <div className="TeacherProfile-style-18">
          <div className="TeacherProfile-style-19">
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
              <i
                className={`fa-solid ${isPanelExpanded ? "fa-cog" : "fa-list-ul"}`}
              ></i>
              <span>
                {isPanelExpanded ? "Đóng bảng chọn" : "Tùy chỉnh cột"}
              </span>
            </button>
            {isPanelExpanded && (
              <div className="TeacherProfile-style-20">
                <button
                  onClick={() =>
                    setVisibleColumns(
                      Object.keys(visibleColumns).reduce(
                        (acc, key) => ({
                          ...acc,
                          [key]: true,
                        }),
                        {},
                      ),
                    )
                  }
                  className="TeacherProfile-style-21"
                >
                  Chọn tất cả
                </button>
                <button
                  onClick={() =>
                    setVisibleColumns(
                      Object.keys(visibleColumns).reduce(
                        (acc, key) => ({
                          ...acc,
                          [key]: false,
                        }),
                        {},
                      ),
                    )
                  }
                  className="TeacherProfile-style-22"
                >
                  Bỏ chọn
                </button>
              </div>
            )}
          </div>
          {isPanelExpanded && (
            <div className="TeacherProfile-style-23">
              {optionalColumnsConfig.map((col) => (
                <label
                  key={col.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 10px",
                    backgroundColor: visibleColumns[col.key]
                      ? "#ecfdf5"
                      : "#f8fafc",
                    border: visibleColumns[col.key]
                      ? "1px solid #10b981"
                      : "1px solid #e2e8f0",
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

        <div className="modal-table-container TeacherProfile-style-24">
          <table className="modal-table TeacherProfile-style-25">
            <thead className="TeacherProfile-style-26">
              <tr>
                <th className="TeacherProfile-style-27">STT</th>
                <th className="TeacherProfile-style-28">HỌ & TÊN</th>
                <th className="TeacherProfile-style-29">SĐT</th>
                {visibleColumns.email && (
                  <th className="TeacherProfile-style-30">EMAIL</th>
                )}
                {visibleColumns.education && (
                  <th className="TeacherProfile-style-31">HỌC VẤN</th>
                )}
                {visibleColumns.level && (
                  <th className="TeacherProfile-style-32">
                    TRÌNH ĐỘ
                  </th>
                )}
                {visibleColumns.notes && (
                  <th className="TeacherProfile-style-33">GHI CHÚ</th>
                )}
                <th className="TeacherProfile-style-34">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {teachers && teachers.length === 0 && (
                <tr>
                  <td colSpan="8" className="TeacherProfile-style-35">
                    Chưa có giáo viên trong hệ thống.
                  </td>
                </tr>
              )}
              {teachers &&
                teachers.map((t, idx) => (
                  <tr
                    key={t.id || idx}
                    className="TeacherProfile-style-36"
                  >
                    <td className="TeacherProfile-style-37">
                      {idx + 1}
                    </td>
                    <td className="TeacherProfile-style-38">
                      <span
                        className="TeacherProfile-style-39"
                        onClick={() => {
                          setSelectedTeacher({
                            ...t,
                          });
                          setIsEditing(false);
                        }}
                      >
                        {t.name || "---"}
                      </span>
                    </td>
                    <td className="TeacherProfile-style-40">
                      {t.phone || "---"}
                    </td>
                    {visibleColumns.email && (
                      <td className="TeacherProfile-style-41">
                        {t.email || "---"}
                      </td>
                    )}
                    {visibleColumns.education && (
                      <td className="TeacherProfile-style-42">
                        {t.education || "---"}
                      </td>
                    )}
                    {visibleColumns.level && (
                      <td className="TeacherProfile-style-43">
                        <span className="TeacherProfile-style-44">
                          {t.level || "---"}
                        </span>
                      </td>
                    )}
                    {visibleColumns.notes && (
                      <td
                        className="TeacherProfile-style-45"
                        title={t.notes}
                      >
                        {t.notes || "---"}
                      </td>
                    )}
                    <td className="TeacherProfile-style-46">
                      <div className="TeacherProfile-style-47">
                        <button
                          onClick={() => {
                            setSelectedTeacher({
                              ...t,
                            });
                            setIsEditing(true);
                          }}
                          title="Sửa"
                          className="TeacherProfile-style-48"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(t.id)}
                          title="Xóa"
                          className="TeacherProfile-style-49"
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

      {selectedTeacher && (
        <div className="TeacherProfile-style-50">
          <div className="card TeacherProfile-style-51">
            <div className="TeacherProfile-style-52">
              <h3 className="TeacherProfile-style-53">
                <i className="fa-solid fa-user-pen"></i>{" "}
                {isEditing ? "Chỉnh sửa hồ sơ" : "Hồ sơ giáo viên"}
              </h3>
              <button
                onClick={() => setSelectedTeacher(null)}
                className="TeacherProfile-style-54"
              >
                ✖
              </button>
            </div>

            <div className="TeacherProfile-style-55">
              <div>
                <label className="TeacherProfile-style-56">
                  Họ và tên
                </label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedTeacher.name || ""}
                    onChange={(e) =>
                      setSelectedTeacher({
                        ...selectedTeacher,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="TeacherProfile-style-57">
                    {selectedTeacher.name || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="TeacherProfile-style-58">
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedTeacher.phone || ""}
                    onChange={(e) =>
                      setSelectedTeacher({
                        ...selectedTeacher,
                        phone: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="TeacherProfile-style-59">
                    {selectedTeacher.phone || "---"}
                  </div>
                )}
              </div>
              <div className="TeacherProfile-style-60">
                <label className="TeacherProfile-style-61">
                  Email
                </label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedTeacher.email || ""}
                    onChange={(e) =>
                      setSelectedTeacher({
                        ...selectedTeacher,
                        email: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="TeacherProfile-style-62">
                    {selectedTeacher.email || "---"}
                  </div>
                )}
              </div>
              <div className="TeacherProfile-style-63">
                <label className="TeacherProfile-style-64">
                  Học vấn
                </label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedTeacher.education || ""}
                    onChange={(e) =>
                      setSelectedTeacher({
                        ...selectedTeacher,
                        education: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="TeacherProfile-style-65">
                    {selectedTeacher.education || "---"}
                  </div>
                )}
              </div>
              <div className="TeacherProfile-style-66">
                <label className="TeacherProfile-style-67">
                  Trình độ
                </label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedTeacher.level || ""}
                    onChange={(e) =>
                      setSelectedTeacher({
                        ...selectedTeacher,
                        level: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="TeacherProfile-style-68">
                    {selectedTeacher.level || "---"}
                  </div>
                )}
              </div>
              {/* BỔ SUNG TRƯỜNG GHI CHÚ TRONG CHI TIẾT */}
              <div className="TeacherProfile-style-69">
                <label className="TeacherProfile-style-70">
                  Ghi chú thêm về nhân sự
                </label>
                {isEditing ? (
                  <textarea
                    className="form-control TeacherProfile-style-71"
                    rows="2"
                    value={selectedTeacher.notes || ""}
                    onChange={(e) =>
                      setSelectedTeacher({
                        ...selectedTeacher,
                        notes: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="TeacherProfile-style-72">
                    {selectedTeacher.notes || "---"}
                  </div>
                )}
              </div>
            </div>

            <div className="TeacherProfile-style-73">
              <button
                className="btn TeacherProfile-style-74"
                onClick={() => handleDeleteTeacher(selectedTeacher.id)}
              >
                <i className="fa-solid fa-trash"></i> Xóa hồ sơ
              </button>
              {!isEditing ? (
                <button
                  className="btn TeacherProfile-style-75"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fa-solid fa-pen"></i> Sửa thông tin
                </button>
              ) : (
                <button
                  className="btn TeacherProfile-style-76"
                  onClick={handleSaveEdit}
                >
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
