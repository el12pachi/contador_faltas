import LoginPage from '../components/login/Login';

export const metadata = {
  title: 'Inicia sesión | Contador de Faltas',
  description:
    'Accede para gestionar y monitorear las faltas de asistencia.',
};

export default function LoginRoute() {
  return <LoginPage />;
}
