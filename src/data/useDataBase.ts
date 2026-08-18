export type AlertCreate = {
  user_id: number
  latitude: number
  longitude: number
  title: string
  category?: string | null
  status?: string | null
  ilink?: string | null
  observation?: string | null
}

export type AlertResponse = {
  id: number
  user_id: number
  user_name: string
  user_email: string
  latitude: number
  longitude: number
  title: string
  category: string | null
  status: string
  ilink: string | null
  observation: string | null
  created_at: string
  updated_at: string
}

export type AlertUpdate = Partial<Omit<AlertCreate, "user_id">> & {
  id: number
}

import { useSQLiteContext } from "expo-sqlite"

export function useAlertsDatabase() {
  const database = useSQLiteContext()

  // 1. Criar novo alerta
  async function create(data: AlertCreate) {
    const statement = await database.prepareAsync(`
      INSERT INTO alerts (
        user_id, 
        latitude, 
        longitude, 
        title, 
        category, 
        status, 
        ilink, 
        observation
      )
      VALUES (
        $user_id, 
        $latitude, 
        $longitude, 
        $title, 
        $category, 
        $status, 
        $ilink, 
        $observation
      )
    `)

    try {
      const result = await statement.executeAsync({
        $user_id: data.user_id,
        $latitude: data.latitude,
        $longitude: data.longitude,
        $title: data.title,
        $category: data.category ?? null,
        $status: data.status ?? "open",
        $ilink: data.ilink ?? null,
        $observation: data.observation ?? null,
      })

      return result.lastInsertRowId
    } finally {
      await statement.finalizeAsync()
    }
  }

  // 2. Listar todos os alertas (com dados do usuário criador)
  async function listAll() {
    return await database.getAllAsync<AlertResponse>(`
      SELECT 
        alerts.id,
        alerts.user_id,
        alerts.latitude,
        alerts.longitude,
        alerts.title,
        alerts.category,
        alerts.status,
        alerts.ilink,
        alerts.observation,
        alerts.created_at,
        alerts.updated_at,
        users.name AS user_name,
        users.email AS user_email
      FROM alerts
      INNER JOIN users ON users.id = alerts.user_id
      ORDER BY alerts.created_at DESC
    `)
  }

  // 3. Buscar um alerta específico pelo ID
  async function show(id: number) {
    return await database.getFirstAsync<AlertResponse>(
      `
      SELECT 
        alerts.id,
        alerts.user_id,
        alerts.latitude,
        alerts.longitude,
        alerts.title,
        alerts.category,
        alerts.status,
        alerts.ilink,
        alerts.observation,
        alerts.created_at,
        alerts.updated_at,
        users.name AS user_name,
        users.email AS user_email
      FROM alerts
      INNER JOIN users ON users.id = alerts.user_id
      WHERE alerts.id = $id
    `,
      { $id: id }
    )
  }

  // 4. Atualizar um alerta existente
  async function update(data: AlertUpdate) {
    const statement = await database.prepareAsync(`
      UPDATE alerts SET
        title = COALESCE($title, title),
        category = COALESCE($category, category),
        status = COALESCE($status, status),
        ilink = COALESCE($ilink, ilink),
        observation = COALESCE($observation, observation),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $id
    `)

    try {
      await statement.executeAsync({
        $id: data.id,
        $title: data.title ?? null,
        $category: data.category ?? null,
        $status: data.status ?? null,
        $ilink: data.ilink ?? null,
        $observation: data.observation ?? null,
      })
    } finally {
      await statement.finalizeAsync()
    }
  }

  // 5. Apagar alerta
  async function remove(id: number) {
    await database.runAsync("DELETE FROM alerts WHERE id = ?", id)
  }

  return {
    create,
    listAll,
    show,
    update,
    remove,
  }
}