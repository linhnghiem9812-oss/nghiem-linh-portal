import "../styles/pages/CRM.css";
import React, { useState, useEffect, useMemo } from "react";
import { useData } from "../context/DataContext";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
});
function CRM() {
  const { addNotification } = useNotification();
  const { customers, setCustomers } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [uniqueSalesOptions, setUniqueSalesOptions] = useState([]);
  const [isLoadingSales, setIsLoadingSales] = useState(false);

  useEffect(() => {
    const fetchSales = async () => {
      setIsLoadingSales(true);
      try {
        const res = await api.get('/users/suggestions?role=sales');
        setUniqueSalesOptions(res.data || []);
      } catch (err) {
        console.error("Lỗi lấy danh sách Sale", err);
      } finally {
        setIsLoadingSales(false);
      }
    };
    fetchSales();
  }, []);
  const [visibleColumns, setVisibleColumns] = useState({
    receiveDate: false,
    saleInCharge: false,
    dob: false,
    name: false,
    customerType: false,
    source: false,
    fee: false,
    totalSessions: false,
    lastContact: false,
    notes: false,
    nextAction: false,
    assignClass: true,
  });
  const optionalColumnsConfig = [
    {
      key: "receiveDate",
      label: "Ngày nhận",
      icon: "fa-regular fa-calendar-plus",
    },
    {
      key: "saleInCharge",
      label: "Sale nhận",
      icon: "fa-solid fa-user-tie",
    },
    {
      key: "dob",
      label: "Ngày sinh",
      icon: "fa-cake-candles",
    },
    {
      key: "name",
      label: "Họ tên",
      icon: "fa-id-card",
    },
    {
      key: "customerType",
      label: "Loại khách",
      icon: "fa-user-tag",
    },
    {
      key: "source",
      label: "Nguồn",
      icon: "fa-share-nodes",
    },
    {
      key: "fee",
      label: "Học phí",
      icon: "fa-wallet",
    },
    {
      key: "totalSessions",
      label: "Số buổi",
      icon: "fa-clock",
    },
    {
      key: "lastContact",
      label: "Liên hệ cuối",
      icon: "fa-business-time",
    },
    {
      key: "notes",
      label: "Ghi chú",
      icon: "fa-note-sticky",
    },
    {
      key: "nextAction",
      label: "Việc tiếp theo",
      icon: "fa-circle-exclamation",
    },
  ];
  const toggleColumn = (columnKey) =>
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  const today = new Date();
  const defaultDate = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getFullYear()}`;
  const [formData, setFormData] = useState({
    fbName: "",
    name: "",
    phone: "",
    dob: "",
    language: "Tiếng Trung",
    customerType: "Mới",
    source: "Facebook",
    level: "",
    country: "Việt Nam",
    potential: "Trung bình",
    status: "Mới",
    fee: "",
    totalSessions: "",
    lastContact: "",
    notes: "",
    nextAction: "",
    assignClass: "",
    classType: "Lớp Nhóm",
    receiveDate: defaultDate,
    saleInCharge: "",
  });
  const handleInputChange = (e) =>
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone) {
      addNotification("Vui lòng nhập Số điện thoại liên hệ!", "error", "crm");
      return;
    }
    const newRecord = {
      fbName: formData.fbName,
      name: formData.name,
      phone: formData.phone,
      dob: formData.dob,
      language: formData.language,
      customerType: formData.customerType,
      source: formData.source,
      level: formData.level,
      classType: formData.classType,
      status: formData.status,
      fee: formData.fee ? formData.fee.toString() : "0",
      totalSessions: formData.totalSessions
        ? formData.totalSessions.toString()
        : "0",
      lastContact: formData.lastContact,
      notes: formData.notes,
      nextAction: formData.nextAction,
      assignClass: formData.assignClass,
      country: formData.country,
      receiveDate: formData.receiveDate,
      saleInCharge: formData.saleInCharge,
    };
    try {
      const res = await api.post("/customers", newRecord);
      setCustomers((prev) => [res.data, ...prev]);
      addNotification("Thêm khách hàng thành công!", "success", "crm");
      setFormData({
        fbName: "",
        name: "",
        phone: "",
        dob: "",
        language: "Tiếng Trung",
        customerType: "Mới",
        source: "Facebook",
        level: "",
        potential: "Trung bình",
        status: "Mới",
        fee: "",
        totalSessions: "",
        lastContact: "",
        notes: "",
        nextAction: "",
        assignClass: "",
        classType: "Lớp Nhóm",
        country: "Việt Nam",
        receiveDate: defaultDate,
        saleInCharge: "",
      });
    } catch (err) {
      addNotification(
        "Lỗi khi đẩy khách hàng lên database. Vui lòng kiểm tra lại!",
        "error",
        "crm",
      );
    }
  };
  const handleSaveEdit = async () => {
    try {
      const res = await api.put(
        `/customers/${selectedCustomer.id}`,
        selectedCustomer,
      );
      setCustomers((prev) =>
        prev.map((c) => (c.id === res.data.id ? res.data : c)),
      );
      addNotification(
        "Lưu thay đổi hồ sơ khách hàng thành công!",
        "success",
        "crm",
      );
      setIsEditing(false);
      setSelectedCustomer(null);
    } catch (error) {
      addNotification("Lỗi cập nhật CSDL.", "error", "crm");
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      try {
        await api.delete(`/customers/${id}`);
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        setSelectedCustomer(null);
        addNotification(
          "Đã xóa hồ sơ khách hàng thành công!",
          "success",
          "crm",
        );
      } catch (e) {
        addNotification("Lỗi xóa khách hàng.", "error", "crm");
      }
    }
  };
  const filteredCustomers = customers
    ? customers.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (c.phone && c.phone.includes(searchTerm)) ||
          (c.fbName &&
            c.fbName.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    : [];
  return (
    <div className="CRM-style-1">
      <div className="card CRM-style-2">
        <h3 className="CRM-style-3">
          <i className="fa-solid fa-user-plus CRM-style-4"></i> Tiếp nhận Khách
          hàng
        </h3>
        <form onSubmit={handleFormSubmit} className="CRM-style-5">
          <div>
            <label className="CRM-style-6">TÊN FB</label>
            <input
              type="text"
              name="fbName"
              className="form-control"
              value={formData.fbName}
              onChange={handleInputChange}
              placeholder="Nhập tên FB..."
            />
          </div>
          <div>
            <label className="CRM-style-7">NGÀY NHẬN</label>
            <input
              type="text"
              name="receiveDate"
              className="form-control"
              value={formData.receiveDate}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="CRM-style-8">NGƯỜI SALE TIẾP NHẬN {isLoadingSales && <i className="fa-solid fa-spinner fa-spin"></i>}</label>
            <select
              name="saleInCharge"
              className="form-control"
              value={formData.saleInCharge}
              onChange={handleInputChange}
            >
              <option value="">-- Chọn Sale --</option>
              {/* SỬ DỤNG DANH SÁCH ĐÃ ĐƯỢC CHUẨN HÓA VÀ LỌC TRÙNG */}
              {uniqueSalesOptions.map((name, idx) => (
                <option key={idx} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="CRM-style-9">SĐT (Zalo) (*)</label>
            <input
              type="text"
              name="phone"
              className="form-control CRM-style-10"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className="CRM-style-11">NGÀY SINH</label>
            <input
              type="text"
              name="dob"
              className="form-control"
              value={formData.dob}
              onChange={handleInputChange}
              placeholder="VD: 15/08/1998"
            />
          </div>
          <div>
            <label className="CRM-style-12">HỌ TÊN</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Tên học viên..."
            />
          </div>
          <div>
            <label className="CRM-style-13">QUỐC GIA</label>
            <input
              type="text"
              name="country"
              className="form-control"
              value={formData.country}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="CRM-style-14">LOẠI NGÔN NGỮ</label>
            <select
              name="language"
              className="form-control"
              value={formData.language}
              onChange={handleInputChange}
            >
              <option value="Tiếng Trung">Tiếng Trung</option>
              <option value="Tiếng Nhật">Tiếng Nhật</option>
              <option value="Tiếng Anh">Tiếng Anh</option>
            </select>
          </div>

          <div>
            <label className="CRM-style-15">KHÓA HỌC / TRÌNH ĐỘ</label>
            <input
              type="text"
              name="level"
              className="form-control"
              value={formData.level}
              onChange={handleInputChange}
              placeholder="Nhập tên khóa học..."
            />
          </div>
          <div>
            <label className="CRM-style-16">LOẠI KHÁCH</label>
            <select
              name="customerType"
              className="form-control"
              value={formData.customerType}
              onChange={handleInputChange}
            >
              <option value="Mới">Mới</option>
              <option value="Quay lại">Quay lại</option>
            </select>
          </div>
          <div>
            <label className="CRM-style-17">NGUỒN</label>
            <select
              name="source"
              className="form-control"
              value={formData.source}
              onChange={handleInputChange}
            >
              <option value="Facebook">Facebook</option>
              <option value="TikTok">TikTok</option>
              <option value="Google">Google</option>
            </select>
          </div>
          <div>
            <label className="CRM-style-18">TRẠNG THÁI (*)</label>
            <select
              name="status"
              className="form-control"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="Mới">🆕 Mới</option>
              <option value="Đang tư vấn">Đang tư vấn</option>
              <option value="Đã ĐK">Đã ĐK</option>
            </select>
          </div>

          <div className="CRM-style-19">
            <div className="CRM-style-20">
              <label className="CRM-style-21">HỌC PHÍ</label>
              <input
                type="number"
                name="fee"
                className="form-control"
                value={formData.fee}
                onChange={handleInputChange}
              />
            </div>
            <div className="CRM-style-22">
              <label className="CRM-style-23">SỐ BUỔI</label>
              <input
                type="number"
                name="totalSessions"
                className="form-control"
                value={formData.totalSessions}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div>
            <label className="CRM-style-24">LIÊN HỆ CUỐI</label>
            <input
              type="date"
              name="lastContact"
              className="form-control"
              value={formData.lastContact}
              onChange={handleInputChange}
            />
          </div>
          <div className="CRM-style-25">
            <label className="CRM-style-26">XẾP VÀO LỚP</label>
            <input
              type="text"
              name="assignClass"
              className="form-control"
              value={formData.assignClass}
              onChange={handleInputChange}
              placeholder="Tên lớp xếp..."
            />
          </div>

          <div className="CRM-style-27">
            <label className="CRM-style-28">LOẠI LỚP</label>
            <input
              list="classTypeList"
              name="classType"
              className="form-control"
              value={formData.classType}
              onChange={handleInputChange}
            />
            <datalist id="classTypeList">
              <option value="Lớp Nhóm" />
              <option value="Lớp VIP 1-1" />
            </datalist>
          </div>
          <div className="CRM-style-29">
            <label className="CRM-style-30">GHI CHÚ / NHU CẦU</label>
            <input
              type="text"
              name="notes"
              className="form-control"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <div className="CRM-style-31">
            <label className="CRM-style-32">VIỆC TIẾP THEO</label>
            <input
              type="text"
              name="nextAction"
              className="form-control"
              value={formData.nextAction}
              onChange={handleInputChange}
            />
          </div>
          <div className="CRM-style-33">
            <button type="submit" className="btn btn-primary CRM-style-34">
              LƯU THÔNG TIN KHÁCH HÀNG
            </button>
          </div>
        </form>
      </div>

      <div className="card CRM-style-35">
        <div className="CRM-style-36">
          <div className="CRM-style-37">
            <button
              type="button"
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              style={{
                background: isPanelExpanded ? "#4f46e5" : "#ffffff",
                color: isPanelExpanded ? "white" : "#4f46e5",
                border: "1px solid #4f46e5",
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
          </div>
          {isPanelExpanded && (
            <div className="CRM-style-38">
              {optionalColumnsConfig.map((col) => (
                <label
                  key={col.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 10px",
                    backgroundColor: visibleColumns[col.key]
                      ? "#eef2ff"
                      : "#f8fafc",
                    border: visibleColumns[col.key]
                      ? "1px solid #4f46e5"
                      : "1px solid #e2e8f0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: visibleColumns[col.key] ? "#4f46e5" : "#475569",
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

        <div className="CRM-style-39">
          <h3 className="CRM-style-40">
            <i className="fa-solid fa-list CRM-style-41"></i> Danh sách Khách
            hàng
          </h3>
          <input
            type="text"
            className="form-control CRM-style-42"
            placeholder="🔍 Lọc theo tên FB, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="modal-table-container CRM-style-43">
          <table className="modal-table CRM-style-44">
            <thead>
              <tr className="CRM-style-45">
                <th className="CRM-style-46">STT</th>
                <th className="CRM-style-47">TÊN FB</th>
                {visibleColumns.receiveDate && (
                  <th className="CRM-style-48">NGÀY NHẬN</th>
                )}
                {visibleColumns.saleInCharge && (
                  <th className="CRM-style-49">SALE NHẬN</th>
                )}
                <th className="CRM-style-50">SĐT (ZALO)</th>
                {visibleColumns.dob && (
                  <th className="CRM-style-51">NGÀY SINH</th>
                )}
                {visibleColumns.name && (
                  <th className="CRM-style-52">HỌ TÊN</th>
                )}
                <th className="CRM-style-53">QUỐC GIA</th>
                <th className="CRM-style-54">NGÔN NGỮ</th>
                <th className="CRM-style-55">KHÓA HỌC</th>
                <th className="CRM-style-56">LOẠI LỚP</th>
                {visibleColumns.customerType && (
                  <th className="CRM-style-57">LOẠI KHÁCH</th>
                )}
                {visibleColumns.source && (
                  <th className="CRM-style-58">NGUỒN</th>
                )}
                <th className="CRM-style-59">TRẠNG THÁI</th>
                {visibleColumns.fee && (
                  <th className="CRM-style-60">HỌC PHÍ</th>
                )}
                {visibleColumns.totalSessions && (
                  <th className="CRM-style-61">SỐ BUỔI</th>
                )}
                {visibleColumns.lastContact && (
                  <th className="CRM-style-62">LIÊN HỆ CUỐI</th>
                )}
                {visibleColumns.notes && (
                  <th className="CRM-style-63">GHI CHÚ</th>
                )}
                {visibleColumns.nextAction && (
                  <th className="CRM-style-64">VIỆC TIẾP THEO</th>
                )}
                {visibleColumns.assignClass && (
                  <th className="CRM-style-65">XẾP LỚP</th>
                )}
              </tr>
            </thead>
            <tbody className="CRM-style-66">
              {filteredCustomers.map((c, index) => (
                <tr key={c.id || index} className="CRM-style-67">
                  <td className="CRM-style-68">{index + 1}</td>
                  <td className="CRM-style-69">
                    <span
                      className="CRM-style-70"
                      onClick={() => {
                        setSelectedCustomer({
                          ...c,
                        });
                        setIsEditing(false);
                      }}
                    >
                      {c.fbName || "---"}
                    </span>
                  </td>
                  {visibleColumns.receiveDate && (
                    <td className="CRM-style-71">{c.receiveDate || "---"}</td>
                  )}
                  {visibleColumns.saleInCharge && (
                    <td className="CRM-style-72">{c.saleInCharge || "---"}</td>
                  )}
                  <td className="CRM-style-73">{c.phone || "---"}</td>
                  {visibleColumns.dob && (
                    <td className="CRM-style-74">{c.dob || "---"}</td>
                  )}
                  {visibleColumns.name && (
                    <td className="CRM-style-75">{c.name || "---"}</td>
                  )}
                  <td className="CRM-style-76">{c.country || "---"}</td>
                  <td className="CRM-style-77">{c.language || "---"}</td>
                  <td className="CRM-style-78">{c.level || "---"}</td>
                  <td className="CRM-style-79">{c.classType || "---"}</td>

                  {visibleColumns.customerType && (
                    <td className="CRM-style-80">{c.customerType || "---"}</td>
                  )}
                  {visibleColumns.source && (
                    <td className="CRM-style-81">{c.source || "---"}</td>
                  )}
                  <td className="CRM-style-82">
                    <span
                      className="badge-studying"
                      style={{
                        backgroundColor:
                          c.status === "Đã ĐK"
                            ? "#dcfce7"
                            : c.status === "Đang tư vấn"
                              ? "#e0e7ff"
                              : "#f1f5f9",
                        color:
                          c.status === "Đã ĐK"
                            ? "#166534"
                            : c.status === "Đang tư vấn"
                              ? "#3730a3"
                              : "#475569",
                        fontWeight: "800",
                        padding: "4px 10px",
                        borderRadius: "50px",
                        fontSize: "0.75rem",
                      }}
                    >
                      {c.status || "Mới"}
                    </span>
                  </td>
                  {visibleColumns.fee && (
                    <td className="CRM-style-83">
                      {c.fee
                        ? `${Number(c.fee).toLocaleString("vi-VN")} đ`
                        : "0 đ"}
                    </td>
                  )}
                  {visibleColumns.totalSessions && (
                    <td className="CRM-style-84">{c.totalSessions || "---"}</td>
                  )}
                  {visibleColumns.lastContact && (
                    <td className="CRM-style-85">{c.lastContact || "---"}</td>
                  )}
                  {visibleColumns.notes && (
                    <td className="CRM-style-86" title={c.notes}>
                      {c.notes || "---"}
                    </td>
                  )}
                  {visibleColumns.nextAction && (
                    <td className="CRM-style-87" title={c.nextAction}>
                      {c.nextAction || "---"}
                    </td>
                  )}
                  {visibleColumns.assignClass && (
                    <td className="CRM-style-88">{c.assignClass || "---"}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer && (
        <div className="CRM-style-89">
          <div className="card CRM-style-90">
            <div className="CRM-style-91">
              <h3 className="CRM-style-92">
                <i className="fa-solid fa-user-pen"></i>{" "}
                {isEditing ? "Chỉnh sửa hồ sơ" : "Hồ sơ khách hàng chi tiết"}
              </h3>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setIsEditing(false);
                }}
                className="CRM-style-93"
              >
                ✖
              </button>
            </div>

            <div className="CRM-style-94">
              <div>
                <label className="CRM-style-95">Tên Facebook</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedCustomer.fbName || ""}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        fbName: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="CRM-style-96">
                    {selectedCustomer.fbName || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="CRM-style-97">Số điện thoại (*)</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedCustomer.phone || ""}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        phone: e.target.value,
                      })
                    }
                    required
                  />
                ) : (
                  <div className="CRM-style-98">
                    {selectedCustomer.phone || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="CRM-style-99">Ngày nhận hồ sơ</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedCustomer.receiveDate || ""}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        receiveDate: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="CRM-style-100">
                    {selectedCustomer.receiveDate || "---"}
                  </div>
                )}
              </div>

              <div>
                <label className="CRM-style-101">Người Sale phụ trách</label>
                {isEditing ? (
                  <select
                    className="form-control"
                    value={selectedCustomer.saleInCharge || ""}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        saleInCharge: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Chọn Sale --</option>
                    {uniqueSalesOptions.map((name, idx) => (
                      <option key={idx} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="CRM-style-102">
                    {selectedCustomer.saleInCharge || "---"}
                  </div>
                )}
              </div>

              <div>
                <label className="CRM-style-103">Họ và tên học viên</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedCustomer.name || ""}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="CRM-style-104">
                    {selectedCustomer.name || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="CRM-style-105">Ngày sinh</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedCustomer.dob || ""}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        dob: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="CRM-style-106">
                    {selectedCustomer.dob || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="CRM-style-107">Quốc gia</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedCustomer.country || ""}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        country: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="CRM-style-108">
                    {selectedCustomer.country || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="CRM-style-109">Ngôn ngữ học</label>
                {isEditing ? (
                  <select
                    className="form-control"
                    value={selectedCustomer.language || "Tiếng Trung"}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        language: e.target.value,
                      })
                    }
                  >
                    <option value="Tiếng Trung">Tiếng Trung</option>
                    <option value="Tiếng Nhật">Tiếng Nhật</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                  </select>
                ) : (
                  <div className="CRM-style-110">
                    {selectedCustomer.language || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="CRM-style-111">Khóa học / Trình độ</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedCustomer.level || ""}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        level: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="CRM-style-112">
                    {selectedCustomer.level || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="CRM-style-113">Loại lớp học</label>
                {isEditing ? (
                  <select
                    className="form-control"
                    value={selectedCustomer.classType || "Lớp Nhóm"}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        classType: e.target.value,
                      })
                    }
                  >
                    <option value="Lớp Nhóm">Lớp Nhóm</option>
                    <option value="Lớp VIP 1-1">Lớp VIP 1-1</option>
                  </select>
                ) : (
                  <div className="CRM-style-114">
                    {selectedCustomer.classType || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="CRM-style-115">Loại khách</label>
                {isEditing ? (
                  <select
                    className="form-control"
                    value={selectedCustomer.customerType || "Mới"}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        customerType: e.target.value,
                      })
                    }
                  >
                    <option value="Mới">Mới</option>
                    <option value="Quay lại">Quay lại</option>
                  </select>
                ) : (
                  <div className="CRM-style-116">
                    {selectedCustomer.customerType || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="CRM-style-117">Nguồn đến</label>
                {isEditing ? (
                  <select
                    className="form-control"
                    value={selectedCustomer.source || "Facebook"}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        source: e.target.value,
                      })
                    }
                  >
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Google">Google</option>
                  </select>
                ) : (
                  <div className="CRM-style-118">
                    {selectedCustomer.source || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="CRM-style-119">Tổng học phí (VNĐ)</label>
                {isEditing ? (
                  <input
                    type="number"
                    className="form-control"
                    value={selectedCustomer.fee || ""}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        fee: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="CRM-style-120">
                    {selectedCustomer.fee
                      ? Number(selectedCustomer.fee).toLocaleString("vi-VN") +
                        " đ"
                      : "0 đ"}
                  </div>
                )}
              </div>
              <div>
                <label className="CRM-style-121">Tổng số buổi học</label>
                {isEditing ? (
                  <input
                    type="number"
                    className="form-control"
                    value={selectedCustomer.totalSessions || ""}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        totalSessions: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="CRM-style-122">
                    {selectedCustomer.totalSessions || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="CRM-style-123">Trạng thái tư vấn</label>
                {isEditing ? (
                  <select
                    className="form-control"
                    value={selectedCustomer.status || "Mới"}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="Mới">🆕 Mới</option>
                    <option value="Đang tư vấn">Đang tư vấn</option>
                    <option value="Đã ĐK">Đã ĐK</option>
                  </select>
                ) : (
                  <div className="CRM-style-124">
                    {selectedCustomer.status || "---"}
                  </div>
                )}
              </div>
              <div>
                <label className="CRM-style-125">Xếp vào lớp</label>
                {isEditing ? (
                  <input
                    className="form-control"
                    value={selectedCustomer.assignClass || ""}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        assignClass: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="CRM-style-126">
                    {selectedCustomer.assignClass || "---"}
                  </div>
                )}
              </div>
              <div className="CRM-style-127">
                <label className="CRM-style-128">
                  Ngày tương tác cuối cùng
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    className="form-control"
                    value={selectedCustomer.lastContact || ""}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        lastContact: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="CRM-style-129">
                    {selectedCustomer.lastContact || "---"}
                  </div>
                )}
              </div>
              <div className="CRM-style-130">
                <label className="CRM-style-131">
                  Ghi chú chi tiết / Nhu cầu học viên
                </label>
                {isEditing ? (
                  <textarea
                    className="form-control"
                    rows="2"
                    value={selectedCustomer.notes || ""}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        notes: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="CRM-style-132">
                    {selectedCustomer.notes || "Không có ghi chú"}
                  </div>
                )}
              </div>
              <div className="CRM-style-133">
                <label className="CRM-style-134">
                  Hành động tiếp theo (Next Action)
                </label>
                {isEditing ? (
                  <textarea
                    className="form-control"
                    rows="2"
                    value={selectedCustomer.nextAction || ""}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        nextAction: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="CRM-style-135">
                    {selectedCustomer.nextAction || "---"}
                  </div>
                )}
              </div>
            </div>

            <div className="CRM-style-136">
              <button
                className="btn CRM-style-137"
                onClick={() => handleDelete(selectedCustomer.id)}
              >
                <i className="fa-solid fa-trash"></i> Xóa hồ sơ
              </button>
              <div className="CRM-style-138">
                {!isEditing ? (
                  <button
                    className="btn CRM-style-139"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fa-solid fa-pen"></i> Sửa thông tin
                  </button>
                ) : (
                  <button
                    className="btn CRM-style-140"
                    onClick={handleSaveEdit}
                  >
                    <i className="fa-solid fa-floppy-disk"></i> Lưu thay đổi
                  </button>
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
