const DAILY_AMOUNT_API =
  'https://script.google.com/macros/s/AKfycbxnfKPs7jbDuqpq2J_p_tomUm1Q0QHYsji0RQyQkd5YSgjUwlaljW_smsXBT1lgMzL2DA/exec?action=dailyMinimumAmount';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch(DAILY_AMOUNT_API);
    const result = await response.json();

    if (result.success && result.data && result.data.amount != null) {
      const amountElement = document.querySelector('.recruitment-highlight strong');

      if (amountElement) {
        const amount = Number(result.data.amount);

        amountElement.textContent =
          amount.toLocaleString('fa-IR') + ' تومان';
      }
    }
  } catch (error) {
    console.error('خطا در دریافت مبلغ حداقل کار روزانه:', error);
  }
});
