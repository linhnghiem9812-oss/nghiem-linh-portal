import "../styles/pages/FinanceLog.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
});

function FinanceLog() {
  const { addNotification } = useNotification();
  const [invoices, setInvoices] = useState([]);
  const todayStr = new Date().toISOString().split("T")[0];

  const [formInvoice, setFormInvoice] = useState({
    date: todayStr,
    studentName: "",
    course: "Khóa học HSK 1",
    amount: "",
    amountJpy: "",
    amountCny: "",
    method: "Chuyển khoản ngân hàng",
    notes: "",
  });

  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  useEffect(() => {
    api
      .get("/invoices")
      .then((res) => {
        const sortedData = res.data.sort((a, b) => b.id - a.id);
        setInvoices(sortedData);
      })
      .catch(() => console.log("Chưa có hóa đơn trong CSDL."));
  }, []);

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    if (
      !formInvoice.studentName ||
      (!formInvoice.amount && !formInvoice.amountJpy && !formInvoice.amountCny)
    ) {
      addNotification("Vui lòng điền tên học viên và ít nhất 1 loại tiền (VNĐ, JPY hoặc CNY)!", "error", "finance");
      return;
    }
    const dateParts = formInvoice.date.split("-");
    const formattedDate =
      dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : formInvoice.date;

    const newInv = {
      date: formattedDate,
      studentName: formInvoice.studentName,
      course: formInvoice.course,
      amount: parseInt(formInvoice.amount) || 0,
      amountJpy: parseInt(formInvoice.amountJpy) || 0,
      amountCny: parseInt(formInvoice.amountCny) || 0,
      method: formInvoice.method,
      notes: formInvoice.notes,
      status: "Đã thanh toán",
    };
    try {
      const res = await api.post("/invoices", newInv);
      setInvoices([res.data, ...invoices]);
      setFormInvoice({
        date: todayStr,
        studentName: "",
        course: "Khóa học HSK 1",
        amount: "",
        amountJpy: "",
        amountCny: "",
        method: "Chuyển khoản ngân hàng",
        notes: "",
      });
      addNotification("Hệ thống: Ghi nhận hóa đơn thu học phí thành công!", "success", "finance");
    } catch (error) {
      addNotification("Lỗi lưu hóa đơn vào CSDL!", "error", "finance");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        ...editingInvoice,
        amount: parseInt(editingInvoice.amount) || 0,
        amountJpy: parseInt(editingInvoice.amountJpy) || 0,
        amountCny: parseInt(editingInvoice.amountCny) || 0,
      };
      const res = await api.put(`/invoices/${editingInvoice.id}`, payload);
      setInvoices(invoices.map((inv) => (inv.id === editingInvoice.id ? res.data : inv)));
      setEditingInvoice(null);
      addNotification("Cập nhật hóa đơn thành công!", "success", "finance");
    } catch (error) {
      addNotification("Lỗi cập nhật CSDL!", "error", "finance");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Cảnh báo: Việc xóa hóa đơn sẽ làm thay đổi báo cáo doanh thu. Xác nhận xóa?")) {
      try {
        await api.delete(`/invoices/${id}`);
        setInvoices(invoices.filter((inv) => inv.id !== id));
        addNotification("Đã xóa hóa đơn!", "success", "finance");
      } catch (error) {
        addNotification("Lỗi khi xóa hóa đơn!", "error", "finance");
      }
    }
  };

  const totalCollectedVnd = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalCollectedJpy = invoices.reduce((sum, inv) => sum + (inv.amountJpy || 0), 0);
  const totalCollectedCny = invoices.reduce((sum, inv) => sum + (inv.amountCny || 0), 0);

  return (
    <div className="FinanceLog-style-1">
      {/* BANNER TỔNG DOANH THU */}
      <div className="card FinanceLog-style-2">
        <div className="FinanceLog-style-3">
          <div>
            <span className="FinanceLog-style-4">Tổng dòng tiền học phí đã thu</span>
            <div className="FinanceLog-style-5">
              <h2 className="FinanceLog-style-6">{totalCollectedVnd.toLocaleString("vi-VN")} VNĐ</h2>
              {totalCollectedJpy > 0 && (
                <h2 className="FinanceLog-style-7">+ {totalCollectedJpy.toLocaleString("vi-VN")} ¥ (JPY)</h2>
              )}
              {totalCollectedCny > 0 && (
                <h2 className="FinanceLog-style-8">+ {totalCollectedCny.toLocaleString("vi-VN")} ¥ (CNY)</h2>
              )}
            </div>
          </div>
          <i className="fa-solid fa-vault FinanceLog-style-9"></i>
        </div>
      </div>

      {/* LƯỚI CHÍNH: FORM LẬP HÓA ĐƠN & BẢNG LỊCH SỬ */}
      <div className="my-portal-grid FinanceLog-style-10">
        <div className="portal-left-column">
          <div className="card FinanceLog-style-11">
            <h3 className="FinanceLog-style-12">
              <i className="fa-solid fa-file-invoice-dollar"></i> Lập hóa đơn thu phí
            </h3>
            <form onSubmit={handleAddInvoice} className="FinanceLog-style-13">
              <div>
                <label className="FinanceLog-style-14">Ngày nộp tiền</label>
                <input
                  type="date"
                  className="form-control"
                  value={formInvoice.date}
                  onChange={(e) => setFormInvoice({ ...formInvoice, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="FinanceLog-style-15">Tên học viên đóng phí</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={formInvoice.studentName}
                  onChange={(e) => setFormInvoice({ ...formInvoice, studentName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="FinanceLog-style-16">Chương trình đăng ký</label>
                <select
                  className="form-control"
                  value={formInvoice.course}
                  onChange={(e) => setFormInvoice({ ...formInvoice, course: e.target.value })}
                >
                  <option value="Khóa học HSK 1">Khóa học HSK 1</option>
                  <option value="Khóa học HSK 2">Khóa học HSK 2</option>
                  <option value="Khóa học HSK 3">Khóa học HSK 3</option>
                  <option value="Lớp VIP 1-1">Lớp VIP 1-1</option>
                </select>
              </div>

              {/* 3 Ô NHẬP TIỀN TỆ */}
              <div className="FinanceLog-style-17">
                <div className="FinanceLog-style-18">
                  <label className="FinanceLog-style-19">Tiền VNĐ</label>
                  <input
                    type="number"
                    className="form-control FinanceLog-style-20"
                    placeholder="0"
                    value={formInvoice.amount}
                    onChange={(e) => setFormInvoice({ ...formInvoice, amount: e.target.value })}
                  />
                </div>
                <div className="FinanceLog-style-21">
                  <label className="FinanceLog-style-22">Tiền JPY (Yên)</label>
                  <input
                    type="number"
                    className="form-control FinanceLog-style-23"
                    placeholder="0"
                    value={formInvoice.amountJpy}
                    onChange={(e) => setFormInvoice({ ...formInvoice, amountJpy: e.target.value })}
                  />
                </div>
                <div className="FinanceLog-style-24">
                  <label className="FinanceLog-style-25">Tiền CNY (Tệ)</label>
                  <input
                    type="number"
                    className="form-control FinanceLog-style-26"
                    placeholder="0"
                    value={formInvoice.amountCny}
                    onChange={(e) => setFormInvoice({ ...formInvoice, amountCny: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="FinanceLog-style-27">Hình thức thanh toán</label>
                <select
                  className="form-control"
                  value={formInvoice.method}
                  onChange={(e) => setFormInvoice({ ...formInvoice, method: e.target.value })}
                >
                  <option value="Chuyển khoản ngân hàng">Chuyển khoản ngân hàng</option>
                  <option value="Tiền mặt tại quầy">Tiền mặt tại quầy</option>
                  <option value="Quẹt thẻ POS">Quẹt thẻ POS</option>
                </select>
              </div>

              <div>
                <label className="FinanceLog-style-28">Ghi chú thêm</label>
                <textarea
                  className="form-control FinanceLog-style-29"
                  rows="2"
                  placeholder="Ví dụ: Đóng học phí đợt 1..."
                  value={formInvoice.notes}
                  onChange={(e) => setFormInvoice({ ...formInvoice, notes: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="FinanceLog-style-30">
                XUẤT HÓA ĐƠN THU TIỀN
              </button>
            </form>
          </div>
        </div>

        <div className="portal-right-column">
          <div className="card FinanceLog-style-31">
            <h3 className="FinanceLog-style-32">Nhật ký giao dịch dòng tiền</h3>
            <div className="FinanceLog-style-33">
              <table className="FinanceLog-style-34">
                <thead>
                  <tr className="FinanceLog-style-35">
                    <th className="FinanceLog-style-36">Mã / Ngày</th>
                    <th className="FinanceLog-style-37">Học viên / Nội dung</th>
                    {/* Thêm mobile-hidden để ẩn trên điện thoại */}
                    <th className="FinanceLog-style-38 mobile-hidden">Số tiền đã nộp</th>
                    <th className="FinanceLog-style-39 mobile-hidden">Trạng thái</th>
                    <th className="FinanceLog-style-40 mobile-hidden">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan="5" className="FinanceLog-style-41">
                        Chưa có hóa đơn nào được ghi nhận.
                      </td>
                    </tr>
                  )}
                  {invoices.map((inv) => (
                    <tr 
                      key={inv.id} 
                      className="FinanceLog-style-42"
                      onClick={() => setViewingInvoice(inv)} /* Click để mở Menu chi tiết */
                    >
                      <td className="FinanceLog-style-43">
                        <strong style={{ fontSize: "0.75rem" }}>INV-{inv.id}</strong>
                        <span className="FinanceLog-style-44">{inv.date}</span>
                      </td>
                      <td className="FinanceLog-style-45">
                        <strong className="FinanceLog-style-46">{inv.studentName}</strong>
                        <span className="FinanceLog-style-47">
                          {inv.course}
                        </span>
                        {/* Ẩn ghi chú ra khỏi màn hình ngoài cho gọn */}
                      </td>
                      
                      {/* 3 Cột này sẽ bị ẩn trên điện thoại */}
                      <td className="FinanceLog-style-49 mobile-hidden">
                        {(inv.amount > 0 || (!inv.amount && !inv.amountJpy && !inv.amountCny)) && (
                          <div className="FinanceLog-style-50">{(inv.amount || 0).toLocaleString("vi-VN")} đ</div>
                        )}
                        {inv.amountJpy > 0 && (
                          <div className="FinanceLog-style-51">{inv.amountJpy.toLocaleString("vi-VN")} ¥</div>
                        )}
                        {inv.amountCny > 0 && (
                          <div className="FinanceLog-style-52">{inv.amountCny.toLocaleString("vi-VN")} ¥</div>
                        )}
                      </td>
                      <td className="FinanceLog-style-53 mobile-hidden">
                        <span className="FinanceLog-style-54">{inv.status}</span>
                      </td>
                      <td className="FinanceLog-style-55 mobile-hidden">
                        <div className="FinanceLog-style-56">
                          <button
                            title="Sửa"
                            onClick={(e) => { e.stopPropagation(); setEditingInvoice({ ...inv }); }}
                            className="FinanceLog-style-57"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button
                            title="Xóa"
                            onClick={(e) => { e.stopPropagation(); handleDelete(inv.id); }}
                            className="FinanceLog-style-58"
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
        </div>
      </div>

      {/* MODAL SỬA HÓA ĐƠN */}
      {editingInvoice && (
        <div className="FinanceLog-style-59" onClick={() => setEditingInvoice(null)}>
          <div className="FinanceLog-style-60" onClick={(e) => e.stopPropagation()}>
            <div className="FinanceLog-style-61">
              <h3 className="FinanceLog-style-62">
                <i className="fa-solid fa-file-invoice-dollar"></i> Sửa Hóa Đơn INV-{editingInvoice.id}
              </h3>
              <button onClick={() => setEditingInvoice(null)} className="FinanceLog-style-63">✖</button>
            </div>
            <div className="FinanceLog-style-64">
              <div>
                <label className="FinanceLog-style-65">Ngày nộp (DD/MM/YYYY)</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingInvoice.date || ""}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, date: e.target.value })}
                />
              </div>
              <div>
                <label className="FinanceLog-style-66">Học viên</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingInvoice.studentName || ""}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, studentName: e.target.value })}
                />
              </div>
              <div>
                <label className="FinanceLog-style-67">Khóa học / Nội dung</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingInvoice.course || ""}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, course: e.target.value })}
                />
              </div>

              {/* 3 Ô NHẬP TIỀN TỆ TRONG MODAL */}
              <div className="FinanceLog-style-68">
                <div className="FinanceLog-style-69">
                  <label className="FinanceLog-style-70">Số tiền (VNĐ)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editingInvoice.amount || ""}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, amount: e.target.value })}
                  />
                </div>
                <div className="FinanceLog-style-71">
                  <label className="FinanceLog-style-72">Số tiền (JPY)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editingInvoice.amountJpy || ""}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, amountJpy: e.target.value })}
                  />
                </div>
                <div className="FinanceLog-style-73">
                  <label className="FinanceLog-style-74">Số tiền (CNY)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editingInvoice.amountCny || ""}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, amountCny: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="FinanceLog-style-75">Hình thức</label>
                <select
                  className="form-control"
                  value={editingInvoice.method}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, method: e.target.value })}
                >
                  <option value="Chuyển khoản ngân hàng">Chuyển khoản ngân hàng</option>
                  <option value="Tiền mặt tại quầy">Tiền mặt tại quầy</option>
                  <option value="Quẹt thẻ POS">Quẹt thẻ POS</option>
                </select>
              </div>

              <div>
                <label className="FinanceLog-style-76">Ghi chú thêm</label>
                <textarea
                  className="form-control FinanceLog-style-77"
                  rows="2"
                  value={editingInvoice.notes || ""}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, notes: e.target.value })}
                ></textarea>
              </div>
            </div>
            <div className="FinanceLog-style-78">
              <button className="FinanceLog-style-79" onClick={handleSaveEdit}>
                <i className="fa-solid fa-floppy-disk"></i> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL XEM CHI TIẾT HÓA ĐƠN (Dành cho Mobile khi bấm vào) 
      ======================================================== */}
      {viewingInvoice && (
        <div className="FinanceLog-style-59" onClick={() => setViewingInvoice(null)}>
          <div className="FinanceLog-style-60" onClick={(e) => e.stopPropagation()}>
            <div className="FinanceLog-style-61">
              <h3 className="FinanceLog-style-62">
                <i className="fa-solid fa-circle-info"></i> Chi tiết Giao dịch
              </h3>
              <button onClick={() => setViewingInvoice(null)} className="FinanceLog-style-63">✖</button>
            </div>
            
            <div className="FinanceLog-style-64" style={{ gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>Mã Hóa Đơn:</span>
                <strong style={{ color: '#0f172a' }}>INV-{viewingInvoice.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>Ngày nộp:</span>
                <strong style={{ color: '#0f172a' }}>{viewingInvoice.date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>Học viên:</span>
                <strong style={{ color: 'var(--primary)' }}>{viewingInvoice.studentName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>Nội dung:</span>
                <strong style={{ color: '#0f172a', textAlign: 'right', maxWidth: '60%' }}>{viewingInvoice.course}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>Hình thức:</span>
                <strong style={{ color: '#0f172a', textAlign: 'right', maxWidth: '60%' }}>{viewingInvoice.method}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>Số tiền đã nộp:</span>
                <div style={{ textAlign: 'right' }}>
                  {(viewingInvoice.amount > 0 || (!viewingInvoice.amount && !viewingInvoice.amountJpy && !viewingInvoice.amountCny)) && (
                    <div style={{ fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>{(viewingInvoice.amount || 0).toLocaleString("vi-VN")} đ</div>
                  )}
                  {viewingInvoice.amountJpy > 0 && (
                    <div style={{ fontWeight: '800', color: '#059669', marginBottom: '4px' }}>{viewingInvoice.amountJpy.toLocaleString("vi-VN")} ¥ (JPY)</div>
                  )}
                  {viewingInvoice.amountCny > 0 && (
                    <div style={{ fontWeight: '800', color: '#ea580c' }}>{viewingInvoice.amountCny.toLocaleString("vi-VN")} ¥ (CNY)</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>Trạng thái:</span>
                <span className="FinanceLog-style-54">{viewingInvoice.status}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>Ghi chú:</span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap' }}>
                  {viewingInvoice.notes || "Không có ghi chú"}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button 
                style={{ flex: 1, padding: '12px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '700' }}
                onClick={() => { handleDelete(viewingInvoice.id); setViewingInvoice(null); }}
              >
                <i className="fa-solid fa-trash"></i> Xóa
              </button>
              <button 
                style={{ flex: 1, padding: '12px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '700' }}
                onClick={() => { setEditingInvoice(viewingInvoice); setViewingInvoice(null); }}
              >
                <i className="fa-solid fa-pen"></i> Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinanceLog;
