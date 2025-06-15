'use client'

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm, SubmitHandler, FieldValues } from 'react-hook-form'; // Ajout de SubmitHandler et FieldValues
import { z as zod } from 'zod';
import { useState } from 'react';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email est requis' }).email({ message: 'Email invalide' }),
  password: zod.string().min(1, { message: 'Mot de passe est requis' }),
});

interface ApiResponse {
  token: string;
  message?: string;
}

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  // Ajout du type SubmitHandler<FieldValues> pour la fonction onSubmit
  const onSubmit: SubmitHandler<FieldValues> = React.useCallback(async (values) => {
    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data: ApiResponse = await response.json(); // Typage de la réponse

      console.log('Réponse API:', data);

      if (!response.ok) {
        throw new Error(data.message ?? 'Erreur de connexion');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        console.log('Token reçu :', data.token);
      }

      // Vérifier si le token est bien stocké avant de rediriger
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Token stocké avec succès');
        router.replace('/professeurs');
      } else {
        console.error('Erreur : Token non stocké.');
      }
    } catch (error: unknown) {
      // Typage spécifique pour l'erreur
      if (error instanceof Error) {
        setErrorMessage(error.message || 'Une erreur est survenue.');
      } else {
        setErrorMessage('Une erreur inconnue est survenue.');
      }
    } finally {
      setIsPending(false);
    }
  }, [router]);

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Connexion</Typography>
        <Typography color="text.secondary" variant="body2">
          Vous n&apos;avez pas de compte ?{' '}
          <Link component={RouterLink} href="/auth/sign-up" underline="hover" variant="subtitle2">
            Inscrivez-vous
          </Link>
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)} fullWidth>
                <InputLabel>Email</InputLabel>
                <OutlinedInput {...field} label="Email" type="email" autoComplete="email" />
                {errors.email && <FormHelperText>{errors.email.message as React.ReactNode}</FormHelperText>}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)} fullWidth>
                <InputLabel>Mot de passe</InputLabel>
                <OutlinedInput
                  {...field}
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  endAdornment={
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                    </button>
                  }
                />
                {errors.password && <FormHelperText>{errors.password.message as React.ReactNode}</FormHelperText>}
              </FormControl>
            )}
          />
          <div>
            <Link component={RouterLink} href="/forgot-password" variant="subtitle2">
              Mot de passe oublié ?
            </Link>
          </div>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <Button disabled={isPending} type="submit" variant="contained" fullWidth>
            {isPending ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
