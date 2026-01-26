import { db } from "../db";

export const getSetting = async (key, defaultValue = null) => {
  try {
    const setting = await db.settings.get(key);
    return setting ? setting.value : defaultValue;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return defaultValue;
  }
};

export const setSetting = async (key, value) => {
  try {
    await db.settings.put({ key, value });
    return true;
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    return false;
  }
};

export const getBalanzaId = async () => {
    return await getSetting('balanza', 1); // Default to 1
}

export const getMaxLocalSales = async () => {
    return await getSetting('max_local_sales', 500); // Default to 500
}

export const getTheme = async () => {
    return await getSetting('theme', 'light');
}
