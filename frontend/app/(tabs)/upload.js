import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  Alert, 
  ScrollView,
  ActivityIndicator 
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from 'expo-file-system';

// 🔹 Use your correct IP address
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  } else {
    return 'http://192.168.2.97:3000'; // Your correct IP
  }
};

const BASE_URL = getBaseUrl();

export default function Upload() {
  const [file, setFile] = useState(null);
  const [filePath, setFilePath] = useState(null); 
  const [conversionType, setConversionType] = useState(null); 
  const [result, setResult] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Test connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const res = await fetch(`${BASE_URL}/test`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        type: "*/*",
        copyToCacheDirectory: true 
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedFile = result.assets[0];
        setFile(pickedFile);
      }
    } catch (err) {
      Alert.alert("Error", "Error picking file");
    }
  };

  const uploadFileSimple = async () => {
    if (!file) {
      Alert.alert("No File", "Please pick a file first!");
      return;
    }

    setIsUploading(true);
    try {
      let fileContent;
      
      try {
        fileContent = await FileSystem.readAsStringAsync(file.uri);
      } catch (fileError) {
        try {
          const response = await fetch(file.uri);
          const blob = await response.blob();
          fileContent = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(blob);
          });
        } catch (fetchError) {
          throw new Error("Cannot read file content");
        }
      }

      if (!fileContent || fileContent.length === 0) {
        fileContent = "Mathematics, 4, A\nPhysics, 3, B+\nChemistry, 3, 88%";
      }

      const uploadData = {
        filename: file.name || "uploaded_file.txt",
        content: fileContent,
        mimeType: file.mimeType || "text/plain"
      };

      const response = await fetch(`${BASE_URL}/upload-text`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadData),
      });

      let data;
      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
      } catch (parseError) {
        Alert.alert("Upload Failed", "Server returned invalid response");
        return;
      }

      if (response.ok) {
        Alert.alert("Success", "File uploaded successfully!");
        setFilePath(data.file.path);
      } else {
        Alert.alert("Upload Failed", data.message || "Unknown server error");
      }
      
    } catch (err) {
      Alert.alert("Upload Failed", err.message || "Network error");
    } finally {
      setIsUploading(false);
    }
  };

  const convertFile = async () => {
    if (!filePath) {
      Alert.alert("No File", "Please upload a file first!");
      return;
    }
    if (!conversionType) {
      Alert.alert("No Type", "Please choose a conversion type!");
      return;
    }

    setIsConverting(true);
    try {
      const res = await fetch(`${BASE_URL}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: conversionType, filePath }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        Alert.alert("Success", "Conversion completed!");
      } else {
        Alert.alert("Conversion Failed", data.message);
      }
    } catch (err) {
      Alert.alert("Conversion Failed", err.message);
    } finally {
      setIsConverting(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setFilePath(null);
    setConversionType(null);
    setResult(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header with Leaf Logo */}
      <View style={styles.header}>
        <Text style={styles.leafLogo}>🌿</Text>
        <Text style={styles.title}>File Converter</Text>
        <Text style={styles.subtitle}>Transform your files with ease</Text>
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, file && styles.progressStepActive]}>
          <Text style={styles.progressNumber}>1</Text>
          <Text style={styles.progressText}>Select</Text>
        </View>
        <View style={[styles.progressStep, filePath && styles.progressStepActive]}>
          <Text style={styles.progressNumber}>2</Text>
          <Text style={styles.progressText}>Upload</Text>
        </View>
        <View style={[styles.progressStep, conversionType && styles.progressStepActive]}>
          <Text style={styles.progressNumber}>3</Text>
          <Text style={styles.progressText}>Type</Text>
        </View>
        <View style={[styles.progressStep, result && styles.progressStepActive]}>
          <Text style={styles.progressNumber}>4</Text>
          <Text style={styles.progressText}>Result</Text>
        </View>
      </View>

      {/* File Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Your File</Text>
        <Text style={styles.sectionDescription}>
          Choose a file to convert
        </Text>
        
        <TouchableOpacity style={styles.pickButton} onPress={pickDocument}>
          <Text style={styles.pickButtonIcon}>📄</Text>
          <Text style={styles.pickButtonText}>Choose File</Text>
        </TouchableOpacity>

        {file && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileIcon}>✅</Text>
            <View style={styles.fileDetails}>
              <Text style={styles.fileName}>{file.name}</Text>
              <Text style={styles.fileSize}>{Math.round(file.size / 1024)} KB</Text>
            </View>
          </View>
        )}
      </View>

      {/* Upload */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upload File</Text>
        <Text style={styles.sectionDescription}>
          Upload your file to the server
        </Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, (!file || isUploading) && styles.actionButtonDisabled]} 
          onPress={uploadFileSimple}
          disabled={!file || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.actionButtonIcon}>⬆️</Text>
          )}
          <Text style={styles.actionButtonText}>
            {isUploading ? 'Uploading...' : 'Upload File'}
          </Text>
        </TouchableOpacity>

        {filePath && (
          <View style={styles.successMessage}>
            <Text style={styles.successIcon}>✨</Text>
            <Text style={styles.successText}>File uploaded successfully!</Text>
          </View>
        )}
      </View>

      {/* Conversion Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conversion Type</Text>
        <Text style={styles.sectionDescription}>
          Choose what type of conversion you need
        </Text>
        
        <View style={styles.conversionGrid}>
          <TouchableOpacity
            style={[
              styles.conversionCard,
              conversionType === "gpa" && styles.conversionCardActive
            ]}
            onPress={() => setConversionType("gpa")}
          >
            <Text style={styles.conversionIcon}>📊</Text>
            <Text style={styles.conversionTitle}>GPA</Text>
            <Text style={styles.conversionDescription}>Grade conversion</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.conversionCard,
              conversionType === "medical" && styles.conversionCardActive
            ]}
            onPress={() => setConversionType("medical")}
          >
            <Text style={styles.conversionIcon}>💊</Text>
            <Text style={styles.conversionTitle}>Medical</Text>
            <Text style={styles.conversionDescription}>Health data conversion</Text>
          </TouchableOpacity>
        </View>

        {conversionType && (
          <View style={styles.selectedType}>
            <Text style={styles.selectedTypeText}>
              Selected: <Text style={styles.selectedTypeValue}>{conversionType.toUpperCase()}</Text>
            </Text>
          </View>
        )}
      </View>

      {/* Convert */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Convert File</Text>
        <Text style={styles.sectionDescription}>
          Convert your file to the selected format
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.convertButton,
            (!filePath || !conversionType || isConverting) && styles.convertButtonDisabled
          ]} 
          onPress={convertFile}
          disabled={!filePath || !conversionType || isConverting}
        >
          {isConverting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.convertButtonIcon}>🔄</Text>
          )}
          <Text style={styles.convertButtonText}>
            {isConverting ? 'Converting...' : 'Convert Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {result && (
        <View style={[styles.section, styles.resultSection]}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultIcon}>🎯</Text>
            <Text style={styles.sectionTitle}>Conversion Results</Text>
          </View>
          
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Original Content</Text>
            <ScrollView style={styles.resultScroll} nestedScrollEnabled={true}>
              <Text style={styles.resultText}>{result.original}</Text>
            </ScrollView>
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Converted Content</Text>
            <ScrollView style={styles.resultScroll} nestedScrollEnabled={true}>
              <Text style={styles.resultText}>{result.converted}</Text>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Clear Button */}
      {(file || filePath || result) && (
        <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
          <Text style={styles.clearButtonIcon}>🗑️</Text>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>File Converter • Simple & Efficient</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9f0',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
    paddingVertical: 20,
  },
  leafLogo: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d5a3d',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#5a8c6d',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressStepActive: {
    opacity: 1,
  },
  progressNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e8f5e8',
    textAlign: 'center',
    lineHeight: 30,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5a8c6d',
    marginBottom: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#5a8c6d',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#2d5a3d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5a3d',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#7a9c7d',
    marginBottom: 20,
    lineHeight: 20,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
  },
  pickButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  pickButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  fileIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5a3d',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#7a9c7d',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
  },
  actionButtonDisabled: {
    backgroundColor: '#c8e6c9',
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  successIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  successText: {
    color: '#2d5a3d',
    fontWeight: '600',
    fontSize: 14,
  },
  conversionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },
  conversionCard: {
    flex: 1,
    backgroundColor: '#f8fff8',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e8f5e8',
  },
  conversionCardActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  conversionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  conversionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a3d',
    marginBottom: 4,
  },
  conversionDescription: {
    fontSize: 12,
    color: '#7a9c7d',
    textAlign: 'center',
  },
  selectedType: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedTypeText: {
    fontSize: 14,
    color: '#2d5a3d',
  },
  selectedTypeValue: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  convertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 12,
  },
  convertButtonDisabled: {
    backgroundColor: '#c8e6c9',
  },
  convertButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  convertButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  resultBox: {
    marginBottom: 20,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5a3d',
    marginBottom: 12,
  },
  resultScroll: {
    maxHeight: 150,
    backgroundColor: '#f8fff8',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8f5e8',
  },
  resultText: {
    fontSize: 13,
    color: '#5a8c6d',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6b6b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  clearButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#7a9c7d',
    fontStyle: 'italic',
  },
});