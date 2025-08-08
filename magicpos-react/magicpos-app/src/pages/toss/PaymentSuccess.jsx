// pages/PaymentSuccess.jsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPayment } from '../apis/menu';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      try {
        await confirmPayment({ paymentKey, orderId, amount: parseInt(amount) });
        alert('결제가 완료되었습니다!');
        navigate('/menu');
      } catch (error) {
        console.error('결제 확인 실패:', error);
        alert('결제 확인에 실패했습니다.');
      }
    };

    handlePaymentSuccess();
  }, [searchParams, navigate]);

  return <div>결제 처리 중...</div>;
}

export default PaymentSuccess;