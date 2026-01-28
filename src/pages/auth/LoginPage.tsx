import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BackButton } from '../../components/ui/BackButton';

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [formErrors, setFormErrors] = useState({ email: '', password: '' });

    const validate = () => {
        let valid = true;
        const errors = { email: '', password: '' };

        if (!formData.email) {
            errors.email = 'El email es obligatorio';
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Ingresa un email válido';
            valid = false;
        }

        if (!formData.password) {
            errors.password = 'La contraseña es obligatoria';
            valid = false;
        }

        setFormErrors(errors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validate()) return;

        setLoading(true);

        try {
            const success = await login(formData.email, formData.password);
            if (success) {
                navigate('/');
            } else {
                setError('Credenciales inválidas. Intenta con admin@admin.com / admin123');
            }
        } catch (err) {
            setError('Ocurrió un error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 relative">
            <BackButton />
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Bienvenido de nuevo</h1>
                    <p className="text-gray-500 mt-2">Ingresa a tu cuenta para continuar</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100 flex items-center justify-center gap-2">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <Input
                            type="text"
                            value={formData.email}
                            onChange={e => {
                                setFormData({ ...formData, email: e.target.value });
                                if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                            }}
                            placeholder="tu@email.com"
                            className={formErrors.email ? 'border-red-500 focus:ring-red-200' : ''}
                        />
                        {formErrors.email && (
                            <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Contraseña</label>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={e => {
                                setFormData({ ...formData, password: e.target.value });
                                if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                            }}
                            placeholder="••••••••"
                            className={formErrors.password ? 'border-red-500 focus:ring-red-200' : ''}
                        />
                        {formErrors.password && (
                            <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
                        )}
                    </div>

                    <Button className="w-full text-base h-12" disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    ¿No tienes cuenta?{' '}
                    <Link to="/auth/register" className="font-semibold text-primary-600 hover:text-primary-700">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}
