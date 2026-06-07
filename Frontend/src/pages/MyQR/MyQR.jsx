import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import QRCode from "qrcode.react"; //  เอาปีกกาออก
import { Download, Share2 } from "lucide-react";
import Swal from "sweetalert2";

const MyQR = () => {
  const { user, isStudent } = useAuth();

  const handleDownload = () => {
    const canvas = document.getElementById("qr-canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = `my-qr-code-${user?.username}.png`;
      link.href = canvas.toDataURL();
      link.click();

      Swal.fire({
        title: "ดาวน์โหลดสำเร็จ",
        text: "ดาวน์โหลด QR Code เรียบร้อยแล้ว",
        icon: "success",
        confirmButtonColor: "#667eea",
      });
    }
  };

  const handleShare = async () => {
    const canvas = document.getElementById("qr-canvas");
    if (canvas) {
      try {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve));
        const file = new File([blob], "qr-code.png", { type: "image/png" });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "QR Code ของฉัน",
            text: `QR Code สำหรับระบบออมทรัพย์นักเรียน - ${user?.fullName}`,
          });
        } else {
          Swal.fire({
            title: "ไม่รองรับการแชร์",
            text: "เบราว์เซอร์ของคุณไม่รองรับการแชร์ไฟล์ กรุณาใช้ดาวน์โหลดแทน",
            icon: "info",
            confirmButtonColor: "#667eea",
          });
        }
      } catch (error) {
        console.error("Share error:", error);
      }
    }
  };

  if (!isStudent()) {
    return (
      <div className="text-center py-5">
        <h3>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h3>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center">
      <h2 className="fw-bold mb-4">QR Code ของฉัน</h2>

      <div className="card p-5 text-center" style={{ maxWidth: "400px" }}>
        <div className="mb-4">
          <img
            src="https://img2.pic.in.th/unnamed-removebg-preview3a1bc4db8f4389e5.png"
            alt="Logo"
            style={{ height: "60px", marginBottom: "16px" }}
          />
          <h4 className="fw-bold">{user?.fullName}</h4>
          <p className="text-muted mb-2">{user?.username}</p>
          <div className="badge bg-primary fs-6">
            ยอดเงินออม:{" "}
            {new Intl.NumberFormat("th-TH", {
              style: "currency",
              currency: "THB",
            }).format(user?.balance || 0)}
          </div>
        </div>

        <div className="mb-4 d-flex justify-content-center">
          <QRCode
            id="qr-canvas"
            value={user?.qrCodeData || ""}
            size={200}
            level="H"
            includeMargin={true}
            renderAs="canvas"
          />
        </div>

        <div className="mb-3">
          <code className="small text-muted">{user?.qrCodeData}</code>
        </div>

        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={18} className="me-2" />
            ดาวน์โหลด
          </button>
          <button className="btn btn-outline-primary" onClick={handleShare}>
            <Share2 size={18} className="me-2" />
            แชร์
          </button>
        </div>

        <div className="mt-4 text-start">
          <div className="alert alert-info">
            <strong>วิธีใช้:</strong>
            <ul className="mb-0 mt-2 small">
              <li>แสดง QR Code นี้ให้ Admin สแกนเพื่อทำรายการฝาก/ถอนเงิน</li>
              <li>สามารถดาวน์โหลด QR Code เพื่อบันทึกไว้ในอุปกรณ์ของคุณ</li>
              <li>
                QR Code นี้เป็นเอกลักษณ์ส่วนบุคคล กรุณาเก็บไว้อย่างระมัดระวัง
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyQR;
