import { useSQLiteContext } from "expo-sqlite";
import * as Crypto from "expo-crypto";

export type UserCreate = {
  name: string;
  email: string;
  password: string; // Senha em texto puro, será hashada antes de salvar
};

export type UserResponse = {
  id: number;
  name: string;
  email: string;
  password: string; // Hash armazenado
  created_at: string;
  updated_at: string;
};

export function useUsersDatabase() {
  const database = useSQLiteContext();

  // Função interna auxiliar para gerar o Hash SHA-256 da senha
  async function hashPassword(password: string): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
  }

  // 1. Cadastrar Usuário com Senha Criptografada
  async function create(data: UserCreate) {
    // Criptografa a senha antes de gravar no banco
    const hashedPassword = await hashPassword(data.password);

    const statement = await database.prepareAsync(`
      INSERT INTO users (name, email, password)
      VALUES ($name, $email, $password)
    `);

    try {
      const result = await statement.executeAsync({
        $name: data.name,
        $email: data.email,
        $password: hashedPassword,
      });

      return result.lastInsertRowId;
    } finally {
      await statement.finalizeAsync();
    }
  }

  // 2. Validar Login (Compara o hash da senha informada com o do banco)
  async function verifyLogin(email: string, pass: string) {
    const hashedPassword = await hashPassword(pass);

    return await database.getFirstAsync<UserResponse>(
      `SELECT id, name, email FROM users WHERE email = $email AND password = $password`,
      {
        $email: email,
        $password: hashedPassword,
      }
    );
  }

  // 3. Listar todos os usuários (Para a tela provisória de testes)
  async function listAll() {
    return await database.getAllAsync<UserResponse>(`
      SELECT id, name, email, password, created_at FROM users ORDER BY id DESC
    `);
  }

  return {
    create,
    verifyLogin,
    listAll,
  };
}