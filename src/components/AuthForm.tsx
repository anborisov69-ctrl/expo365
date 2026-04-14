"use client";

import { FormEvent, useState } from "react";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState<"EXHIBITOR" | "BUYER">("BUYER");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "register"
            ? { email, password, fullName, role, companyName: role === "EXHIBITOR" ? companyName : undefined }
            : { email, password }
        )
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setErrorMessage(data.error ?? "Ошибка авторизации");
        return;
      }

      window.location.href = mode === "register" ? "/feed" : "/feed";
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-expoBlue">{mode === "register" ? "Регистрация" : "Вход"}</h1>
      {mode === "register" && (
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="ФИО"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />
      )}
      <input
        className="w-full rounded border px-3 py-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <input
        className="w-full rounded border px-3 py-2"
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      {mode === "register" && (
        <>
          <select
            className="w-full rounded border px-3 py-2"
            value={role}
            onChange={(event) => setRole(event.target.value as "EXHIBITOR" | "BUYER")}
          >
            <option value="BUYER">Посетитель (байер)</option>
            <option value="EXHIBITOR">Экспонент (продавец)</option>
          </select>
          {role === "EXHIBITOR" && (
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="Название компании"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              required
            />
          )}
        </>
      )}
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <button disabled={isLoading} className="w-full rounded bg-expoOrange px-4 py-2 text-white disabled:opacity-60">
        {isLoading ? "Отправка..." : mode === "register" ? "Создать аккаунт" : "Войти"}
      </button>
    </form>
  );
}
