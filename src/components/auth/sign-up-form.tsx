'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { CloudUpload } from '@mui/icons-material';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import { useState, useEffect } from 'react';
const schema = zod.object({
  nom: zod.string().min(1, { message: 'Le nom est requis' }),
  prenom: zod.string().min(1, { message: 'Le prénom est requis' }),
  email: zod.string().min(1, { message: 'L’email est requis' }).email(),
  telephone: zod.string().min(10, { message: 'Le téléphone est requis' }),
  statut: zod.string().min(1, { message: 'Le statut est requis' }),
  password: zod.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
  photo: zod.instanceof(File, { message: 'Une image est requise' }).optional()
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  statut: '',
  password: '',
  photo: undefined
} satisfies Values;

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const selectedFile = watch("photo");

  useEffect(() => {
    if (selectedFile instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    }
  }, [selectedFile]);

  const onSubmit = async (values: Values): Promise<void> => {
    setIsPending(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Erreur inconnue');
        setIsPending(false);
        return;
      }

      router.push('/auth/sign-in');
    } catch (error) {
      setErrorMessage('Quelque chose s’est mal passé');
      console.error('Erreur:', error);
      setIsPending(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Inscription</Typography>
      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <Stack spacing={2}>
          <Controller
            control={control}
            name="nom"
            render={({ field }) => (
              <FormControl error={Boolean(errors.nom)}>
                <InputLabel>Nom</InputLabel>
                <OutlinedInput {...field} label="Nom" />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="prenom"
            render={({ field }) => (
              <FormControl error={Boolean(errors.prenom)}>
                <InputLabel>Prénom</InputLabel>
                <OutlinedInput {...field} label="Prénom" />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email</InputLabel>
                <OutlinedInput {...field} label="Email" type="email" />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="telephone"
            render={({ field }) => (
              <FormControl error={Boolean(errors.telephone)}>
                <InputLabel>Téléphone</InputLabel>
                <OutlinedInput {...field} label="Téléphone" />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="statut"
            render={({ field }) => (
              <FormControl error={Boolean(errors.statut)}>
                <InputLabel>Statut</InputLabel>
                <Select {...field} label="Statut">
                  <MenuItem value="vacataire">Vacataire</MenuItem>
                  <MenuItem value="permanent">Permanent</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Mot de passe</InputLabel>
                <OutlinedInput {...field} label="Mot de passe" type="password" />
              </FormControl>
            )}
          />
          <FormControl error={Boolean(errors.photo)}>
            <Stack direction="column" spacing={1} alignItems="center">
              {photoPreview ? (
                <Avatar src={photoPreview} sx={{ width: 100, height: 100 }} />
              ) : (
                <Avatar sx={{ width: 100, height: 100, bgcolor: 'grey.300' }} />
              )}
              <Button variant="contained" component="label" startIcon={<CloudUpload />}>
                Choisir votre photo
                <input type="file" accept="image/*" hidden onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setValue("photo", e.target.files[0]);
                  }
                }} />
              </Button>
            </Stack>
          </FormControl>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <Button disabled={isPending} type="submit" variant="contained">Inscription</Button>
        </Stack>
      </form>
      <Typography color="text.secondary" variant="body2">
    Vous êtes déjà inscrit ?{' '}
    <Link component={NextLink} href="/auth/sign-in" passHref underline="hover" variant="subtitle2">
  Connectez-vous
</Link>
  </Typography>
    </Stack>
  );
}
