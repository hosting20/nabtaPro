import AuthForm from '@/components/AuthForm.jsx';

export const metadata = { title: 'إنشاء حساب — نبتة' };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
