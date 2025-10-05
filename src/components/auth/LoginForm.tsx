'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '@/hooks/useUser';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { EyeIcon, EyeCloseIcon } from '@/icons';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, error, isLoading, clearError } = useAuthActions();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Effacer l'erreur quand l'utilisateur tape
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    try {
      const result = await login(formData);
      
      if (result.user && result.token) {
        // La redirection sera gérée par l'AuthProvider
        router.push('/');
      }
    } catch (err) {
      console.error('Erreur lors de la connexion:', err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Connexion
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connectez-vous à votre compte
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={formData.email}
            onChange={handleChange}
            placeholder="votre@email.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="password">
            Mot de passe <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              defaultValue={formData.password}
              onChange={handleChange}
              placeholder="Votre mot de passe"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeCloseIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Se souvenir de moi
            </span>
          </label>

          <a
            href="/reset-password"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Mot de passe oublié ?
          </a>
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading || !formData.email || !formData.password}
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pas encore de compte ?{' '}
          <a
            href="/signup"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Créer un compte
          </a>
        </p>
      </div>
    </div>
  );
}
