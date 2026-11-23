/* script.js */
document.addEventListener('DOMContentLoaded', function() {
  // Search form validation
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      const destination = document.getElementById('destination').value.trim();
      const checkin = document.getElementById('checkin').value;
      const checkout = document.getElementById('checkout').value;
      if (!destination || !checkin || !checkout) {
        e.preventDefault();
        alert('请填写所有必填项。');
      } else if (checkin > checkout) {
        e.preventDefault();
        alert('离开日期不能早于入住日期。');
      }
    });
  }

  // Booking form validation
  const bookingForm = document.getElementById('bookingForm');
  const bookingBtn = document.getElementById('bookingBtn');
  const messageDiv = document.getElementById('message');

  if (bookingForm) {
    bookingBtn.addEventListener('click', function() {
      const checkin = document.getElementById('checkin').value;
      const checkout = document.getElementById('checkout').value;
      if (!checkin || !checkout) {
        messageDiv.textContent = '请选择入住和离开日期。';
        return;
      }
      if (checkin > checkout) {
        messageDiv.textContent = '离开日期不能早于入住日期。';
        return;
      }
      messageDiv.textContent = '正在查找可用房型，请稍候...';
      // Simulate a short delay
      setTimeout(function() {
        messageDiv.textContent = '搜索完成，可继续预订。';
      }, 1000);
    });
  }
});
