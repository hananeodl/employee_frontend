'use client';

import { useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from './SignUpForm.module.css';  // Import CSS module

export function SignUpForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/sign-up", { username, email, password });
      setSuccess(`Utilisateur ${response.data.username} enregistré avec succès !`);
      setUsername("");
      setEmail("");
      setPassword("");
      setTimeout(() => router.push("/auth/sign-in"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Erreur lors de l’inscription");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Inscription</h1>

      {error && <p className={styles.messageError}>{error}</p>}
      {success && <p className={styles.messageSuccess}>{success}</p>}

      <form onSubmit={handleRegister} className={styles.form}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          S’inscrire
        </button>
      </form>

      <p className={styles.textCenter}>
        Déjà un compte ?{' '}
        <Link href="/auth/sign-in" className={styles.link}>
          Connectez-vous
        </Link>
      </p>
    </div>
  );
}
