import AuthForm from '@/components/AuthForm.jsx';

export const metadata = { title: 'تسجيل الدخول — نبتة' };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
