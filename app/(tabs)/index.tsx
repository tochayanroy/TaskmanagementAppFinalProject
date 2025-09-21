import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type Task = {
  _id: string;
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  dueDate?: string;
};

export default function index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState<string>("");

  // form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<Task["status"]>("Pending");
  const [formPriority, setFormPriority] = useState<Task["priority"]>("Low");
  const [editingId, setEditingId] = useState<string | null>(null);

  const statuses: Task["status"][] = ["Pending", "In Progress", "Completed"];
  const priorities: Task["priority"][] = ["Low", "Medium", "High"];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      setLoading(true);
      const response = await axios.get(`https://taskbackend.tochayanroy.in/task/getAllTask`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      Alert.alert("Error", "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const truncateByWords = (text: string, limit: number) => {
    if (!text) return "";
    if (text.length <= limit) return text;
    return text.slice(0, limit) + "...";
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormTitle("");
    setFormDescription("");
    setFormStatus("Pending");
    setFormPriority("Low");
    setModalVisible(true);
  };

  const handleEdit = (task: Task) => {
    setEditingId(task._id);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormStatus(task.status);
    setFormPriority(task.priority);
    setModalVisible(true);
  };

  const handleDelete = async (taskId: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("auth_token");
            await axios.delete(`https://taskbackend.tochayanroy.in/task/deleteTask/${taskId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            Alert.alert("Success", "Task deleted successfully");
            fetchTasks();
          } catch (error) {
            console.error("Error deleting task:", error);
            Alert.alert("Error", "Failed to delete task");
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        Alert.alert("Error", "Authentication token missing");
        return;
      }

      const taskData = {
        title: formTitle,
        description: formDescription,
        status: formStatus,
        priority: formPriority,
        dueDate: new Date().toISOString(),
      };

      if (editingId) {
        await axios.put(
          `https://taskbackend.tochayanroy.in/task/updateTask/${editingId}`,
          taskData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Alert.alert("Success", "Task updated successfully");
      } else {
        await axios.post(
          `https://taskbackend.tochayanroy.in/task/createTask`,
          taskData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Alert.alert("Success", "Task created successfully");
      }

      setModalVisible(false);
      fetchTasks();
    } catch (error: any) {
      console.error("Error saving task:", error);
      Alert.alert("Error", error.response?.data?.error || "Failed to save task");
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.taskTitle}>{truncateByWords(item.title, 20)}</Text>
        <View style={styles.badges}>
          <Text
            style={[
              styles.status,
              item.status === "Completed"
                ? { backgroundColor: "#4CAF50" }
                : item.status === "In Progress"
                  ? { backgroundColor: "#FF9800" }
                  : { backgroundColor: "#F44336" },
            ]}
          >
            {item.status}
          </Text>
          <Text
            style={[
              styles.priority,
              item.priority === "High"
                ? { color: "#F44336" }
                : item.priority === "Medium"
                  ? { color: "#FF9800" }
                  : { color: "#4CAF50" },
            ]}
          >
            {item.priority}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        {truncateByWords(item.description, 50)}
      </Text>

      {item.dueDate && (
        <Text style={styles.dueDate}>
          Due: {new Date(item.dueDate).toLocaleDateString()}
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="create-outline" size={20} color="#1a73e8" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { marginLeft: 18 }]}
          onPress={() => handleDelete(item._id)}
        >
          <Ionicons name="trash-outline" size={20} color="#f44336" />
          <Text style={[styles.actionText, { color: "#f44336" }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={renderTask}
        contentContainerStyle={{ padding: 15, paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No tasks found. Add a new task to get started!</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.modalTitle}>
                {editingId ? "Edit Task" : "Add New Task"}
              </Text>

              <TextInput
                placeholder="Task Title *"
                style={styles.input}
                value={formTitle}
                onChangeText={setFormTitle}
              />

              <TextInput
                placeholder="Description"
                style={[styles.input, { height: 100 }]}
                multiline
                value={formDescription}
                onChangeText={setFormDescription}
              />

              <Text style={styles.label}>Status</Text>
              <View style={styles.optionRow}>
                {statuses.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setFormStatus(s)}
                    style={[
                      styles.optionBtn,
                      formStatus === s && styles.optionBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formStatus === s && styles.optionTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { marginTop: 12 }]}>Priority</Text>
              <View style={styles.optionRow}>
                {priorities.map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setFormPriority(p)}
                    style={[
                      styles.optionBtn,
                      formPriority === p && styles.optionBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formPriority === p && styles.optionTextActive,
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#00c6ff", "#0072ff"]}
                  style={styles.addBtnBg}
                >
                  <Text style={styles.addBtnText}>
                    {editingId ? "Save Changes" : "Save Task"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 8 }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ textAlign: "center", color: "#666" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTitle: { fontSize: 16, fontWeight: "700", color: "#222" },
  description: { fontSize: 14, color: "#666", marginVertical: 8 },
  dueDate: { fontSize: 12, color: "#888", marginBottom: 8 },
  badges: { flexDirection: "row", alignItems: "center" },
  status: {
    color: "#fff",
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 8,
  },
  priority: { fontSize: 13, fontWeight: "600" },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  actionBtn: { flexDirection: "row", alignItems: "center" },
  actionText: { fontSize: 14, fontWeight: "500", color: "#1a73e8" },
  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#1a73e8",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 15,
    color: "#333",
  },
  label: { fontSize: 13, color: "#444", marginBottom: 6 },
  optionRow: { flexDirection: "row", alignItems: "center" },
  optionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  optionBtnActive: {
    borderColor: "#0072ff",
    backgroundColor: "#eaf4ff",
  },
  optionText: { fontSize: 13, color: "#333" },
  optionTextActive: { color: "#0072ff", fontWeight: "700" },
  addBtn: { marginTop: 14, borderRadius: 12, overflow: "hidden" },
  addBtnBg: { paddingVertical: 12, alignItems: "center", borderRadius: 12 },
  addBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});