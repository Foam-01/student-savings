import Swal from 'sweetalert2';

const INDIGO = '#4f46e5';

Swal.mixin({
  confirmButtonColor: INDIGO,
  cancelButtonColor: '#64748b',
});

export default Swal;
