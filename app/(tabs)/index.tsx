import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
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
  id: string;
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
};

export default function index() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Finish React Native Project",
      description: "Complete UI & integrate backend nfv dkfn vjdf vdfhbkv dfhvbdsvdhsvdhk jdvbjdhv dsiyvdshgvcisdyjhcg sidjcghds c",
      status: "In Progress",
      priority: "High",
    },
    {
      id: "2",
      title: "Buy Groceries",
      description: "Milk, Eggs, Bread",
      status: "Pending",
      priority: "Medium",
    },
    {
      id: "3",
      title: "Workout",
      description: "1 hour gym session",
      status: "Completed",
      priority: "Low",
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);

  // form state (for both add & edit)
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<Task["status"]>("Pending");
  const [formPriority, setFormPriority] = useState<Task["priority"]>("Low");
  const [editingId, setEditingId] = useState<string | null>(null);

  const statuses: Task["status"][] = ["Pending", "In Progress", "Completed"];
  const priorities: Task["priority"][] = ["Low", "Medium", "High"];


  const truncateByWords = (text: string, limit: number) => {
    const noSpaces = text.replace(/\s+/g, "");
    if (noSpaces.length > limit) {
      return noSpaces.slice(0, limit) + "..."; // 100 char + ...
    }
    return noSpaces;
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
    setEditingId(task.id);
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormStatus(task.status);
    setFormPriority(task.priority);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    alert("Confirm Delete", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setTasks((prev) => prev.filter((t) => t.id !== id)),
      },
    ]);
  };

  const handleSave = () => {
    const titleTrimmed = formTitle.trim();
    if (!titleTrimmed) {
      alert("Validation", "Please enter a task title.");
      return;
    }

    if (editingId) {
      // update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
              ...t,
              title: formTitle,
              description: formDescription,
              status: formStatus,
              priority: formPriority,
            }
            : t
        )
      );
    } else {
      // add
      const newTask: Task = {
        id: Date.now().toString(),
        title: formTitle,
        description: formDescription,
        status: formStatus,
        priority: formPriority,
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    setModalVisible(false);
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.taskTitle}>{truncateByWords(item.title, 30)}</Text>

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
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#f44336" />
          <Text style={[styles.actionText, { color: "#f44336" }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={{ padding: 15, paddingBottom: 120 }}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal for Add / Edit */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
              <Text style={styles.modalTitle}>
                {editingId ? "Edit Task" : "Add New Task"}
              </Text>

              <TextInput
                placeholder="Task Title"
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

  // FAB
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

  // Modal
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