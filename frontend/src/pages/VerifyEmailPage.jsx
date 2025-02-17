import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const VerifyEmailPage = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [expiryTime, setExpiryTime] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { completeSignup } = useAuthContext();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    // Lấy thời gian hết hạn từ localStorage hoặc tạo mới
    const storedExpiry = localStorage.getItem(`verification_expiry_${email}`);
    if (storedExpiry) {
      setExpiryTime(parseInt(storedExpiry));
    } else {
      const newExpiryTime = Date.now() + 5 * 60 * 1000; // 5 phút
      setExpiryTime(newExpiryTime);
      localStorage.setItem(`verification_expiry_${email}`, newExpiryTime.toString());
    }
  }, [email, navigate]);

  useEffect(() => {
    if (!expiryTime) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, expiryTime - Date.now());
      if (remaining === 0) {
        clearInterval(timer);
        localStorage.removeItem(`verification_expiry_${email}`);
        navigate('/register');
      }
      setTimeLeft(Math.floor(remaining / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime, email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setError('');
    setLoading(true);
    try {
      const success = await completeSignup(email, verificationCode);
      if (success) {
        localStorage.removeItem(`verification_expiry_${email}`);
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !timeLeft) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          We sent a verification code to {email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4">
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter verification code"
                />
              </div>
            </div>

           
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Time remaining: {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
