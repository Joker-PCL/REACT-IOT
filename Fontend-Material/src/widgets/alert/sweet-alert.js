import Swal from 'sweetalert2';

export function alert_success(message) {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });

  Toast.fire({
    icon: 'success',
    title: message || 'บันทึกข้อมูลเรียบร้อยแล้ว',
  });
}

export function alert_failed(message) {
  Swal.fire({
    position: 'center',
    icon: 'error',
    title: message || 'เกิดข้อผิดพลาด!',
    showConfirmButton: false,
    timer: 1500
  })
}

export function alert_delete(message) {
  return Swal.fire({
    title: 'ลบข้อมูล!',
    text: `ต้องการลบข้อมูล ${message || ""}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ลบข้อมูล!'
  })
}
