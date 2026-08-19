import { useSQLiteContext } from "expo-sqlite";

export type AlertResponse = {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  latitude: number;
  longitude: number;
  title: string;
  category?: string;
  status: string;
  ilink?: string;
  observation?: string;
  zip?: string;
  number?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  complement?: string;
  created_at: string;
  updated_at: string;
};

export type CreateAlertData = {
  user_id: number;
  latitude: number;
  longitude: number;
  title: string;
  category?: string;
  status?: string;
  ilink?: string;
  observation?: string;
  zip?: string;
  number?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  complement?: string;
};

export function useAlertsDatabase() {
  const database = useSQLiteContext();

  async function create(data: CreateAlertData) {
    const statement = await database.prepareAsync(`
      INSERT INTO alerts (
        user_id, latitude, longitude, title, category, status, ilink, observation,
        zip, number, street, neighborhood, city, complement
      ) VALUES (
        $user_id, $latitude, $longitude, $title, $category, $status, $ilink, $observation,
        $zip, $number, $street, $neighborhood, $city, $complement
      )
    `);

    try {
      const result = await statement.executeAsync({
        $user_id: data.user_id,
        $latitude: data.latitude,
        $longitude: data.longitude,
        $title: data.title,
        $category: data.category || "Buraco",
        $status: data.status || "open",
        $ilink: data.ilink || null,
        $observation: data.observation || null,
        $zip: data.zip || null,
        $number: data.number || null,
        $street: data.street || null,
        $neighborhood: data.neighborhood || null,
        $city: data.city || null,
        $complement: data.complement || null,
      });

      return result.lastInsertRowId;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function update(id: number, data: Partial<CreateAlertData>) {
    const statement = await database.prepareAsync(`
      UPDATE alerts SET
        title = COALESCE($title, title),
        category = COALESCE($category, category),
        status = COALESCE($status, status),
        ilink = COALESCE($ilink, ilink),
        observation = COALESCE($observation, observation),
        zip = COALESCE($zip, zip),
        number = COALESCE($number, number),
        street = COALESCE($street, street),
        neighborhood = COALESCE($neighborhood, neighborhood),
        city = COALESCE($city, city),
        complement = COALESCE($complement, complement),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $id
    `);

    try {
      await statement.executeAsync({
        $id: id,
        $title: data.title || null,
        $category: data.category || null,
        $status: data.status || null,
        $ilink: data.ilink || null,
        $observation: data.observation || null,
        $zip: data.zip || null,
        $number: data.number || null,
        $street: data.street || null,
        $neighborhood: data.neighborhood || null,
        $city: data.city || null,
        $complement: data.complement || null,
      });
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function listAll(): Promise<AlertResponse[]> {
    try {
      const query = `
        SELECT 
          alerts.*,
          users.name as user_name,
          users.email as user_email
        FROM alerts
        INNER JOIN users ON users.id = alerts.user_id
        ORDER BY alerts.created_at DESC
      `;
      const response = await database.getAllAsync<AlertResponse>(query);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function getById(id: number): Promise<AlertResponse | null> {
    try {
      const query = `
        SELECT 
          alerts.*,
          users.name as user_name,
          users.email as user_email
        FROM alerts
        INNER JOIN users ON users.id = alerts.user_id
        WHERE alerts.id = ?
      `;
      const response = await database.getFirstAsync<AlertResponse>(query, [id]);
      return response || null;
    } catch (error) {
      throw error;
    }
  }

  async function remove(id: number) {
    try {
      await database.runAsync("DELETE FROM alerts WHERE id = ?", [id]);
    } catch (error) {
      throw error;
    }
  }

  return { create, update, listAll, getById, remove };
}