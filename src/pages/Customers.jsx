import "../styles/pages/Customers.css";
import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { useNotification } from "../context/NotificationContext";
function Customers() {
  const { addNotification } = useNotification();
  const { customers, addCustomer } = useData();

  // Khởi tạo state dựa trên các yêu cầu sửa đổi
  const [formData, setFormData] = useState({
    fbName: "",
    receiveDate: "",
    name: "",
    phone: "",
    dob: "",
    country: "Việt Nam",
    language: "Tiếng Trung",
    customerType: "Mới",
    source: "Facebook",
    level: "",
    status: "Mới",
    fee: "",
    totalSessions: "",
    lastContact: "",
    nextAction: "",
    assignClass: "",
    classType: "Lớp Nhóm",
    saleInCharge: "", // Thêm trường Người Sale
  });
  const [searchTerm, setSearchTerm] = useState("");
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!formData.phone || !formData.status) {
      addNotification(
        "Vui lòng nhập ít nhất SĐT và Trạng thái!",
        "error",
        "crm",
      );
      return;
    }
    addCustomer(formData);
    addNotification("Lưu thông tin khách hàng thành công!", "success", "crm");
    // Reset form sau khi lưu
    setFormData({
      fbName: "",
      receiveDate: "",
      name: "",
      phone: "",
      dob: "",
      country: "Việt Nam",
      language: "Tiếng Trung",
      customerType: "Mới",
      source: "Facebook",
      level: "",
      status: "Mới",
      fee: "",
      totalSessions: "",
      lastContact: "",
      nextAction: "",
      assignClass: "",
      classType: "Lớp Nhóm",
      saleInCharge: "",
    });
  };

  // Lọc khách hàng
  const displayCustomers =
    customers?.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.fbName && c.fbName.toLowerCase().includes(searchTerm.toLowerCase())),
    ) || [];
  return (
    <div className="Customers-style-1">
      <div className="card Customers-style-2">
        <h3 className="Customers-style-3">
          <i className="fa-solid fa-user-plus Customers-style-4"></i> Tiếp nhận
          Khách hàng
        </h3>

        <form onSubmit={handleCreateCustomer} className="Customers-style-5">
          {/* CỘT 1 */}
          <div className="Customers-style-6">
            <div>
              <label className="form-label">TÊN FB</label>
              <input
                type="text"
                name="fbName"
                className="form-control"
                value={formData.fbName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="form-label">NGÀY SINH (Tự nhập)</label>
              <input
                type="text"
                name="dob"
                className="form-control"
                placeholder="VD: 15/08/1998"
                value={formData.dob}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="form-label">NGƯỜI SALE TIẾP NHẬN</label>
              <input
                type="text"
                name="saleInCharge"
                className="form-control"
                placeholder="Tên Sale..."
                value={formData.saleInCharge}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="form-label">XẾP VÀO LỚP</label>
              <input
                list="class-list"
                name="assignClass"
                className="form-control"
                placeholder="Tự nhập hoặc chọn..."
                value={formData.assignClass}
                onChange={handleInputChange}
              />
              <datalist id="class-list">
                <option value="HSK 1" />
                <option value="HSK 2" />
              </datalist>
            </div>
          </div>

          {/* CỘT 2 */}
          <div className="Customers-style-7">
            <div>
              <label className="form-label">NGÀY NHẬN (Tự nhập)</label>
              <input
                type="text"
                name="receiveDate"
                className="form-control"
                placeholder="VD: 11/06/2026"
                value={formData.receiveDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="form-label">QUỐC GIA</label>
              <input
                type="text"
                name="country"
                className="form-control"
                value={formData.country}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="form-label">TRẠNG THÁI (*)</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option>Mới</option>
                <option>Đang tư vấn</option>
                <option>Đã ĐK</option>
              </select>
            </div>
            <div>
              <label className="form-label">LOẠI LỚP</label>
              <input
                list="type-list"
                name="classType"
                className="form-control"
                placeholder="Tự nhập..."
                value={formData.classType}
                onChange={handleInputChange}
              />
              <datalist id="type-list">
                <option value="Lớp Nhóm" />
                <option value="Lớp 1-1" />
              </datalist>
            </div>
          </div>

          {/* CỘT 3 */}
          <div className="Customers-style-8">
            <div>
              <label className="form-label">HỌ TÊN</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="form-label">NGUỒN</label>
              <select
                name="source"
                className="form-control"
                value={formData.source}
                onChange={handleInputChange}
              >
                <option>Facebook</option>
                <option>Tiktok</option>
                <option>Giới thiệu</option>
              </select>
            </div>
            <div className="Customers-style-9">
              <div className="Customers-style-10">
                <label className="form-label">HỌC PHÍ (VNĐ)</label>
                <input
                  type="number"
                  name="fee"
                  className="form-control"
                  value={formData.fee}
                  onChange={handleInputChange}
                />
              </div>
              <div className="Customers-style-11">
                <label className="form-label">SỐ BUỔI</label>
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
              <label className="form-label">VIỆC TIẾP THEO</label>
              <input
                type="text"
                name="nextAction"
                className="form-control"
                value={formData.nextAction}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* CỘT 4 */}
          <div className="Customers-style-12">
            <div>
              <label className="form-label Customers-style-13">
                SĐT (Zalo) (*)
              </label>
              <input
                type="text"
                name="phone"
                className="form-control Customers-style-14"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="form-label">LOẠI NGÔN NGỮ</label>
              <select
                name="language"
                className="form-control"
                value={formData.language}
                onChange={handleInputChange}
              >
                <option>Tiếng Trung</option>
                <option>Tiếng Anh</option>
              </select>
            </div>
            <div>
              <label className="form-label">TRÌNH ĐỘ</label>
              <input
                type="text"
                name="level"
                className="form-control"
                value={formData.level}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="form-label">LIÊN HỆ CUỐI</label>
              <input
                type="date"
                name="lastContact"
                className="form-control"
                value={formData.lastContact}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="Customers-style-15">
            <button
              type="submit"
              className="btn btn-primary Customers-style-16"
            >
              LƯU THÔNG TIN
            </button>
          </div>
        </form>
      </div>

      {/* BẢNG DANH SÁCH KHÁCH HÀNG */}
      <div className="card Customers-style-17">
        <div className="Customers-style-18">
          <h3 className="Customers-style-19">
            <i className="fa-solid fa-list-ul"></i> Danh sách Khách hàng
          </h3>
          <input
            type="text"
            className="form-control Customers-style-20"
            placeholder="🔍 Lọc theo tên, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <table className="Customers-style-21">
          <thead className="Customers-style-22">
            <tr>
              <th className="Customers-style-23">STT</th>
              <th>NGÀY NHẬN</th>
              <th>KHÁCH HÀNG</th>
              <th>SALE PHỤ TRÁCH</th>
              <th>KHÓA HỌC</th>
              <th>TRẠNG THÁI</th>
              <th className="Customers-style-24">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {displayCustomers.map((c, index) => (
              <tr key={index} className="Customers-style-25">
                <td className="Customers-style-26">{index + 1}</td>
                <td>{c.receiveDate}</td>
                <td>
                  <strong className="Customers-style-27">
                    {c.name || c.fbName || "Khách chưa có tên"}
                  </strong>
                  <span className="Customers-style-28">
                    <i className="fa-solid fa-phone"></i> {c.phone}
                  </span>
                </td>
                <td>{c.saleInCharge || "Chưa chia"}</td>
                <td>{c.assignClass}</td>
                <td>
                  <span
                    style={{
                      backgroundColor:
                        c.status === "Đã ĐK" ? "#dcfce7" : "#e0e7ff",
                      color: c.status === "Đã ĐK" ? "#166534" : "#3730a3",
                      padding: "4px 10px",
                      borderRadius: "50px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                    }}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="Customers-style-29">
                  <button title="Xóa" className="Customers-style-30">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default Customers;
