import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();
monday.setToken(process.env.REACT_APP_ACCESS_TOKEN);

class MondayDb {
  constructor(key) {
    this.key = key;
  }

  async get() {
    try {
      const data = await monday.storage.getItem(this.key)
      let storageObj = data.data
      return { success: true, data: storageObj.value ? JSON.parse(storageObj.value) : [] }
    } catch (error) {
      console.error("Error getting db data:", error);
      return { success: false, message: "Failed to get data from monday db" };
    }
  }
  async create(newObject) {
    try {
      const data = await this.get();
      if (!data.success) return data;
      const updatedConfig = [...data.data, newObject];
      await monday.storage.setItem(this.key, JSON.stringify(updatedConfig));
      return { success: true, message: "Configuration created successfully" };
    } catch (error) {
      console.error("Error creating configuration:", error);
      return { success: false, message: "Failed to create configuration" };
    }
  }

  async updateByIndex(index, updatedObject) {
    try {
      const data = await this.get();
      if (!data.success) return data;

      const updatedConfig = [...data.data];
      updatedConfig[index] = updatedObject;

      await monday.storage.setItem(this.key, JSON.stringify(updatedConfig));
      return { success: true, message: "Configuration updated successfully" };
    } catch (error) {
      console.error("Error updating configuration:", error);
      return { success: false, message: "Failed to update to monday db" };
    }
  }

  async deleteByIndex(index) {
    try {
      const data = await this.get();
      if (!data.success) return data;

      const updatedConfig = data.data.filter((_, i) => i !== index);

      await monday.storage.setItem(this.key, JSON.stringify(updatedConfig));
      return { success: true, message: "Data deleted successfully" };
    } catch (error) {
      console.error("Error deleting configuration:", error);
      return { success: false, message: "Failed to delete data on monday db" };
    }
  }
}

export { monday, MondayDb};

